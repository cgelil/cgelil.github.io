// Create SVG container first
const svg = d3.select("#lineplot")
    .attr("width", 700)  // Set explicit width
    .attr("height", 400);  // Set explicit height

const margin = {top: 80, right: 80, bottom: 100, left: 80}; // Increased bottom margin for legend
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

// Clear any existing elements
svg.selectAll("*").remove();

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

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
            .domain([0, 500])  // Set max value to 500
            .range([height, 0]);

        const z = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(disorderTypes);

        // Create line generator
        const line = d3.line()
            .x(d => x(d.month_year))
            .y(d => y(d.event_date))
            .curve(d3.curveMonotoneX); // Add curve interpolation

        // Add X axis
        const xAxis = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b-%y")); // Format ticks as "month-year"

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Add Y axis
        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

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

 
        // Add legend to the lines
        disorder.append("text")
            .datum(d => ({type: d.type, value: d.values[d.values.length - 1]}))
            .attr("transform", d => `translate(${x(d.value.month_year)},${y(d.value.event_date)})`)
            .attr("x", 5)
            .attr("dy", (d, i) => `${1.35 * i}em`)  // Adjust dy to prevent overlap
            .style("font-size", "12px")
            .style("fill", d => z(d.type))
            .text(d => d.type);

        // Add main header
        svg.append("text")
            .attr("x", margin.left / 3)
            .attr("y", margin.top / 4)
            .attr("text-anchor", "left")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text("Timeline of events in Sudan");

        // Add subheader
        svg.append("text")
            .attr("x", margin.left / 3)
            .attr("y", margin.top / 4 + 20)
            .attr("text-anchor", "left")
            .style("font-size", "16px")
            .text("Reported Incidents (Jan 2021 to Dec 2024)");

        // Add legend title

            
        svg.append("text")
            .attr("x", margin.left / 3)
            .attr("y", margin.top / 4 + 40)
            .attr("text-anchor", "left")
            .style("font-size", "12px")
            .style("fill", "grey")
            .text("Source: ACLED");

    })
    .catch(error => {
        console.error("Error loading the data:", error);
    });
