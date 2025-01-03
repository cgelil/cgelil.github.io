document.addEventListener("DOMContentLoaded", function () {
    const tooltip = d3.select(".tooltip");

    // Define the width and height for each SVG map
    const width = 500;  // Adjusted width to fit better within the container
    const height = 300; // Adjusted height for consistency

    // Projection function
    const createProjection = (svg) => {
        return d3.geoMercator()
            .scale(500)  // Adjust scale for a better fit
            .translate([width / 2, height / 2]);  // Adjust translation to center the map
    };

    // Render map function
    const renderMap = (svgId, geojsonUrl) => {
        const svg = d3.select(`#${svgId}`).attr("width", width).attr("height", height);
        const projection = createProjection(svg);
        const path = d3.geoPath().projection(projection);

        // Load GeoJSON data from the URL
        d3.json(geojsonUrl)
            .then(geojson => {
                svg.selectAll("path")
                    .data(geojson.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", d => d.properties.color || "#ccc")
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
            })
            .catch(error => {
                console.error(`Error loading GeoJSON data from ${geojsonUrl}: `, error);
            });
    };

    // Call renderMap for each map with respective GeoJSON URL
    renderMap("map1", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_24004104_2021.json");
    renderMap("map2", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_25857808_2022.json");
    renderMap("map3", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_58836462_2023.json");
    renderMap("map4", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_68887616_2024.json");
});