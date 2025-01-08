document.addEventListener("DOMContentLoaded", function () {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "4px");

    const getContainerDimensions = () => {
        const container = document.querySelector(".maps");
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    };

    const createProjection = (width, height) => {
    
    // Make scale responsive to container width
        const scale = Math.min(width, height) * 2.5;
        return d3.geoMercator()
            .scale(scale)
            .center([30, 20])
            .translate([width / 2, height / 3]);
    };

    const getColor = (phase) => {
        const colorScale = {
            1: "#cdfacd",
            2: "#fae61e",
            3: "#e67800",
            4: "#c80000",
            5: "#640000"
        };
        return colorScale[phase] || "#ccc";
    };

    const extractYearFromUrl = (url) => {
        const match = url.match(/_(\d{4})\.json$/);
        const year = match ? match[1] : "First projection";
        const yearLabels = {
            "2021": "May 2021",
            "2022": "May 2022",
            "2023": "Jun 2023",
            "2024": "May 2024"
        };
        return yearLabels[year] || year;
    };

    const updateLegendPosition = (svg, width) => {
    
    // Calculate legend position based on viewport width
        const legendX = Math.min(width * 0.85, width - 80);

        
        // Update phase legend position
        svg.select(".phase-legend")
            .attr("transform", `translate(${legendX}, 80)`);
            
        // Update admin legend position
        svg.select(".admin-legend")
            .attr("transform", `translate(${legendX}, ${20 + 5 * 20 + 60})`);
    };

    const createLegend = (svg, width) => {
        // Phase legend with responsive positioning
        const phaseData = [
            { phase: 1, label: "Phase 1" },
            { phase: 2, label: "Phase 2" },
            { phase: 3, label: "Phase 3" },
            { phase: 4, label: "Phase 4" },
            { phase: 5, label: "Phase 5" }
        ];

        const legend = svg.append("g")
            .attr("class", "phase-legend");

        const legendItems = legend.selectAll(".legend-item")
            .data(phaseData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItems.append("rect")
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", d => getColor(d.phase));

        legendItems.append("text")
            .attr("x", 22)
            .attr("y", 12)
            .text(d => d.label)
            .attr("font-size", "11px");

        // Admin type legend with responsive positioning
        const adminTypes = [
            { type: "Areas", color: "#000" },
            { type: "IDPs", symbol: "●" },
            { type: "Refugees", symbol: "▲" }
        ];

        const adminLegend = svg.append("g")
            .attr("class", "admin-legend");

        const adminItems = adminLegend.selectAll(".admin-item")
            .data(adminTypes)
            .enter()
            .append("g")
            .attr("class", "admin-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
            
        adminItems.each(function(d) {
            const g = d3.select(this);
            if (d.symbol) {
                g.append("text")
                    .attr("x", 0)
                    .attr("y", 12)
                    .attr("text-anchor", "start")
                    .text(d.symbol)
                    .attr("font-size", "16px");
            } else {
                g.append("line")
                    .attr("x1", 0)
                    .attr("y1", 8)
                    .attr("x2", 16)
                    .attr("y2", 8)
                    .attr("stroke", d.color)
                    .attr("stroke-width", 1);
            }
            
            g.append("text")
                .attr("x", 22)
                .attr("y", 12)
                .attr("text-anchor", "start")
                .text(d.type)
                .attr("font-size", "11px");
        });

        // Initial position update
        updateLegendPosition(svg, width);
    };

    const renderMap = (svgId, geojsonUrls) => {
        const container = document.querySelector(".maps");
        let svg, mapGroup, polygonGroup, pointGroup, yearText, currentGeojson;

        const updateDimensions = () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;

            // Update SVG dimensions
            svg.attr("width", width)
               .attr("height", height);

            // Update map projection and paths
            if (currentGeojson) {
                const projection = createProjection(width, height);
                const path = d3.geoPath().projection(projection);

                // Update existing paths
                polygonGroup.selectAll("path")
                    .attr("d", path);

                // Update point positions
                pointGroup.selectAll(".point")
                    .attr("transform", d => {
                        const coords = projection(d.geometry.coordinates);
                        return coords ? `translate(${coords[0]}, ${coords[1]})` : null;
                    });
            }

            // Update legend position
            updateLegendPosition(svg, width);

            // Update source text position
            svg.select(".map-source")
                .attr("y", height - 10);
        };

        // Initial setup
        const { width, height } = getContainerDimensions();
        svg = d3.select(`#${svgId}`)
            .attr("width", width)
            .attr("height", height);

        // Create map groups
        mapGroup = svg.append("g");
        polygonGroup = mapGroup.append("g").attr("class", "polygon-group");
        pointGroup = mapGroup.append("g").attr("class", "point-group");

        // Add title and subtitle with responsive positioning
        svg.append("text")
            .attr("x", 20)
            .attr("y", 30)
            .attr("text-anchor", "left")
            .attr("class", "map-title")
            .attr("font-size", "20px")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .text("Sudan: Acute Food Insecurity");

        svg.append("text")
            .attr("x", 20)
            .attr("y", 50)
            .attr("text-anchor", "left")
            .attr("class", "map-subtitle")
            .attr("font-size", "16px")
            .attr("fill", "#666")
            .text("Current and projected food insecurity phases, 2021 - 2024 | Source: IPC");
        

        yearText = svg.append("text")
            .attr("x", 20)
            .attr("y", 70)
            .attr("text-anchor", "left")
            .attr("class", "map-year")
            .attr("font-size", "16px")
            .attr("fill", "#000");

        createLegend(svg, width);

        // Add resize listener with debounce
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 100);
        });

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                const transform = event.transform;
                mapGroup.attr("transform", transform);
                mapGroup.attr("stroke-width", 1 / transform.k);
            });

        svg.call(zoom);

        let index = 0;
        let interval;

        const updateMap = (geojsonUrl) => {
            const year = extractYearFromUrl(geojsonUrl);
            yearText.text(`${year}`);

            d3.json(geojsonUrl).then(geojson => {
                currentGeojson = geojson; // Store current geojson for resize updates
                const projection = createProjection(width, height);
                const path = d3.geoPath().projection(projection);

                // Separate features by geometry type
                const polygonFeatures = geojson.features.filter(f => 
                    f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
                );
                const pointFeatures = geojson.features.filter(f => f.geometry.type === "Point");

                // Update polygons
                const paths = polygonGroup.selectAll("path")
                    .data(polygonFeatures, d => d.properties.title);

                paths.exit().remove();

                const enterPaths = paths.enter()
                    .append("path")
                    .attr("d", path)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5)
                    .attr("fill-rule", "evenodd");

                paths.merge(enterPaths)
                    .transition()
                    .duration(1500)
                    .attr("d", path)
                    .attr("fill", d => getColor(d.properties.overall_phase));

                // Update points
                const points = pointGroup.selectAll(".point")
                    .data(pointFeatures, d => d.properties.title);

                points.exit().remove();

                const enterPoints = points.enter()
                    .append("g")
                    .attr("class", "point");
            
                enterPoints.append("text")
                    .attr("class", "point-symbol")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "24px")
                    .attr("stroke", "white")
                    .attr("stroke-width", "0.5px")
                    .text(d => d.properties.admin_type === "idp" ? "●" : "▲");

                // Update all point positions and colors
                pointGroup.selectAll(".point")
                    .transition()
                    .duration(1500)
                    .attr("transform", d => {
                        const coords = projection(d.geometry.coordinates);
                        return coords ? `translate(${coords[0]}, ${coords[1]})` : null;
                    })
                    .select(".point-symbol")
                    .attr("fill", d => getColor(d.properties.overall_phase));

                // Add event listeners
                const addEventListeners = (selection) => {
                    selection
                        .on("mouseover", function(event, d) {
                            d3.select(this).style("opacity", 0.8);
                            tooltip.style("visibility", "visible")
                                .style("font-size", "10px")
                                .html(`
                                    <strong>${d.properties.title}</strong><br>
                                    Population in <br>
                                    ${d.properties.admin_type ? `Type: ${d.properties.admin_type.toUpperCase()}<br>` : ''}
                                    <strong>Phase 1:</strong> ${Number(d.properties.phase1_population).toLocaleString()}<br>
                                    <strong>Phase 2: </strong>${Number(d.properties.phase2_population).toLocaleString()}<br>
                                    <strong>Phase 3: </strong>${Number(d.properties.phase3_population).toLocaleString()}<br>
                                    <strong>Phase 4: </strong>${Number(d.properties.phase4_population).toLocaleString()}<br>
                                    <strong>Phase 5: </strong>${Number(d.properties.phase5_population).toLocaleString()}<br>
                                `);
                        })
                        .on("mousemove", function(event) {
                            tooltip.style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select(this).style("opacity", 1);
                            tooltip.style("visibility", "hidden");
                        });
                };

                addEventListeners(polygonGroup.selectAll("path"));
                addEventListeners(pointGroup.selectAll(".point"));

            }).catch(error => {
                console.error(`Error loading GeoJSON data: `, error);
            });
        };

        // Controls setup
        const controlsContainer = d3.select("#slider-container")
            .style("text-align", "center")
            .style("margin-top", "10px");

        const slider = controlsContainer.append("input")
            .attr("type", "range")
            .attr("min", 0)
            .attr("max", geojsonUrls.length - 1)
            .attr("value", 0)
            .style("width", "200px")
            .style("margin-right", "10px")
            .on("input", function() {
                pauseAnimation();
                index = +this.value;
                updateMap(geojsonUrls[index]);
            });

        const button = controlsContainer.append("button")
            .text("⏸")
            .style("font-size", "px")
            .style("color", "black")
            .style("background-color", "white")
            .on("click", function() {
                if (button.text() === "▶") {
                    button.text("⏸");
                    playAnimation();
                } else {
                    button.text("▶");
                    pauseAnimation();
                }
            });

        const playAnimation = () => {
            clearInterval(interval);
            interval = setInterval(() => {
                index = (index + 1) % geojsonUrls.length;
                updateMap(geojsonUrls[index]);
                slider.property("value", index);
            }, 2000);
        };

        const pauseAnimation = () => {
            clearInterval(interval);
        };

        updateMap(geojsonUrls[index]);
        playAnimation(); // Start the animation by default
    };
    
    renderMap("map", [
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_24004104_2021.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_25857808_2022.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_58836462_2023.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_68887616_2024.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_projection_74795267_2024_proj.json"
    ]);
});