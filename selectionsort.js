
class SelectionSort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async pre_pass(arr, i, options) {}
    async pre_step(arr, i, j, options) {}
    async new_min(arr, i, j, min_idx, options) {}
    async post_step(arr, i, j, min_idx, options) {}
    async swap(arr, i, min_idx, options) {}
    async post_pass(arr, i, min_idx, options) {}
    async end(arr, options) {}


    async sort(arr, options) {

        await this.begin(arr, options);

        for (let i = 0; i < arr.length - 1; i++) {
            await this.pre_pass(arr, i, options);

            let min_idx = i;
            for (let j = i + 1; j < arr.length; j++) {
                await this.pre_step(arr, i, j, options);

                if (arr.value(j) < arr.value(min_idx)) {
                    await this.new_min(arr, i, j, min_idx, options);
                    min_idx = j;
                }

                await this.post_step(arr, i, j, min_idx, options);
            }

            await this.swap(arr, i, min_idx, options);
            arr.swap(i, min_idx);

            await this.post_pass(arr, i, min_idx, options);
        }

        await this.end(arr, options);
    }

}


class SelectionSortViz extends SelectionSort {

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
            .filter(d => d.index == arr.index(j))
            .transition()
            .duration(options.duration)
            .attr('fill', 'red')
            .end();
    }


    async new_min(arr, i, new_min, old_min, options) {

        let trans = d3.transition().duration(options.duration);

        let old_min_promise = null;
        if (old_min != i) {
            // Turn the bar for the old min back to blue
            old_min_promise =  this.bars()
                .filter(d => d.index == arr.index(old_min))
                .transition(trans)
                .attr('fill', 'blue')
                .end();
        }

        let new_min_promise = this.bars()
            .filter(d => d.index == arr.index(new_min))
            .transition(trans)
            .attr('fill', 'darkred')
            .end();

        return Promise.all([old_min_promise, new_min_promise]);
    }


    async post_step(arr, i, j, min_idx, options) {

        if (j != min_idx) {
            return this.bars()
                .filter(d => d.index == arr.index(j))
                .transition()
                .duration(options.duration)
                .attr('fill', 'blue')
                .end()
        }

        return;
    }


    async swap(arr, i, j, options) {

        let col_width = PLOT_WIDTH / arr.length;
        let bar_padding = 0.1 * col_width;

        let trans = d3.transition().duration(options.duration);

        if (j != i) {
            let move_i_promise = this.bars()
                .filter(d => d.index == arr.index(i))
                .transition(trans)
                .attr('x', bar_padding + col_width * j)
                .end();
            
            let move_j_promise = this.bars()
                .filter(d => d.index == arr.index(j))
                .transition(trans)
                .attr('x', bar_padding + col_width * i)
                .end();

            return Promise.all([move_i_promise, move_j_promise]);
        }

        return;
    }


    async post_pass(arr, i, min_idx, options) {
        // The i-th element is now in order.  Change it to black, and the swapped element to blue:
    
        let trans = d3.transition().duration(options.duration);
    
        let new_min_promise = this.bars()
            .filter(d => d.index == arr.index(i))
            .transition(trans)
            .attr('fill', 'black')
            .end();

        let old_min_promise = null;
        if (i != min_idx) {
            old_min_promise = this.bars()
                .filter(d => d.index == arr.index(min_idx))
                .transition(trans)
                .attr('fill', 'blue')
                .end();
        }

        return Promise.all([new_min_promise, old_min_promise]);
    }


    async end(arr, options) {
        // At the end of the algorithm the last element is in order
        return this.bars()
            .filter(d => d.index == arr.index(arr.length - 1))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }

}