document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item2");
    const svg = d3.select("#scatter");
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = 600;
    const margin = {top: 40, right: 100, bottom: 60, left: 80};
    
    // Set svg dimensions
    svg
        .attr("width", width)
        .attr("height", height);
    
    // Create variable selector
    const selector = d3.select(".graph-item2")
        .insert("div", ":first-child")
        .style("text-align", "center")
        .style("margin-bottom", "20px");
    
    selector.append("label")
        .text("Y-axis variable: ")
        .style("margin-right", "10px");
    
    selector.append("select")
        .attr("id", "variable-select")
        .style("padding", "5px")
        .selectAll("option")
        .data([
            {value: "numPresentIdpInd", text: "Number of IDPs"},
            {value: "event_id_cnty", text: "Number of Events"}
        ])
        .enter()
        .append("option")
        .attr("value", d => d.value)
        .text(d => d.text);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
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
                .text("People in IPC Phase 3+ (Log scale)");
            
            svg.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", 30)
                .text("Number of IDPs (Log scale)");
            
            // Add legend
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
            
            function updateChart(selectedVar) {
                // Filter out data points where either value is zero
                const filteredData = data.filter(d => d.phase3plus > 0 && d[selectedVar] > 0);
                
                // Update scales with padding
                const xExtent = d3.extent(filteredData, d => d.phase3plus);
                const yExtent = d3.extent(filteredData, d => d[selectedVar]);
                
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
                
                // Update y-axis label
                d3.select(".y-label")
                    .text(selectedVar === "numPresentIdpInd" ? 
                        "Number of IDPs (Log scale)" : 
                        "Number of Events (Log scale)");
                
                // Update circles
                const circles = svg.selectAll("circle")
                    .data(filteredData);
                
                circles.enter()
                    .append("circle")
                    .merge(circles)
                    .transition()
                    .duration(1000)
                    .attr("cx", d => xScale(d.phase3plus))
                    .attr("cy", d => yScale(d[selectedVar]))
                    .attr("r", d => rScale(d.fatalities))
                    .attr("fill", d => colorScale(d["Level 1"]))
                    .attr("opacity", 0.7);
                
                circles.exit().remove();
                
                // Update legend
                const legendItems = legend.selectAll(".legend-item")
                    .data(colorScale.domain());
                
                const legendEnter = legendItems.enter()
                    .append("g")
                    .attr("class", "legend-item")
                    .attr("transform", (d, i) => `translate(0, ${i * 20})`);
                
                legendEnter.append("circle")
                    .attr("r", 6)
                    .attr("fill", d => colorScale(d));
                
                legendEnter.append("text")
                    .attr("x", 10)
                    .attr("y", 4)
                    .text(d => d)
                    .style("font-size", "12px");
                
                // Add hover effects
                svg.selectAll("circle")
                    .on("mouseover", function(event, d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(`
                            Area: ${d.Area}<br/>
                            ${selectedVar === "numPresentIdpInd" ? "IDPs" : "Events"}: ${d[selectedVar]}<br/>
                            Fatalities: ${d.fatalities}<br/>
                            IPC Phase 3+: ${d.phase3plus}
                        `)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }
            
            // Initial chart
            updateChart("numPresentIdpInd");
            
            // Add event listener for variable selection
            d3.select("#variable-select")
                .on("change", function() {
                    updateChart(this.value);
                });
        });
});