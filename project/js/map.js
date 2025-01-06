document.addEventListener("DOMContentLoaded", function () {
    // Create tooltip
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Function to get the width and height of the container
    const getContainerDimensions = () => {
        const container = document.querySelector(".maps");
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    };

    // Projection function
    const createProjection = (width, height) => {
        // Adjust the scale and translation to fit the map correctly within the container
        return d3.geoMercator()
        .scale(1000)
        .center([46,0 ])
        .translate([400, 400]);
    };

    // Color scale based on overall_phase
    const getColor = (phase) => {
        const colorScale = {
            1: "#cdfacd", // Minimal food insecurity
            2: "#fae61e", // Stressed food insecurity
            3: "#e67800", // Crisis level food insecurity
            4: "#c80000", // Emergency level food insecurity
            5: "#640000"  // Famine level food insecurity
        };
        return colorScale[phase] || "#ccc";  // Default to grey if phase not found
    };

    // Extract year from the GeoJSON URL
    const extractYearFromUrl = (url) => {
        const match = url.match(/_(\d{4})\.json$/);
        return match ? match[1] : "Unknown Year";
    };

    // Render map function
    const renderMap = (svgId, geojsonUrl) => {
        const { width, height } = getContainerDimensions();
        const svg = d3.select(`#${svgId}`).attr("width", width).attr("height", height);
        const projection = createProjection(width, height);
        const path = d3.geoPath().projection(projection);

        const year = extractYearFromUrl(geojsonUrl);
        svg.append("text")
            .attr("x", 100)
            .attr("y", 30) // Adjusted to be closer to the top
            .attr("text-anchor", "middle")
            .attr("class", "map-title")
            .attr("font-size", "24px") // Increased font size
            .attr("fill", "#000") // Ensure the text color is visible
            .text(`${year}`);

        // Load GeoJSON data from the URL
        d3.json(geojsonUrl)
            .then(geojson => {
                console.log("Loaded GeoJSON:", geojson); // Log the GeoJSON data for debugging
                
                svg.selectAll("path")
                    .data(geojson.features)
                    .enter().append("path")
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
