
d3.csv("https://raw.githubusercontent.com/cgelil/cgelil.github.io/refs/heads/main/project/data/acled_monthly.csv").then(data => {
    const parseTime = d3.timeParse("%Y-%m");

    data.forEach(d => {
        d.month_year = parseTime(d.month_year);
        d.event_date = +d.event_date;
    });

    const svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line()
        .x(d => x(d.month_year))
        .y(d => y(d.event_date));

    const disorderTypes = Array.from(new Set(data.map(d => d.disorder_type)));

    const nestedData = disorderTypes.map(type => {
        return {
            type: type,
            values: data.filter(d => d.disorder_type === type)
        };
    });

    x.domain(d3.extent(data, d => d.month_year));
    y.domain([0, d3.max(data, d => d.event_date)]);
    z.domain(disorderTypes);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Event Date");

    const disorder = g.selectAll(".disorder")
        .data(nestedData)
        .enter().append("g")
        .attr("class", "disorder");

    disorder.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => z(d.type));

    disorder.append("text")
        .datum(d => ({type: d.type, value: d.values[d.values.length - 1]}))
        .attr("transform", d => `translate(${x(d.value.month_year)},${y(d.value.event_date)})`)
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(d => d.type);
});
