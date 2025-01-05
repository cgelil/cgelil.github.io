// Create SVG container first
const svg = d3.select("#lineplot")
    .attr("width", 800)  // Set explicit width
    .attr("height", 400);  // Set explicit height

const margin = {top: 20, right: 120, bottom: 50, left: 60}; // Increased margins for labels
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

// Clear any existing elements
svg.selectAll("*").remove();

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_monthly.csv")
    .then(data => {
        const parseTime = d3.timeParse("%Y-%m");
        
        // Data preprocessing
        data.forEach(d => {
            d.month_year = parseTime(d.month_year);
            d.event_date = +d.event_date;
        });

        // Get unique disorder types
        const disorderTypes = Array.from(new Set(data.map(d => d.event_type)));

        // Create nested data structure
        const nestedData = disorderTypes.map(type => ({
            type: type,
            values: data.filter(d => d.event_type === type)
        }));

        // Set up scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.month_year))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.event_date)])
            .range([height, 0]);

        const z = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(disorderTypes);

        // Create line generator
        const line = d3.line()
            .x(d => x(d.month_year))
            .y(d => y(d.event_date))
            .curve(d3.curveMonotoneX); // Add curve interpolation

        // Add X axis
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Add Y axis
        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Add Y axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Event Frequency");

        // Add X axis label
        g.append("text")
            .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Time");

        // Add lines
        const disorder = g.selectAll(".disorder")
            .data(nestedData)
            .enter().append("g")
            .attr("class", "disorder");

        disorder.append("path")
            .attr("class", "line")
            .attr("d", d => line(d.values))
            .style("stroke", d => z(d.type))
            .style("fill", "none")
            .style("stroke-width", 2);

        // Add legend
        const legend = g.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 10}, 0)`);

        legend.selectAll("rect")
            .data(disorderTypes)
            .enter()
            .append("rect")
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => z(d));

        legend.selectAll("text")
            .data(disorderTypes)
            .enter()
            .append("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d)
            .style("font-size", "12px");

        // Animation function
        function triggerLinePlotAnimation() {
            const paths = d3.selectAll(".line");
            
            paths.each(function() {
                const totalLength = this.getTotalLength();
                d3.select(this)
                    .attr("stroke-dasharray", `${totalLength},${totalLength}`)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(5000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);
            });
        }

        // Trigger initial animation
        triggerLinePlotAnimation();
    })
    .catch(error => {
        console.error("Error loading the data:", error);
    });