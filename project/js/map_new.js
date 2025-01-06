document.addEventListener("DOMContentLoaded", function () {
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const getContainerDimensions = () => {
        const container = document.querySelector(".maps");
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    };

    const createProjection = (width, height) => {
        return d3.geoMercator()
            .scale(800)
            .center([46, 20])
            .translate([width / 2, height / 2]);
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
        return match ? match[1] : "Unknown Year";
    };

    const renderMap = (svgId, geojsonUrls) => {
        const { width, height } = getContainerDimensions();
        const svg = d3.select(`#${svgId}`).attr("width", width).attr("height", height);
        const projection = createProjection(width, height);
        const path = d3.geoPath().projection(projection);

        const yearText = svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("class", "map-title")
            .attr("font-size", "24px")
            .attr("fill", "#000");

        let index = 0;
        let interval;

        const updateMap = (geojsonUrl) => {
            const year = extractYearFromUrl(geojsonUrl);
            yearText.text(year);

            d3.json(geojsonUrl).then(geojson => {
                const paths = svg.selectAll("path").data(geojson.features);

                paths.transition().duration(1000)
                    .attr("d", path)
                    .attr("fill", d => getColor(d.properties.overall_phase))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5);

                paths.enter().append("path")
                    .attr("d", path)
                    .attr("fill", d => getColor(d.properties.overall_phase))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5)
                    .on("mouseover", function (event, d) {
                        d3.select(this).attr("stroke-width", 2);
                        tooltip.style("visibility", "visible")
                            .html(`<strong>${d.properties.title}</strong><br>Population: ${d.properties.estimated_population}`);
                    })
                    .on("mousemove", function (event) {
                        tooltip.style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("stroke-width", 0.5);
                        tooltip.style("visibility", "hidden");
                    });

                paths.exit().remove();
            }).catch(error => {
                console.error(`Error loading GeoJSON data: `, error);
            });
        };

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

        // Add slider control
        const slider = d3.select("#slider-container").append("input")
            .attr("type", "range")
            .attr("min", 0)
            .attr("max", geojsonUrls.length - 1)
            .attr("value", 0)
            .on("input", function () {
                pauseAnimation();
                index = +this.value;
                updateMap(geojsonUrls[index]);
            });

        // Add play/pause button
        const button = d3.select("#slider-container").append("button")
            .text("Play")
            .on("click", function () {
                if (button.text() === "Play") {
                    button.text("Pause");
                    playAnimation();
                } else {
                    button.text("Play");
                    pauseAnimation();
                }
            });

        updateMap(geojsonUrls[index]);
    };

    renderMap("map", [
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_24004104_2021.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_25857808_2022.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_58836462_2023.json",
        "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_68887616_2024.json"
    ]);
});
