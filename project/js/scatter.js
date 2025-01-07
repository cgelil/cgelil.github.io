document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item2");

    // Set margins and dimensions
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create dropdown for data selection
    const dropdown = d3.select(container)
        .append("select")
        .attr("id", "dataSelector")
        .style("margin-bottom", "10px");

    const datasets = {
        "ACLED IPC ADM2": "acled_ipc_adm2.csv",
        "ACLED IDP Origin": "acled_idp_2024_origin.csv",
        "ACLED IDP 2024": "acled_idp_2024.csv"
    };

    // Populate dropdown
    dropdown.selectAll("option")
        .data(Object.keys(datasets))
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => datasets[d]);

    // Initial plot with the first dataset
    updatePlot(datasets["ACLED IPC ADM2"]);

    // Update plot on dropdown change
    dropdown.on("change", function () {
        const selectedDataset = d3.select(this).property("value");
        updatePlot(selectedDataset);
    });

    function updatePlot(csvFile) {
        // Clear existing SVG
        d3.select(container).select("svg").remove();

        // Create SVG container
        const svg = d3.select(container)
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Load and process data
        d3.csv(`https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/${csvFile}`).then(data => {
            data.forEach(d => {
                d.event_id_cnty = +d.event_id_cnty;

                if (csvFile === datasets["ACLED IPC ADM2"]) {
                    d.Number = +d.Number;
                    d.fatalities = +d.fatalities;
                } else if (csvFile === datasets["ACLED IDP Origin"]) {
                    d.affected_idps_state = +d.affected_idps_state;
                } else if (csvFile === datasets["ACLED IDP 2024"]) {
                    d.numPresentIdpInd = +d.numPresentIdpInd;
                }
            });

            // Set scales
            const xScale = d3.scaleLog()
                .domain([d3.min(data, d => d.event_id_cnty), d3.max(data, d => d.event_id_cnty)])
                .range([0, width]);

            const yScale = d3.scaleLog()
                .domain([d3.min(data, d => csvFile === datasets["ACLED IPC ADM2"] ? d.Number : (csvFile === datasets["ACLED IDP Origin"] ? d.affected_idps_state : d.numPresentIdpInd)),
                        d3.max(data, d => csvFile === datasets["ACLED IPC ADM2"] ? d.Number : (csvFile === datasets["ACLED IDP Origin"] ? d.affected_idps_state : d.numPresentIdpInd))])
                .range([height, 0]);

            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            const sizeScale = d3.scaleSqrt()
                .domain([0, d3.max(data, d => d.fatalities || 0)])
                .range([5, 40]);

            // Create axes
            const xAxis = d3.axisBottom(xScale).ticks(5);
            const yAxis = d3.axisLeft(yScale).ticks(5);

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);

            svg.append("g")
                .call(yAxis);

            // Plot circles
            svg.selectAll(".dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.event_id_cnty))
                .attr("cy", d => yScale(csvFile === datasets["ACLED IPC ADM2"] ? d.Number : (csvFile === datasets["ACLED IDP Origin"] ? d.affected_idps_state : d.numPresentIdpInd)))
                .attr("r", d => sizeScale(d.fatalities || 0))
                .attr("fill", d => colorScale(d["Level 1"] || "default"))
                .attr("opacity", 0.7);
        });
    }
});
