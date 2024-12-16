class BubbleSort extends Algorithm {
    constructor() {
        super();
    }

    async begin(arr, options) {}
    async pre_pass(arr, i, options) {}
    async pre_step(arr, i, j, options) {}
    async swap(arr, i, j, options) {}
    async post_step(arr, i, j, options) {}
    async post_pass(arr, i, options) {}
    async end(arr, options) {}


    // Takes a swappable array as input
    async sort(arr, options) {

        await this.begin(arr, options);

        let last = arr.length - 1;
        for (let i = last; i > 0; i--) {
            await this.pre_pass(arr, i, options);

            for (let j = 0; j < i; j++) {
                await this.pre_step(arr, i, j, options);

                if (arr.value(j) > arr.value(j + 1)) {
                    await this.swap(arr, i, j, options);
                    arr.swap(j, j + 1);
                }

                await this.post_step(arr, i, j, options);
            }

            await this.post_pass(arr, i, options);
        }

        await this.end(arr, options);
    }


    simulate(n, step_duration) {
        let data = [];
        for (let i = 0; i < n; i++) {
            data[i] = PLOT_HEIGHT * Math.random();
        }

        let arr = new SwappableArray(data);

        let options = {
            duration: step_duration
        }

        this.sort(arr, options)
            .then(console.log("Complete!")); 
    }
}


class BubbleSortImpl extends BubbleSort {

    svg;

    constructor(svg) {
        super();
        this.svg = svg;
    }


    bars() {
        return this.svg.selectAll('rect');
    }


    async begin(arr, options) {
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

        this.bars()
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


    async pre_pass(arr, i, options) {
        return;
    }


    async pre_step(arr, i, j, options) {
        // Highlight the two active bars
        return this.bars()
            .filter(d => d.index == arr.index(j) || d.index == arr.index(j + 1))
            .transition()
            .duration(options.duration)
            .attr('fill', 'red')
            .end();
    }


    async swap(arr, i, j, options) {

        let col_width = PLOT_WIDTH / arr.length;
        let bar_padding = 0.1 * col_width;

        return this.bars()
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


    async post_step(arr, i, j, options) {
        // Change them back to blue
        return this.bars()
            .filter(d => d.index == arr.index(j) || d.index == arr.index(j + 1))
            .transition()
            .duration(options.duration)
            .attr('fill', 'blue')
            .end()
    }


    async post_pass(arr, i, options) {
        // The i-th element is now in order.  Change it to black:
        return this.bars()
            .filter(d => d.index == arr.index(i))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }


    async end(arr, options) {
        // At the end of the algorithm the last element is in order
        return this.bars()
            .filter(d => d.index == arr.index(0))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }

}