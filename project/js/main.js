const scroller = scrollama();

const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

const data = [30, 70, 110, 150];

const circleGroup = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => (i + 1) * (width / (data.length + 1)))  // Distribute horizontally
    .attr("cy", height / 2)  // Center vertically
    .attr("r", 30)
    .attr("fill", "steelblue");

// Scrollama Step Function (Changes Circle Size)
function updateChart(radius) {
    svg.selectAll("circle")
        .transition()
        .duration(800)
        .attr("r", radius);
}

// Scrollama Initialization
scroller
    .setup({
        step: ".step",
        offset: 0.6,
        once: false
    })
    .onStepEnter((response) => {
        const step = response.element.dataset.step;

        // Different sizes for each step
        if (step === "1") {
            updateChart(30);
        } else if (step === "2") {
            updateChart(60);
        } else if (step === "3") {
            updateChart(90);
        }
    });
