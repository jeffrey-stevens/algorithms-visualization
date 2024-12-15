const PLOT_WIDTH = 600;
const PLOT_HEIGHT = 400;

var plot = d3.select('#plot')
var svg = plot
    .append('svg')
    .attr('width', PLOT_WIDTH)
    .attr('height', PLOT_HEIGHT)


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


async function bubblesort_begin(arr, options) {
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


async function bubblesort_pre_pass(arr, i, options) {
    return;
}


async function bubblesort_pre_step(arr, i, j, options) {
    // Highlight the two active bars
    return bars()
        .filter(d => d.index == arr.index(j) || d.index == arr.index(j + 1))
        .transition()
        .duration(options.duration)
        .attr('fill', 'red')
        .end();
}


async function bubblesort_do_step(arr, i, j, options) {

    let col_width = PLOT_WIDTH / arr.length;
    let bar_padding = 0.1 * col_width;

    return bars()
        .filter(d => d.index == arr.index(j) || d.index == arr.index(j + 1))
        .transition()
        .duration(options.duration)
        .attr('x', d => {
            // Shift index[j] to position j + 1
            // and index[j + 1] to position j
            if (d.index == arr.index(j)) {
                return bar_padding + col_width * (j + 1);
            } else if (d.index == arr.index(j + 1)) {
                return bar_padding + col_width * j;
            }
            // These should be the only two conditions
        })
        .end();
}


async function bubblesort_post_step(arr, i, j, options) {
    // Change them back to blue
    return bars()
        .filter(d => d.index == arr.index(j) || d.index == arr.index(j + 1))
        .transition()
        .duration(options.duration)
        .attr('fill', 'blue')
        .end()
}


async function bubblesort_post_pass(arr, i, options) {
    // The i-th element is now in order.  Change it to black:
    return bars()
        .filter(d => d.index == arr.index(i))
        .transition()
        .duration(options.duration)
        .attr('fill', 'black')
        .end();
}


async function bubblesort_end(arr, options) {
    // At the end of the algorithm the last element is in order
    return bars()
        .filter(d => d.index == arr.index(0))
        .transition()
        .duration(options.duration)
        .attr('fill', 'black')
        .end();
}


// Takes a swappable array as input
async function bubblesort(arr, hooks, options) {

    await hooks.begin(arr, options);

    let last = arr.length - 1;
    for (let i = last; i > 0; i--) {
        await hooks.pre_pass(arr, i, options);

        for (let j = 0; j < i; j++) {
            await hooks.pre_step(arr, i, j, options);

            if (arr.value(j) > arr.value(j + 1)) {
                await hooks.do_step(arr, i, j, options);
                arr.swap(j, j + 1);
            }

            await hooks.post_step(arr, i, j, options);
        }

        await hooks.post_pass(arr, i, options);
    }

    await hooks.end(arr, options);
}


function visualize_bubblesort(n, step_duration) {
    let data = [];
    for (let i = 0; i < n; i++) {
        data[i] = PLOT_HEIGHT * Math.random();
    }

    let arr = new SwappableArray(data);

    let hooks = {
        begin: bubblesort_begin,
        pre_pass: bubblesort_pre_pass,
        pre_step: bubblesort_pre_step,
        do_step: bubblesort_do_step,
        post_step: bubblesort_post_step,
        post_pass: bubblesort_post_pass,
        end: bubblesort_end
    };

    let options = {
        duration: step_duration
    }

    bubblesort(arr, hooks, options).then(console.log("Complete!")); 
}


visualize_bubblesort(10, 500);
