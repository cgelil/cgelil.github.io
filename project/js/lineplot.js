document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector(".graph-item1");
    
    // Color scheme
    const colors = {
        eventColors: {
            'Battles': '#001524',
            'Explosions': '#15616D',
            'Protests': '#FFECD1',
            'Strategic developments': '#FF7D00',
            'Violence against civilians': '#78290F'
        }
    };
    
    // Set the margins and dimensions
    const margin = { top: 60, right: 180, bottom: 50, left: 50 }; // Increased right margin for legend
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing SVG
    d3.select(container).selectAll("*").remove();

    // Create the SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add title
    svg.append("text")
        .attr("x", -margin.left )
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Timeline of Sudanese Conflict");

    // Add title
        svg.append("text")
        .attr("x", -margin.left )
        .attr("y", -margin.top / 8)
        .attr("text-anchor", "left")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("Total incidents (lines) and fatalaties (bars) by event type, Jan 2021 - Dec 2024");

    

    // Process the data
    d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_monthly_d.csv").then(function(data) {
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
            .nice(); // Adds some padding to the beginning and end of the x axis


        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.event_date, d.fatalities))])
            .range([height, 0]);

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
            .map(([month_year]) => ({
                month_year,
                date: d3.timeParse("%Y-%m")(month_year)
            }));

        const stackedData = stack(groupedData);

        // Add bars with increased width
        const barWidth = width / data.length * 4; // Increased bar width
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
            .style("opacity", 0.7);

        // Add lines for fatalities by event type
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.fatalities));

        eventTypes.forEach(eventType => {
            const eventData = data.filter(d => d.event_type === eventType);
            
            svg.append("path")
                .datum(eventData)
                .attr("fill", "none")
                .attr("stroke", colors.eventColors[eventType])
                .attr("stroke-width", 2)
                .attr("d", line)
                .style("opacity", 0.7);
        });

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add annotation lines
        // Military coup
        svg.append("line")
            .attr("class", "annotation")
            .attr("x1", x(new Date("2021-10")))
            .attr("x2", x(new Date("2021-10")))
            .attr("y1", height / 6)
            .attr("y2", height)
            .attr("stroke", "#000000")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5");

        svg.append("rect")
            .attr("x", x(new Date("2021-10")) - 40)
            .attr("y", height / 6 - 30)
            .attr("width", 80)
            .attr("height", 20)
            .attr("fill", "#f0f0f0")
            .attr("stroke", "#000000")
            .attr("stroke-width", 0.5);

        svg.append("text")
            .attr("x", x(new Date("2021-10")))
            .attr("y", height / 6 - 15)
            .attr("text-anchor", "middle")
            .text("Military coup")
            .style("fill", "#000000")
            .style("font-size", "12px");

        // Conflict outbreak
        svg.append("line")
            .attr("class", "annotation")
            .attr("x1", x(new Date("2023-04")))
            .attr("x2", x(new Date("2023-04")))
            .attr("y1", height / 6 )
            .attr("y2", height)
            .attr("stroke", "#000000")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5");

        svg.append("rect")
            .attr("x", x(new Date("2023-04")) - 50)
            .attr("y", height / 6 - 30)
            .attr("width", 100)
            .attr("height", 20)
            .attr("fill", "#f0f0f0")
            .attr("stroke", "#000000")
            .attr("stroke-width", 0.5);

        svg.append("text")
            .attr("x", x(new Date("2023-04")))
            .attr("y", height / 6 - 15)
            .attr("text-anchor", "middle")
            .text("Conflict outbreak")
            .style("fill", "#000000")
            .style("font-size", "12px");

        // Add legend on the right side
        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(eventTypes)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`); // Move legend to the right

        legend.append("rect")
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => colors.eventColors[d]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);

        // Add tooltips
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "10px");

        svg.selectAll("rect")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    Month: ${d.data.month_year}<br/>
                    Events: ${d[1] - d[0]}<br/>
                    Type: ${d.key}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
});