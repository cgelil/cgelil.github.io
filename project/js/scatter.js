// scatter.js
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item2");

    // Set margins and dimensions
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear any previous SVG
    d3.select(container).selectAll("*").remove();

    // Create the SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Load and process the data
    d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_ipc_adm2.csv").then(data => {
        // Parse data
        data.forEach(d => {
            d.event_id_cnty = +d.event_id_cnty;
            d.Number = +d.Number;
            d.fatalities = +d.fatalities;
        });

        // Set scales for axes
        const xScale = d3.scaleLog()
            .domain([d3.min(data, d => d.event_id_cnty), d3.max(data, d => d.event_id_cnty)])
            .range([0, width]);

        const yScale = d3.scaleLog()
            .domain([d3.min(data, d => d.Number), d3.max(data, d => d.Number)])
            .range([height, 0]);

        // Set color and size scales
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.fatalities)])
            .range([5, 40]);

        // Create the axes
        const xAxis = d3.axisBottom(xScale).ticks(5);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        // Add circles to scatter plot
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.event_id_cnty))
            .attr("cy", d => yScale(d.Number))
            .attr("r", d => sizeScale(d.fatalities))
            .attr("fill", d => colorScale(d["Level 1"]))
            .attr("opacity", 0.7);
    });
});
