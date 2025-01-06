// Load data from CSV file
d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_rawdata.csv").then(data => {
    data.forEach(d => {
        d.fatalities = +d.fatalities;
        d.event_date = +d.event_date;
    });

    const svg = d3.select("#lineplot")
        .attr("width", 700)
        .attr("height", 400);

    const margin = {top: 80, right: 80, bottom: 100, left: 80};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.month_year))
        .range([0, width])
        .padding(0.1);

    const y0 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.fatalities)]).nice()
        .range([height, 0]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.event_date)]).nice()
        .range([height, 0]);

    g.append("g")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.month_year))
        .attr("y", d => y1(d.event_date))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y1(d.event_date));

    const line = d3.line()
        .x(d => x(d.month_year) + x.bandwidth() / 2)
        .y(d => y0(d.fatalities));

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y0));

    g.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y1));
});