let scroller = scrollama();

// Setup the scroller and initialize
function init() {
    scroller
        .setup({
            step: ".step",
            offset: 0.7,
            debug: false,
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);
    
    window.addEventListener("resize", scroller.resize);
}

// Handle entering a step
function handleStepEnter(response) {
    const step = response.element;
    const stepNumber = step.dataset.step;

    // Change visualization based on step
    updateVisualization(stepNumber);
    
    // Add active class for text animation
    step.classList.add("active");
}

// Handle exiting a step
function handleStepExit(response) {
    response.element.classList.remove("active");
}

// Update visualization logic for maps and plots
function updateVisualization(stepNumber) {
    const mapContainer = document.getElementById("map-container");
    const plotContainer = document.getElementById("plot-container");

    if (stepNumber <= 3) {
        // Display map for steps 1-3
        mapContainer.style.display = "block";
        plotContainer.style.display = "none";
        updateMap(stepNumber);
    } else {
        // Display line plot for step 4
        mapContainer.style.display = "none";
        plotContainer.style.display = "block";
        updatePlot(stepNumber);
    }
}

// Example functions to update map and plot visuals
function updateMap(stepNumber) {
    console.log(`Updating map for step ${stepNumber}`);
    // Add your map update logic here, such as adjusting map layers or markers
    if (stepNumber === "1") {
        // Initialize or update map for Step 1
        initMap();  // Example function to initialize the map
    } else if (stepNumber === "2") {
        // Update map for Step 2 (new data layers, etc.)
        updateMapLayer();  // Example function to add layers or update data
    } else if (stepNumber === "3") {
        // Further map customization for Step 3
        highlightKeyRegions();  // Example function to highlight specific regions
    }
}

function updatePlot(stepNumber) {
    console.log(`Updating plot for step ${stepNumber}`);
    // Add your line plot update logic here, such as changing the displayed data
    if (stepNumber === "4") {
        renderLinePlot();  // Example function to render the plot
    }
}

// Placeholder function for map initialization (Step 1)
function initMap() {
    const mapContainer = document.getElementById("map-container");
    // Initialize the map (use your mapping library like Leaflet or Mapbox)
    console.log("Map initialized!");
}

// Placeholder function to update map layer (Step 2)
function updateMapLayer() {
    const mapContainer = document.getElementById("map-container");
    // Add or update map layers
    console.log("Map layer updated!");
}

// Placeholder function to highlight key regions (Step 3)
function highlightKeyRegions() {
    const mapContainer = document.getElementById("map-container");
    // Highlight specific regions on the map
    console.log("Highlighted key regions!");
}

// Placeholder function for line plot rendering (Step 4)
function renderLinePlot() {
    if (typeof window.ReactDOM !== 'undefined') {
        const plotContainer = document.getElementById("plot-container");
        ReactDOM.render(React.createElement(LinePlot), plotContainer);
    }
}
// Initialize the scroller
init();
