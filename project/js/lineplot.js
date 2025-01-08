document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item1");
    
    // Color scheme
    const colors = {
        eventColors: {
            'Battles': '#005F73',
            'Explosions': '#94D2BD',
            'Protests': '#EE9B00',
            'Violence against civilians': '#BB3E03'
        }
    };

    // Create unique tooltip for this graph
    const tooltip = d3.select("body").append("div")
        .attr("class", "graph-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("z-index", "1500")
        .style("pointer-events", "none");

    function createGraph() {
        // Get container dimensions
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Set the margins and dimensions
        const margin = { 
            top: 60, 
            right: Math.max(containerWidth * 0.2, 180),
            bottom: 50, 
            left: 40 
        };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Clear any existing SVG
        d3.select(container).selectAll("*").remove();

        // Create the SVG container with viewBox for responsiveness
        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .append("g")
            .attr("transform", `translate(${margin.left + 50}, ${margin.top})`);

        svg.append("text")
            .attr("x", -70)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "16px" : "20px")
            .style("font-weight", "bold")
            .attr("fill", "#000")
            .text("Timeline of Sudanese Conflict");

        svg.append("text")
            .attr("x", -70)
            .attr("y", -margin.top /7.5)
            .attr("text-anchor", "left")
            .style("font-size", containerWidth < 600 ? "12px" : "16px")
            .style("fill", "#666")
            .text("Total incidents (lines) and fatalities (bars) by event type, Jan 2021 - Dec 2024 | Source: ACLED" );


        // Process the data
        d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_monthly.csv").then(function(data) {
            const eventTypes = Array.from(new Set(data.map(d => d.event_type)));
            
            // Parse dates and numbers
            data.forEach(d => {
                d.date = d3.timeParse("%Y-%m")(d.month_year);
                d.fatalities = +d.fatalities;
                d.event_date = +d.event_date;
            });

            // Create scales
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width])
                .nice();

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => Math.max(d.event_date, d.fatalities))])
                .range([height, 0])
                .nice();

            // Add stacked bars for events
            const stack = d3.stack()
                .keys(eventTypes)
                .value((d, key) => {
                    const matchingEvent = data.find(event => 
                        event.month_year === d.month_year && 
                        event.event_type === key
                    );
                    return matchingEvent ? matchingEvent.event_date : 0;
                });

            const groupedData = Array.from(d3.group(data, d => d.month_year))
                .map(([month_year, values]) => ({
                    month_year,
                    date: d3.timeParse("%Y-%m")(month_year),
                    fatalities: d3.sum(values, d => d.fatalities)
                }));

            const stackedData = stack(groupedData);

            // Add bars with responsive width
            const barWidth = Math.min(width / data.length * 4, 18); // Cap maximum width
            svg.selectAll("g.bars")
                .data(stackedData)
                .enter()
                .append("g")
                .style("fill", d => colors.eventColors[d.key])
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("x", d => x(d.data.date) - barWidth/2)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", barWidth)
                .style("opacity", 0.9)
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`
                        Month: ${d.data.month_year}<br/>
                        Events: ${d[1] - d[0]}<br/>
                        Fatalities: ${d.data.fatalities}<br/>
                    `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Add lines for fatalities with responsive stroke width
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.fatalities));

            eventTypes.forEach(eventType => {
                const eventData = data.filter(d => d.event_type === eventType);
                
                svg.append("path")
                    .datum(eventData)
                    .attr("fill", "none")
                    .attr("stroke", colors.eventColors[eventType])
                    .attr("stroke-width", containerWidth < 600 ? 1 : 2)
                    .attr("d", line)
                    .style("opacity", 0.7);
            });

            // Add responsive axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(containerWidth < 600 ? d3.timeMonth.every(3) : d3.timeMonth.every(2)))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")
                .style("font-size", containerWidth < 600 ? "8px" : "10px");

            svg.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("font-size", containerWidth < 600 ? "8px" : "10px");

            // Add annotation lines with responsive positioning
            const addAnnotation = (date, text, yOffset) => {
                svg.append("line")
                    .attr("class", "annotation")
                    .attr("x1", x(new Date(date)))
                    .attr("x2", x(new Date(date)))
                    .attr("y1", height / 6)
                    .attr("y2", height)
                    .attr("stroke", "#000000")
                    .attr("stroke-width", containerWidth < 600 ? 0.5 : 1)
                    .attr("stroke-dasharray", "5,5");

                const rectWidth = containerWidth < 600 ? 60 : 100;
                svg.append("rect")
                    .attr("x", x(new Date(date)) - rectWidth/2)
                    .attr("y", height / 6 - 30)
                    .attr("width", rectWidth)
                    .attr("height", 20)
                    .attr("fill", "#f0f0f0")
                    .attr("stroke", "#000000")
                    .attr("stroke-width", 0.5);

                svg.append("text")
                    .attr("x", x(new Date(date)))
                    .attr("y", height / 6 - 15)
                    .attr("text-anchor", "middle")
                    .text(text)
                    .style("fill", "#000000")
                    .style("font-size", containerWidth < 600 ? "8px" : "12px");
            };

            addAnnotation("2021-10", "Military coup", 0);
            addAnnotation("2023-04", "Conflict outbreak", 0);

            // Add responsive legend
            const legendFontSize = containerWidth < 600 ? 8 : 10;
            const legendSpacing = containerWidth < 600 ? 15 : 20;
            
            const legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", legendFontSize)
                .attr("text-anchor", "start")
                .selectAll("g")
                .data(eventTypes)
                .enter().append("g")
                .attr("transform", (d, i) => `translate(${width + 10},${i * legendSpacing})`);

            legend.append("rect")
                .attr("width", legendFontSize + 4)
                .attr("height", legendFontSize + 4)
                .attr("fill", d => colors.eventColors[d]);

            legend.append("text")
                .attr("x", legendFontSize + 8)
                .attr("y", legendFontSize)
                .text(d => d);
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