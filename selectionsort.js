const PLOT_WIDTH = 600;
const PLOT_HEIGHT = 400;

var plot = d3.select('#plot');
var svg = plot
    .append('svg')
    .attr('width', PLOT_WIDTH)
    .attr('height', PLOT_HEIGHT);


class SwappableArray {
    data;
    indices;

    constructor(data) {
        this.data = data;
        this.indices = []
        for (let i = 0; i < data.length; i++) {
            this.indices[i] = i;
        }
    }

    get length() {
        return this.data.length;
    }

    value(i) {
        if (i < 0 || i > this.length) {
            throw new RangeError("Index is out-of-range.");
        }
        let idx = this.indices[i];
        let d = this.data[idx];
        return d;
    }

    index(i) {
        if (i < 0 || i > this.length) {
            throw new RangeError("Index is out-of-range.");
        }
        return this.indices[i];
    }

    swap(i, j) {
        if (i < 0 || i > this.length) {
            throw new RangeError("Index i is out-of-range.");
        }
        if (j < 0 || j > this.length) {
            throw new RangeError("Index j is out-of-range.");
        }

        let tmp = this.indices[i];
        this.indices[i] = this.indices[j];
        this.indices[j] = tmp;
    }
}


function bars() {
    return svg.selectAll('rect');
}


async function selectionsort_begin(arr, options) {
    let data = [];
    for (let i = 0; i < arr.length; i++) {
        data[i] = {
            index: arr.index(i),
            value: arr.value(i)
        };
    }

    let col_width = PLOT_WIDTH / arr.length;
    let bar_padding = 0.1 * col_width;
    let bar_width = col_width - 2 * bar_padding;

    bars()
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => bar_padding + col_width * d.index)
        .attr('y', d => PLOT_HEIGHT - d.value)
        .attr('width', bar_width)
        .attr('height', d => d.value)
        .attr('fill', 'blue')
    ;
}


async function selectionsort_pre_pass(arr, i, options) {
    return bars()
        .filter(d => d.index == arr.index(i))
        .transition()
        .duration(options.duration)
        .attr('fill', 'darkred')
        .end();
}


async function selectionsort_pre_step(arr, i, j, options) {
    // Highlight the two active bars
    return bars()
        .filter(d => d.index == arr.index(j))
        .transition()
        .duration(options.duration)
        .attr('fill', 'red')
        .end();
}


async function selectionsort_new_min(arr, i, new_min, old_min, options) {

    let trans = d3.transition().duration(options.duration);

    let old_min_promise = null;
    if (old_min != i) {
        // Turn the bar for the old min back to blue
        old_min_promise =  bars()
            .filter(d => d.index == arr.index(old_min))
            .transition(trans)
            .attr('fill', 'blue')
            .end();
    }

    let new_min_promise = bars()
        .filter(d => d.index == arr.index(new_min))
        .transition(trans)
        .attr('fill', 'darkred')
        .end();

    return Promise.all([old_min_promise, new_min_promise]);
}


async function selectionsort_post_step(arr, i, j, min_idx, options) {

    if (j != min_idx) {
        return bars()
            .filter(d => d.index == arr.index(j))
            .transition()
            .duration(options.duration)
            .attr('fill', 'blue')
            .end()
    }

    return;
}


async function selectionsort_swap(arr, i, j, options) {

    let col_width = PLOT_WIDTH / arr.length;
    let bar_padding = 0.1 * col_width;

    let trans = d3.transition().duration(options.duration);

    if (j != i) {
        let move_i_promise = bars()
            .filter(d => d.index == arr.index(i))
            .transition(trans)
            .attr('x', bar_padding + col_width * j)
            .end();
        
        let move_j_promise = bars()
            .filter(d => d.index == arr.index(j))
            .transition(trans)
            .attr('x', bar_padding + col_width * i)
            .end();

        return Promise.all([move_i_promise, move_j_promise]);
    }

    return;
}


async function selectionsort_post_pass(arr, i, min_idx, options) {
    // The i-th element is now in order.  Change it to black, and the swapped element to blue:
   
    let trans = d3.transition().duration(options.duration);
   
    let new_min_promise = bars()
        .filter(d => d.index == arr.index(i))
        .transition(trans)
        .attr('fill', 'black')
        .end();

    let old_min_promise = null;
    if (i != min_idx) {
        old_min_promise = bars()
            .filter(d => d.index == arr.index(min_idx))
            .transition(trans)
            .attr('fill', 'blue')
            .end();
    }

    return Promise.all([new_min_promise, old_min_promise]);
}


async function selectionsort_end(arr, options) {
    // At the end of the algorithm the last element is in order
    return bars()
        .filter(d => d.index == arr.index(arr.length - 1))
        .transition()
        .duration(options.duration)
        .attr('fill', 'black')
        .end();
}


// Takes a swappable array as input
async function selectionsort(arr, hooks, options) {

    await hooks.begin(arr, options);

    for (let i = 0; i < arr.length - 1; i++) {
        await hooks.pre_pass(arr, i, options);

        let min_idx = i;
        for (let j = i + 1; j < arr.length; j++) {
            await hooks.pre_step(arr, i, j, options);

            if (arr.value(j) < arr.value(min_idx)) {
                await hooks.new_min(arr, i, j, min_idx, options);
                min_idx = j;
            }

            await hooks.post_step(arr, i, j, min_idx, options);
        }

        await hooks.swap(arr, i, min_idx, options);
        arr.swap(i, min_idx);

        await hooks.post_pass(arr, i, min_idx, options);
    }

    await hooks.end(arr, options);
}


function visualize_selectionsort(n, step_duration) {
    let data = [];
    for (let i = 0; i < n; i++) {
        data[i] = PLOT_HEIGHT * Math.random();
    }

    let arr = new SwappableArray(data);

    let hooks = {
        begin: selectionsort_begin,
        pre_pass: selectionsort_pre_pass,
        pre_step: selectionsort_pre_step,
        new_min: selectionsort_new_min,
        post_step: selectionsort_post_step,
        swap: selectionsort_swap,
        post_pass: selectionsort_post_pass,
        end: selectionsort_end
    };

    let options = {
        duration: step_duration
    }

    selectionsort(arr, hooks, options).then(console.log("Complete!")); 
}


visualize_selectionsort(10, 500);
