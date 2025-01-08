document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item2");
    const svg = d3.select("#scatter");
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = 600;
    const margin = {top: 40, right: 120, bottom: 60, left: 80};
    
    // Set svg dimensions
    svg
        .attr("width", width)
        .attr("height", height);
    
    // Create title and subtitle
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .style("font-size", "24px")
        .text("Scatter Plot of IDPs and Incidents");
    
    svg.append("text")
        .attr("class", "subtitle")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .style("font-size", "16px")
        .text("Data Source: ACLED and IPC");

    // Create tooltip
    const tooltipScatter = d3.select(".graph-item2").append("div")
        .attr("class", "tooltip-scatter")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("z-index", "10");
    
    // Load and process data
    d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_idp_ipc_adm2.csv")
        .then(function(data) {
            // Convert strings to numbers and filter out zeros
            data = data.map(d => ({
                ...d,
                phase3plus: +d.phase3plus,
                numPresentIdpInd: +d.numPresentIdpInd,
                event_id_cnty: +d.event_id_cnty,
                fatalities: +d.fatalities || 0
            }));

            // Create scales with padding
            const xScale = d3.scaleLog()
                .range([margin.left, width - margin.right])
                .nice();
            
            const yScale = d3.scaleLog()
                .range([height - margin.bottom, margin.top])
                .nice();
            
            const rScale = d3.scaleSqrt()
                .range([3, 20]);
            
            const colorScale = d3.scaleOrdinal()
                .range(d3.schemeCategory10);
            
            // Create axes with more ticks
            const xAxis = d3.axisBottom(xScale)
                .ticks(10, ".0s");
            
            const yAxis = d3.axisLeft(yScale)
                .ticks(10, ".0s");
            
            // Add axes to svg
            const gx = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - margin.bottom})`);
            
            const gy = svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left},0)`);
            
            // Add axis labels
            svg.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "middle")
                .attr("x", width/2)
                .attr("y", height - 10)
                .text("Number of IDPs (Log scale)");
            
            svg.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", 30)
                .text("Population in IPC Phase 3+ (Log scale)");
            
            // Add color legend with title (right side)
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

            // Add legend title
            legend.append("text")
                .attr("class", "legend-title")
                .attr("x", 0)
                .attr("y", -10)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text("Admin 1 areas");

            // Add fatalities legend (right side, below Admin legend)
            const fatalitiesLegend = svg.append("g")
                .attr("class", "fatalities-legend")
                .attr("transform", `translate(${width - margin.right + 10}, ${margin.top + 160})`);  // Position below Admin legend

            fatalitiesLegend.append("text")
                .attr("class", "fatalities-title")
                .attr("x", 0)
                .attr("y", -10)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text("Fatalities");

            // Add R-squared box
            const statsBox = svg.append("g")
                .attr("class", "stats-box")
                .attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);

            statsBox.append("rect")
                .attr("width", 120)
                .attr("height", 30)
                .attr("fill", "white")
                .attr("stroke", "#ddd")
                .attr("rx", 5);

            const rSquaredText = statsBox.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .style("font-size", "12px");
            
            function calculateCorrelation(data, xVar) {
                const x = data.map(d => Math.log(d[xVar]));
                const y = data.map(d => Math.log(d.phase3plus));
                
                const xMean = x.reduce((a, b) => a + b) / x.length;
                const yMean = y.reduce((a, b) => a + b) / y.length;
                
                const numerator = x.reduce((sum, xi, i) => {
                    return sum + (xi - xMean) * (y[i] - yMean);
                }, 0);
                
                const xVariance = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
                const yVariance = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
                
                return numerator / Math.sqrt(xVariance * yVariance);
            }

            function updateChart(selectedVar) {
                // Filter out data points where either value is zero
                const filteredData = data.filter(d => d.phase3plus > 0 && d[selectedVar] > 0);
                
                // Calculate and update correlation
                const correlation = calculateCorrelation(filteredData, selectedVar);
                d3.select(".stats-box text")
                    .text(`Corr = ${correlation.toFixed(3)}`);
                
                // Update scales with padding
                const xExtent = d3.extent(filteredData, d => d[selectedVar]);
                const yExtent = d3.extent(filteredData, d => d.phase3plus);
                
                xScale.domain([
                    xExtent[0] * 0.8, 
                    xExtent[1] * 1.2
                ]);
                
                yScale.domain([
                    yExtent[0] * 0.8, 
                    yExtent[1] * 1.2
                ]);
                
                rScale.domain([0, d3.max(filteredData, d => d.fatalities)]);
                colorScale.domain(Array.from(new Set(filteredData.map(d => d["Level 1"]))));
                
                // Update axes
                gx.transition().duration(1000).call(xAxis);
                gy.transition().duration(1000).call(yAxis);
                
                // Update x-axis label
                d3.select(".x-label")
                    .text(selectedVar === "numPresentIdpInd" ? 
                        "Number of IDPs (Log scale)" : 
                        "Number of Incidents (Log scale)");
                
                // Update circles
                const circles = svg.selectAll("circle.data-point")
                    .data(filteredData);
                
                // Enter + Update
                circles.enter()
                    .append("circle")
                    .attr("class", "data-point")
                    .merge(circles)
                    .transition()
                    .duration(1000)
                    .attr("cx", d => xScale(d[selectedVar]))
                    .attr("cy", d => yScale(d.phase3plus))
                    .attr("r", d => rScale(d.fatalities))
                    .attr("fill", d => colorScale(d["Level 1"]))
                    .attr("opacity", 0.7);
                
                circles.exit().remove();
                
                // Clear existing legend items
                legend.selectAll(".legend-item").remove();
                
                // Update color legend items
                const legendItems = legend.selectAll(".legend-item")
                    .data(colorScale.domain())
                    .enter()
                    .append("g")
                    .attr("class", "legend-item")
                    .attr("transform", (d, i) => `translate(0, ${i * 20 + 10})`);
                
                legendItems.append("circle")
                    .attr("r", 6)
                    .attr("fill", d => colorScale(d));
                
                legendItems.append("text")
                    .attr("x", 10)
                    .attr("y", 4)
                    .text(d => d)
                    .style("font-size", "12px");

                // Clear existing fatalities legend items
                fatalitiesLegend.selectAll(".fatalities-item").remove();

                // Update fatalities legend
                const fatalities = [10, 50, 100];
                const fatalitiesItems = fatalitiesLegend.selectAll(".fatalities-item")
                    .data(fatalities)
                    .enter()
                    .append("g")
                    .attr("class", "fatalities-item")
                    .attr("transform", (d, i) => `translate(0, ${i * 25 + 10})`);

                fatalitiesItems.append("circle")
                    .attr("r", d => rScale(d))
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);

                fatalitiesItems.append("text")
                    .attr("x", 25)
                    .attr("y", 4)
                    .text(d => d + " fatalities")
                    .style("font-size", "12px");
                
                // Add hover effects
                svg.selectAll("circle.data-point")
                    .on("mouseover", function(event, d) {
                        tooltipScatter
                            .style("visibility", "visible")
                            .html(`
                                <strong>${d.Area}</strong><br/>
                                ${selectedVar === "numPresentIdpInd" ? "IDPs" : "Events"}: ${d[selectedVar].toLocaleString()}<br/>
                                Fatalities: ${d.fatalities}<br/>
                                Population in IPC Phase 3+: ${d.phase3plus.toLocaleString()}
                            `)
                            .style("left", `${event.offsetX + 10}px`)
                            .style("top", `${event.offsetY - 28}px`);
                    })
                    .on("mousemove", function(event) {
                        tooltipScatter
                            .style("left", `${event.offsetX + 10}px`)
                            .style("top", `${event.offsetY - 28}px`);
                    })
                    .on("mouseout", function() {
                        tooltipScatter
                            .style("visibility", "hidden");
                    });
            }
            
            // Initial chart
            updateChart("numPresentIdpInd");
            
            // Create variable selector below the plot
            const selector = d3.select(".graph-item2")
                .append("div")
                .style("text-align", "center")
                .style("margin-top", "20px");
            
            selector.append("label")
                .text("X-axis variable: ")
                .style("margin-right", "10px");
            
            selector.append("select")
                .attr("id", "variable-select")
                .style("padding", "5px")
                .selectAll("option")
                .data([
                    {value: "numPresentIdpInd", text: "Number of IDPs"},
                    {value: "event_id_cnty", text: "Number of Incidents"}
                ])
                .enter()
                .append("option")
                .attr("value", d => d.value)
                .text(d => d.text);

            // Add event listener for variable selection
            d3.select("#variable-select")
                .on("change", function() {
                    updateChart(this.value);
                });
        });
});