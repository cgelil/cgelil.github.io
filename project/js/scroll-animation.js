// Initialize Scrollama
const scroller = scrollama();

// Initialize Scrollama.js for the intro section and line plot
scroller
  .setup({
    step: '.intro', // Target the intro section (with id or class as needed)
    offset: 0.8, // Trigger at 80% of the viewport
    debug: false // Set to true for debugging
  })
  .onStepEnter((response) => {
    const step = response.element;

    // When intro-1 or intro-2 enters, line plot is behind and doesn't trigger animation
    if (step.id === 'intro-1' || step.id === 'intro-2') {
      const linePlot = document.querySelector('.line-plot');
      linePlot.style.zIndex = -1; // Line plot is behind
      linePlot.style.opacity = 0; // Hide line plot
      stopLinePlotAnimation(); // Stop any ongoing animation
    }

    // When intro-3 enters, line plot becomes fully visible and the animation is triggered
    if (step.id === 'intro-2') {
      const linePlot = document.querySelector('.line-plot');
      linePlot.style.zIndex = 1; // Line plot comes to the front
      linePlot.style.opacity = 1; // Line plot is fully visible
      triggerLinePlotAnimation(); // Trigger the line plot animation
    }

    // When intro-4 enters, trigger the map plot
    if (step.id === 'intro-4') {
      const mapPlot = document.querySelector('.map-plot');
      mapPlot.style.zIndex = 1; // Map plot comes to the front
      mapPlot.style.opacity = 1;  // Ensure map plot is visible when intro-4 is entered
    }
  })
  .onStepExit((response) => {
    const step = response.element;
    // Handle step exit logic
    if (step.id === 'intro-2') {
      stopLinePlotAnimation(); // Stop the animation when intro-2 exits
    }
  });

// Function to stop or reset line plot animation
function stopLinePlotAnimation() {
  const paths = d3.selectAll(".line");
  paths.interrupt(); // Stop any ongoing transitions
  paths.attr("stroke-dashoffset", 0); // Reset the stroke-dashoffset to the initial state
}

// Function to trigger the line plot animation
function triggerLinePlotAnimation() {
  const paths = d3.selectAll(".line");
  
  paths.each(function() {
    const totalLength = this.getTotalLength();
    d3.select(this)
      .attr("stroke-dasharray", `${totalLength},${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(5000) // You can adjust this duration
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  });
}
