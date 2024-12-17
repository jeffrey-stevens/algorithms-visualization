class InsertionSort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async pre_pass(arr, i, options) {}
    async pre_step(arr, i, j, options) {}
    async swap(arr, i, j, options) {}
    async post_step(arr, i, j, options) {}
    async post_pass(arr, i, j, options) {}
    async end(arr, options) {}


    async sort(arr, options) {

        await this.begin(arr, options);

        for (let i = 1; i < arr.length; i++) {

            await this.pre_pass(arr, i, options);

            let j = i;
            let done = false;
            while (j > 0 && !done) {
                await this.pre_step(arr, i, j, options);

                if (arr.value(j) < arr.value(j - 1)) {
                    await this.swap(arr, i, j, options);
                    arr.swap(j, j - 1);
                } else {
                    done = true;
                }

                await this.post_step(arr, i, j, options);

                j--;
            }

            await this.post_pass(arr, i, j, options);
        }
    
        await this.end(arr, options);
    }
}


class InsertionSortViz extends InsertionSort {

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
        return this.bars()
            .filter(d => d.index == arr.index(i))
            .transition()
            .duration(options.duration)
            .attr('fill', 'darkred')
            .end();
    }


    async pre_step(arr, i, j, options) {
        // Highlight the two active bars
        return this.bars()
            .filter(d => d.index == arr.index(j - 1))
            .transition()
            .duration(options.duration)
            .attr('fill', 'red')
            .end();
    }


    async swap(arr, i, j, options) {

        let col_width = PLOT_WIDTH / arr.length;
        let bar_padding = 0.1 * col_width;

        let trans = d3.transition().duration(options.duration);

        let move_i_promise = this.bars()
            .filter(d => d.index == arr.index(j))
            .transition(trans)
            .attr('x', bar_padding + col_width * (j - 1))
            .end();
        
        let move_j_promise = this.bars()
            .filter(d => d.index == arr.index(j - 1))
            .transition(trans)
            .attr('x', bar_padding + col_width * j)
            .end();

        return Promise.all([move_i_promise, move_j_promise]);
    }


    async post_step(arr, i, j, options) {
        // Whether there was a swap or not, the element at j is now in-place
        return this.bars()
            .filter(d => d.index == arr.index(j))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }


    async post_pass(arr, i, j, options) {
        // j now corresponds to the element before the one that was just put in place.
        // This will be red.  Change it back to black.
        return this.bars()
            .filter(d => d.index == arr.index(j))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }

    
    async end(arr, options) {}

}