// Scrolly Section and Graphic Positioning
function handleResize() {
    const stepHeight = Math.floor(window.innerHeight * 0.75);  // Set each step to 75% of viewport height
    d3.selectAll(".step").style("height", stepHeight + "px");

    const scrolly = d3.select(".scrolly");
    const figure = scrolly.select(".scrolly-graphic");
    const figureHeight = window.innerHeight / 1.2;  // Graphic size relative to viewport
    const figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure.style("height", figureHeight + "px")
          .style("top", figureMarginTop + "px");

    // Update Scrollama with new dimensions
    scroller.resize();
}

// Handle Step Enter (Triggers Visual Changes)
function handleStepEnter(response) {
    d3.selectAll(".step")
        .classed("is-active", (d, i, nodes) => nodes[i] === response.element);

    // Optional: Update visualization when entering step
    const step = response.element.dataset.step;
    d3.select("#chart")
        .selectAll("circle")
        .transition()
        .duration(500)
        .attr("fill", step === "2" ? "orange" : "steelblue");
}

// Handle Step Exit (Optional: Fade Out Effect)
function handleStepExit(response) {
    d3.select(response.element).classed("is-active", false);
}

// Initialize Scrollama
function init() {
    scroller
        .setup({
            step: ".step",
            offset: 0.6,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);

    // Setup Resize Event
    window.addEventListener("resize", handleResize);
    handleResize();
}

// Start Everything
init();
