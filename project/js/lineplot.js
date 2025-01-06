// chart.js
const margin = { top: 50, right: 30, bottom: 90, left: 50 },
    width = 900 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

const svg = d3.select("#lineplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const dataUrl = "https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_monthly_data.csv";

fetch(dataUrl).then(response => response.text()).then(csvString => {
    const data = d3.csvParse(csvString);

    // Parse data
    data.forEach(d => {
      d.fatalities = +d.fatalities || 0;  // Ensure no undefined values
      d.event_date = +d.event_date || 0;
      d.date = d3.timeParse("%Y-%m")(d.month_year);
    });

    // Set scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.fatalities, d.event_date))])
      .range([height, 0]);

    // Define line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.fatalities));

    // Append bars first
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date) - 10)
      .attr("y", d => y(d.event_date))
      .attr("width", 20)
      .attr("height", d => height - y(d.event_date))
      .attr("opacity", 0.7);  // Reduce opacity to avoid full obstruction

    // Append line path after bars (so it's on top)
    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("stroke", "steelblue")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", width + " " + width)
      .attr("stroke-dashoffset", width)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .raise();  // Bring line to front

    // Add annotations
    svg.append("line")
      .attr("class", "annotation")
      .attr("x1", x(new Date("2021-10")))
      .attr("x2", x(new Date("2021-10")))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "red");

    svg.append("text")
      .attr("x", x(new Date("2021-10")) + 5)
      .attr("y", 20)
      .text("Military coup")
      .style("fill", "red");

    svg.append("line")
      .attr("class", "annotation")
      .attr("x1", x(new Date("2023-04")))
      .attr("x2", x(new Date("2023-04")))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "red");

    svg.append("text")
      .attr("x", x(new Date("2023-04")) + 5)
      .attr("y", 40)
      .text("Conflict outbreak")
      .style("fill", "red");

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(12));

    svg.append("g")
      .call(d3.axisLeft(y));
});
