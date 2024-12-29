document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded. Map visualization is ready.");
});
// using d3 for convenience, and storing a selected elements
var $container = d3.select('#scroll');
var $graphic = container.select('.scroll__graphic');
var $chart = graphic.select('.chart');
var $text = container.select('.scroll__text');
var $step = text.selectAll('.step');

// initialize the scrollama
var scroller = scrollama();

// resize function to set dimensions on load and on page resize
function handleResize() { ... }

// scrollama event handlers
function handleStepEnter(response) { ... }

function handleContainerEnter(response) { ... }

function handleContainerExit(response) { ... }

// kick-off code to run once on load
function init() {...}

// start it up
init();
