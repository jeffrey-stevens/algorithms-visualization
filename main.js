const PLOT_WIDTH = 600;
const PLOT_HEIGHT = 400;


function newPlot(width, height) {
    plot = d3.select("#plot");
    plot.selectAll("*").remove();

    svg = plot
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    return svg;
}


function getRadioValue(name) {
    let query = "input[name='" + name + "']";
    let elements = document.querySelectorAll(query);
    
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            return elements[i].value;
        }
    }

    return null;
}


function getAlgorithm() {
    return document.getElementById("algorithm").value;
}

function getInputSize() {
    return parseInt(getRadioValue("input-size"));
}

function getSpeed() {
    return parseInt(getRadioValue("speed"));
}


function runVisualization(algorithm, inputSize, speed) {

    svg = newPlot(PLOT_WIDTH, PLOT_HEIGHT);

    switch(algorithm) {
        case "bubblesort":
            let bubblesort = new BubbleSortViz(svg);
            bubblesort.simulate(inputSize, speed);
            break;

        case "selectionsort":
            let selectionsort = new SelectionSortViz(svg);
            selectionsort.simulate(inputSize, speed);
            break;
        
        case "insertionsort":
            let insertionsort = new InsertionSortViz(svg);
            insertionsort.simulate(inputSize, speed);
            break;

        case "quicksort":
            let quicksort = new QuicksortViz(svg);
            quicksort.simulate(inputSize, speed);
            break;
    }
}


document.addEventListener('DOMContentLoaded', () => {

    let algorithmElement = document.getElementById("algorithm");
    let inputSizeElement = document.getElementById("input-size");
    let inputSizeButtons = document.querySelectorAll("input[name='input-size']");
    let speedElement = document.getElementById("speed");
    let speedButtons = document.querySelectorAll("input[name='speed']");

    algorithmElement.addEventListener("change", (event) => {
        let algorithm = event.target.value;
        let inputSize = getInputSize();
        let speed = getSpeed();

        runVisualization(algorithm, inputSize, speed);
    });

    inputSizeButtons.forEach(button => {
        button.addEventListener("change", (event) => {
            let algorithm = getAlgorithm();
            let inputSize = parseInt(event.target.value);
            let speed = getSpeed();

            runVisualization(algorithm, inputSize, speed);
        })
    });

    speedButtons.forEach(button => {
        button.addEventListener("change", (event) => {
            let algorithm = getAlgorithm();
            let inputSize = getInputSize();
            let speed = parseInt(event.target.value);
        
            runVisualization(algorithm, inputSize, speed);
        })
    });


    let algorithm = getAlgorithm();
    let inputSize = getInputSize();
    let speed = getSpeed();

    runVisualization(algorithm, inputSize, speed);
})