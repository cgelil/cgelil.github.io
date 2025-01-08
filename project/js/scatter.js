document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item3");
    
    // Color scheme
    const colors = [
        '#001219', '#005f73', '#007BA7', '#00A693', '#0a9396',
        '#708090', '#94d2bd', '#9b2226', '#DAA520', '#DC143C',
        '#DDA0DD', '#E6E6FA', '#E97451', '#FF7F50', '#ae2012',
        '#bb3e03', '#ca6702', '#e9d8a6', '#ee9b00'
    ];

    // Create unique tooltip
    const tooltipScatter = d3.select("body").append("div")
        .attr("class", "scatter-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("pointer-events", "none")
        .style("z-index", "1500");

    function createScatter() {
        // Get container dimensions
        const containerWidth = container.offsetWidth;
        const containerHeight = Math.min(containerWidth * 0.75, 600);

        // Set margins based on container size
        const margin = {
            top: containerHeight * 0.1,
            right: Math.max(containerWidth * 0.2, 150),
            bottom: containerHeight * 0.15,
            left: 100
        };

        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Clear existing SVG
        d3.select(container).selectAll("*").remove();

        // Create SVG with viewBox
        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Add title and subtitle
        svg.append("text")
            .attr("x", -75)
            .attr("y", -margin.top/2)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "16px" : "20px")
            .style("font-weight", "bold")
            .text("Impact of Violence and Displacement on Food Insecurity");

        svg.append("text")
            .attr("x", -75)
            .attr("y", -margin.top/4)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "12px" : "14px")
            .style("fill", "#666")
            .text("Correlation Between Violence, Displacement, and Food Insecurity at Admin 2 Level, April 2023 - May 2024 | Source: IPC, ACLED, IOM, HDX");

        // Load and process data
        d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_idp_ipc_adm2.csv")
            .then(function(data) {
                data = data.map(d => ({
                    ...d,
                    phase3plus: +d.phase3plus,
                    numPresentIdpInd: +d.numPresentIdpInd,
                    event_id_cnty: +d.event_id_cnty,
                    fatalities: +d.fatalities || 0
                })).filter(d => d.phase3plus > 0);

                // Create scales
                const xScale = d3.scaleLog()
                    .range([0, width])
                    .nice();

                const yScale = d3.scaleLog()
                    .range([height, 0])
                    .nice();

                const rScale = d3.scaleSqrt()
                    .range([3, containerWidth < 600 ? 15 : 20]);

                const colorScale = d3.scaleOrdinal()
                    .range(colors);

                // Create axes
                const xAxis = d3.axisBottom(xScale)
                    .ticks(containerWidth < 600 ? 5 : 10, ".0s");

                const yAxis = d3.axisLeft(yScale)
                    .ticks(containerWidth < 600 ? 5 : 10, ".0s");

                function updateChart(selectedVar) {
                    const filteredData = data.filter(d => d[selectedVar] > 0);
                    
                    // Update scales
                    xScale.domain([
                        d3.min(filteredData, d => d[selectedVar]) * 0.8,
                        d3.max(filteredData, d => d[selectedVar]) * 1.2
                    ]);
                    
                    yScale.domain([
                        d3.min(filteredData, d => d.phase3plus) * 0.8,
                        d3.max(filteredData, d => d.phase3plus) * 1.2
                    ]);
                    
                    rScale.domain([0, d3.max(filteredData, d => d.fatalities)]);
                    colorScale.domain(Array.from(new Set(filteredData.map(d => d["Level 1"]))));

                    // Update correlation text based on selected variable
                    const corrText = selectedVar === "numPresentIdpInd" 
                        ? "Corr (Adm1): 0.65\nCorr (Adm2): 0.61"
                        : "Corr (Adm1): 0.18\nCorr (Adm2): 0.25";

                    // Add correlation box
                    const statsBox = svg.selectAll(".stats-box")
                        .data([null])
                        .join("g")
                        .attr("class", "stats-box")
                        .attr("transform", `translate(10, 10)`);

                    statsBox.selectAll("*").remove();

                    statsBox.append("rect")
                        .attr("width", 130)
                        .attr("height", 40)
                        .attr("fill", "white")
                        .attr("stroke", "#ddd")
                        .attr("rx", 5);

                    corrText.split('\n').forEach((line, i) => {
                        statsBox.append("text")
                            .attr("x", 65) // Centered within the 130 width box
                            .attr("y", 20 + i * 15)
                            .style("font-size", "12px")
                            .style("text-anchor", "middle")
                            .text(line);
                    });

                    // Update axes
                    svg.selectAll(".x-axis").remove();
                    svg.selectAll(".y-axis").remove();
                    
                    svg.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height})`)
                        .call(xAxis)
                        .selectAll("text")
                        .style("font-size", containerWidth < 600 ? "8px" : "10px");

                    svg.append("g")
                        .attr("class", "y-axis")
                        .call(yAxis)
                        .selectAll("text")
                        .style("font-size", containerWidth < 600 ? "8px" : "10px");

                    // Update axis labels
                    svg.selectAll(".axis-label").remove();
                    
                    svg.append("text")
                        .attr("class", "axis-label")
                        .attr("text-anchor", "middle")
                        .attr("x", width/2)
                        .attr("y", height + margin.bottom * 0.6)
                        .style("font-size", containerWidth < 600 ? "12px" : "14x")
                        .text(selectedVar === "numPresentIdpInd" ? 
                            "Number of IDPs (Log scale)" : 
                            "Number of Incidents (Log scale)");

                    svg.append("text")
                        .attr("class", "axis-label")
                        .attr("text-anchor", "middle")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -height/2)
                        .attr("y", -margin.left * 0.4)
                        .style("font-size", containerWidth < 600 ? "12px" : "14px")
                        .text("Population in IPC Phase 3+ (Log scale)");

                    // Update points
                    const points = svg.selectAll(".point")
                        .data(filteredData);

                    points.enter()
                        .append("circle")
                        .attr("class", "point")
                        .merge(points)
                        .transition()
                        .duration(1000)
                        .attr("cx", d => xScale(d[selectedVar]))
                        .attr("cy", d => yScale(d.phase3plus))
                        .attr("r", d => rScale(d.fatalities))
                        .attr("fill", d => colorScale(d["Level 1"]))
                        .attr("opacity", 0.7);

                    points.exit().remove();

                    // Update Admin 1 legend
                    const legendY = 0;
                    const legendX = width + 20;
                    
                    const legend = svg.selectAll(".admin-legend")
                        .data([null])
                        .join("g")
                        .attr("class", "admin-legend")
                        .attr("transform", `translate(${legendX}, ${legendY})`);

                    const legendItems = legend.selectAll(".legend-item")
                        .data(colorScale.domain())
                        .join("g")
                        .attr("class", "legend-item")
                        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

                    legendItems.selectAll("circle")
                        .data(d => [d])
                        .join("circle")
                        .attr("r", 6)
                        .attr("fill", d => colorScale(d));

                    legendItems.selectAll("text")
                        .data(d => [d])
                        .join("text")
                        .attr("x", 10)
                        .attr("y", 4)
                        .style("font-size", containerWidth < 600 ? "8px" : "10px")
                        .text(d => d);

                    // Update fatalities legend
                    const fatalities = [0, 50, 1000, 1775];
                    const fatalitiesLegendY = (colorScale.domain().length + 1) * 20;
                    
                    const fatalitiesLegend = svg.selectAll(".fatalities-legend")
                        .data([null])
                        .join("g")
                        .attr("class", "fatalities-legend")
                        .attr("transform", `translate(${legendX}, ${fatalitiesLegendY})`);

                    const fatalitiesItems = fatalitiesLegend.selectAll(".fatalities-item")
                        .data(fatalities)
                        .join("g")
                        .attr("class", "fatalities-item")
                        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

                    fatalitiesItems.selectAll("circle")
                        .data(d => [d])
                        .join("circle")
                        .attr("r", d => rScale(d))
                        .attr("fill", "none")
                        .attr("stroke", "#666")
                        .attr("stroke-width", 1);

                    fatalitiesItems.selectAll("text")
                        .data(d => [d])
                        .join("text")
                        .attr("x", 25)
                        .attr("y", 4)
                        .style("font-size", containerWidth < 600 ? "8px" : "10px")
                        .text(d => d + " fatalities");

                    // Add hover effects
                    svg.selectAll(".point")
                        .on("mouseover", function(event, d) {
                            d3.select(this)
                                .attr("stroke", "#000")
                                .attr("stroke-width", 2);
                                
                            tooltipScatter.transition()
                                .duration(200)
                                .style("opacity", .9);
                                
                            tooltipScatter.html(`
                                <strong>${d.Area}</strong><br/>
                                ${selectedVar === "numPresentIdpInd" ? "IDPs" : "Events"}: ${d[selectedVar].toLocaleString()}<br/>
                                Fatalities: ${d.fatalities}<br/>
                                Population in IPC Phase 3+: ${d.phase3plus.toLocaleString()}
                            `)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .attr("stroke", "none");
                                
                            tooltipScatter.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });
                }

                // Initial chart
                updateChart("numPresentIdpInd");

                // Add variable selector
                const selector = d3.select(container)
                    .append("div")
                    .style("text-align", "center")
                    .style("margin-top", "20px");

                selector.append("label")
                    .text("Choose the variable: ")
                    .style("margin-right", "10px");

                const select = selector.append("select")
                    .style("padding", "5px");

                    select.selectAll("option")
                    .data([
                        {value: "numPresentIdpInd", text: "Number of IDPs"},
                        {value: "event_id_cnty", text: "Number of Incidents"}
                    ])
                    .enter()
                    .append("option")
                    .attr("value", d => d.value)
                    .text(d => d.text)
                    .on("change", function() {
                        updateChart(this.value);
                    });

                    select.on("change", function() {
                        updateChart(this.value);
                    });
            });
    }

    // Initial creation
    createScatter();

    // Add resize listener with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createScatter, 100);
    });
});