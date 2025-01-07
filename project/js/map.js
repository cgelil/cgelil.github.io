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
        return d3.geoMercator()
            .scale(1000)
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

    const createLegend = (svg, width) => {
        // Phase legend
        const phaseData = [
            { phase: 1, label: "Phase 1" },
            { phase: 2, label: "Phase 2" },
            { phase: 3, label: "Phase 3" },
            { phase: 4, label: "Phase 4" },
            { phase: 5, label: "Phase 5" }
        ];

        const legend = svg.append("g")
            .attr("class", "phase-legend")
            .attr("transform", `translate(${width - 120}, 80)`);

        const legendItems = legend.selectAll(".legend-item")
            .data(phaseData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`);

        legendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => getColor(d.phase));

        legendItems.append("text")
            .attr("x", 24)
            .attr("y", 14) // Align text vertically with the rect
            .text(d => d.label)
            .attr("font-size", "12px");

        // Add admin type legend
        const adminTypes = [
            { type: "Areas", color: "#000" },
            { type: "IDPs", symbol: "●" },
            { type: "Refugees", symbol: "▲" }
        ];

        const adminLegend = svg.append("g")
            .attr("class", "admin-legend")
            .attr("transform", `translate(${width - 120}, ${20 + phaseData.length * 25 + 80})`); // Move to the right

        const adminItems = adminLegend.selectAll(".admin-item")
            .data(adminTypes)
            .enter()
            .append("g")
            .attr("class", "admin-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`);

        adminItems.each(function(d) {
            const g = d3.select(this);
            if (d.symbol) {
                g.append("text")
                    .attr("x", 9)
                    .attr("y", 14) // Align text vertically with the symbol
                    .text(d.symbol)
                    .attr("font-size", "18px");
            } else {
                g.append("line")
                    .attr("x1", 0)
                    .attr("y1", 9)
                    .attr("x2", 18)
                    .attr("y2", 9)
                    .attr("stroke", d.color)
                    .attr("stroke-width", 1);
            }
            
            g.append("text")
                .attr("x", 24)
                .attr("y", 14) // Align text vertically with the line
                .text(d.type)
                .attr("font-size", "12px");
        });
    };

    const renderMap = (svgId, geojsonUrls) => {
        const { width, height } = getContainerDimensions();
        const svg = d3.select(`#${svgId}`)
            .attr("width", width)
            .attr("height", height);
        
        const projection = createProjection(width, height);
        const path = d3.geoPath().projection(projection);

        // Create separate groups for polygons and points
        const mapGroup = svg.append("g");
        const polygonGroup = mapGroup.append("g").attr("class", "polygon-group");
        const pointGroup = mapGroup.append("g").attr("class", "point-group");

        // Add title and subtitle
        svg.append("text")
            .attr("x", 20)
            .attr("y", 30)
            .attr("text-anchor", "left")
            .attr("class", "map-title")
            .attr("font-size", "24px")
            .attr("fill", "#000")
            .text("Sudan: Acute Food Insecurity");

        svg.append("text")
            .attr("x", 20)
            .attr("y", 60)
            .attr("text-anchor", "left")
            .attr("class", "map-subtitle")
            .attr("font-size", "16px")
            .attr("fill", "#666")
            .text("Current and projected food insecurity phases, 2021 - 2024");

        const yearText = svg.append("text")
            .attr("x", 20)
            .attr("y", 90)
            .attr("text-anchor", "left")
            .attr("class", "map-year")
            .attr("font-size", "16px")
            .attr("fill", "#000");

        createLegend(svg, width);

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
                    .attr("fill-rule", "evenodd"); // Add fill-rule for MultiPolygons

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
                .attr("stroke", "white") // Add white border
                .attr("stroke-width", "0.5px") // Set border width
                .text(d => d.properties.admin_type === "idp" ? "●" : "▲");

                // Update all point positions and colors
                pointGroup.selectAll(".point")
                    .transition()
                    .duration(1500)
                    .attr("transform", d => {
                        const coords = projection(d.geometry.coordinates);
                        return `translate(${coords[0]}, ${coords[1]})`;
                    })
                    .select(".point-symbol")
                    .attr("fill", d => getColor(d.properties.overall_phase));

                // Add event listeners to both polygons and points
                const addEventListeners = (selection) => {
                    selection
                        .on("mouseover", function(event, d) {
                            d3.select(this).style("opacity", 0.8);
                            tooltip.style("visibility", "visible")
                                .html(`
                                    <strong>${d.properties.title}</strong><br>
                                    ${d.properties.admin_type ? `Type: ${d.properties.admin_type.toUpperCase()}<br>` : ''}
                                    Overall population: ${Number(d.properties.estimated_population).toLocaleString()}<br>
                                    Phase: ${d.properties.overall_phase}
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
            .text("Play")
            .style("padding", "5px 15px")
            .on("click", function() {
                if (button.text() === "Play") {
                    button.text("Pause");
                    playAnimation();
                } else {
                    button.text("Play");
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
    };

    renderMap("map", [
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_24004104_2021.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_25857808_2022.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_58836462_2023.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_68887616_2024.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_projection_74795267_2024_proj.json",
    ]);
});