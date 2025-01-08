document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item2");
    
    // Color scheme
    const colors = {
        'Afghanistan': '#005f73ff',
        'Democratic Republic of the Congo': '#0a9396ff',
        'Ethiopia': '#94d2bdff',
        'Iraq': '#e9d8a6ff',
        'Nigeria': '#ee9b00ff',
        'Somalia': '#ca6702ff',
        'South Sudan': '#bb3e03ff',
        'Sudan': '#9b2226ff',
        'Yemen': '#ae2012ff'
    };

    function createGraph() {
        // Get container dimensions
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Set margins
        const margin = { 
            top: 60, 
            right: 150,
            bottom: 50, 
            left: 60 
        };
        
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Clear existing SVG
        d3.select(container).selectAll("*").remove();

        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Add title and subtitle
        svg.append("text")
            .attr("x", 0)
            .attr("y", -margin.top/2)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "16px" : "20px")
            .style("font-weight", "bold")
            .text("Internally displaced people by conflict over time");

        svg.append("text")
            .attr("x", 0)
            .attr("y", -margin.top/4)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "12px" : "14px")
            .style("fill", "#666")
            .text("Number of IDPs in the top 10 countries with the highest number of IDPs");

        // Process the data
        d3.csv("your_data.csv").then(function(data) {
            data.forEach(d => {
                d.year = +d.year;
                d.numPresentIdpInd = +d.numPresentIdpInd;
            });

            // Create scales
            const x = d3.scaleLinear()
                .domain([2014, 2024])
                .range([0, width])
                .nice();

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.numPresentIdpInd)])
                .range([height, 0])
                .nice();

            // Add axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")))
                .selectAll("text")
                .style("font-size", containerWidth < 600 ? "10px" : "12px");

            svg.append("g")
                .call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d)))
                .selectAll("text")
                .style("font-size", containerWidth < 600 ? "10px" : "12px");

            // Create line generator
            const line = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.numPresentIdpInd));

            // Group data by country
            const groupedData = Array.from(d3.group(data, d => d.admin0Name));

            // Add lines for each country
            groupedData.forEach(([country, values]) => {
                const sortedValues = values.sort((a, b) => a.year - b.year);
                
                // Draw the line
                svg.append("path")
                    .datum(sortedValues)
                    .attr("fill", "none")
                    .attr("stroke", colors[country])
                    .attr("stroke-width", country === "Sudan" ? 3 : 1.5)
                    .attr("d", line);

                // Add country label at the end of each line
                const lastPoint = sortedValues[sortedValues.length - 1];
                svg.append("text")
                    .attr("x", x(lastPoint.year) + 10)
                    .attr("y", y(lastPoint.numPresentIdpInd))
                    .attr("dy", "0.35em")
                    .style("font-size", containerWidth < 600 ? "8px" : "10px")
                    .text(country);
            });
        });
    }

    // Initial creation
    createGraph();

    // Add resize listener with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createGraph, 100);
    });
});