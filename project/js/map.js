const width = 800;
const height = 600;
const tooltip = d3.select(".tooltip");

// Projection function
const createProjection = (svg) => {
    return d3.geoMercator()
        .scale(500)  // Adjust scale for a better fit
        .translate([svg.attr("width") / 2, svg.attr("height") / 2]);
};

// Render map
const renderMap = (svgId, geojsonUrl) => {
    const svg = d3.select(`#${svgId}`);
    const projection = createProjection(svg);
    const path = d3.geoPath().projection(projection);

    // Load GeoJSON from the URL
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

// Render both maps
renderMap("map1", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_14192889.json");
renderMap("map2", "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/ipc_geoson_18151797.json");
