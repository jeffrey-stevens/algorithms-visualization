class Quicksort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async pre_sort_left(arr, i, k, j, options) {}
    async pre_sort_right(arr, i, k, j, options) {}
    async post_pivot(arr, pivotIdx, options) {}
    async seek_left(arr, k, options) {}
    async post_seek_left(arr, k, options) {}
    async seek_right(arr, l, options) {}
    async post_seek_right(arr, k, l, pivotIdx, options) {}
    async found_left(arr, k, options) {}
    async found_right(arr, l, options) {}
    async pre_swap(arr, k, l, options) {}
    async post_swap(arr, k, l, pivotIdx, options) {}
    async post_pass(arr, k, l, pivotIdx, options) {}
    async in_place(arr, i, options) {}
    async end(arr, options) {}


    getPivotIndex(arr, i, j) {

        let lowerIdx = Math.floor((i + j + 0.5) / 2);
        let higherIdx = Math.ceil((i + j + 0.5) / 2);

        // Set the pivot to be the greater of the two
        // This ensures that there's always at least one element in each split
        let pivotIdx;
        if (arr.value(lowerIdx) <= arr.value(higherIdx)) {
            pivotIdx = higherIdx;
        } else {
            pivotIdx = lowerIdx;
        }

        return pivotIdx;
    }


    async split(arr, i, j, options) {

        let pivotIdx = this.getPivotIndex(arr, i, j);
        let pivotVal = arr.value(pivotIdx);

        await this.post_pivot(arr, pivotIdx, options);

        // Split the array into halves, with the pivot in the upper half
        let k = i;
        let l = j;
        let in_order;

        while (k <= l) {

            in_order = true;
            while (in_order) {
                await this.seek_left(arr, k, options);
                in_order = arr.value(k) < pivotVal

                if (in_order) {
                    await this.post_seek_left(arr, k, pivotIdx, options);
                    k++;
                }
            }
            await this.found_left(arr, k, options);

            in_order = true;
            while (in_order) {
                await this.seek_right(arr, l, options);
                in_order = arr.value(l) >= pivotVal;

                if (in_order) {
                    await this.post_seek_right(arr, k, l, pivotIdx, options);
                    l--;
                }
            }
            await this.found_right(arr, l, options);

            if (k < l) {
                await this.pre_swap(arr, k, l, options);
                
                arr.swap(k, l);
                pivotIdx = (k === pivotIdx) ? l : pivotIdx;

                await this.post_swap(arr, k, l, pivotIdx, options);

                k++;
                l--;
            }
        }

        // Now k = l + 1
        await this.post_pass(arr, k, l, pivotIdx, options);

        return k;
    }

    
    async quicksort(arr, i, j, options) {
        if (i === j) {
            await this.in_place(arr, i, options);
            return;
        }

        let k = await this.split(arr, i, j, options);

        await this.pre_sort_left(arr, i, k, j, options);
        await this.quicksort(arr, i, k - 1, options);

        await this.pre_sort_right(arr, i, k, j, options);
        await this.quicksort(arr, k, j, options);
    }


    async sort(arr, options) {
        await this.begin(arr, options);

        this.quicksort(arr, 0, arr.length - 1, options);

        await this.end(arr, options);
    }
}



class QuicksortViz extends Quicksort {

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
            .attr('fill', 'lightgray')
        ;
    }


    async in_place(arr, i, options) {
        return this.bars()
            .filter(d => d.index == arr.index(i))
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }


    async post_pivot(arr, pivotIdx, options) {
        return this.bars()
            .filter(d => d.index == arr.index(pivotIdx))
            .transition()
            .duration(options.duration)
            .attr('fill', 'green')
            .end();
    }


    async seek_left(arr, k, options) {
        return this.bars()
            .filter(d => d.index == arr.index(k))
            .transition()
            .duration(options.duration)
            .attr('fill', 'red')
            .end();
    }


    async post_seek_left(arr, k, pivotIdx, options) {

        let promise;

        if (k === pivotIdx) {
            promise = this.bars()
                .filter(d => d.index == arr.index(pivotIdx))
                .transition()
                .duration(options.duration)
                .attr('fill', 'green')
                .end();

        } else {
            promise = this.bars()
                .filter(d => d.index == arr.index(k))
                .transition()
                .duration(options.duration)
                .attr('fill', 'lightcoral')
                .end();
        }

        return promise;
    }


    async seek_right(arr, l, options) {
        return this.bars()
            .filter(d => d.index == arr.index(l))
            .transition()
            .duration(options.duration)
            .attr('fill', 'blue')
            .end();
    }


    async post_seek_right(arr, k, l, pivotIdx, options) {

        let color;
        if (l === pivotIdx) {
            if (k === pivotIdx) {
                color = 'darkblue';
            } else {
                color = 'green';
            }
        } else {
            color = 'lightblue';
        }

        return this.bars()
            .filter(d => d.index == arr.index(l))
            .transition()
            .duration(options.duration)
            .attr('fill', color)
            .end();
    }


    async found_left(arr, k, options) {
        return this.bars()
            .filter(d => d.index == arr.index(k))
            .transition()
            .duration(options.duration)
            .attr('fill', 'darkblue')
            .end();
    }


    async found_right(arr, l, options) {
        return this.bars()
            .filter(d => d.index == arr.index(l))
            .transition()
            .duration(options.duration)
            .attr('fill', 'darkred')
            .end();
    }


    async pre_swap(arr, k, l, options) {

        let col_width = PLOT_WIDTH / arr.length;
        let bar_padding = 0.1 * col_width;

        let trans = d3.transition().duration(options.duration);

        let move_k_promise = this.bars()
            .filter(d => d.index == arr.index(k))
            .transition(trans)
            .attr('x', bar_padding + col_width * l)
            .end();
        
        let move_l_promise = this.bars()
            .filter(d => d.index == arr.index(l))
            .transition(trans)
            .attr('x', bar_padding + col_width * k)
            .end();

        return Promise.all([move_k_promise, move_l_promise]);
    }


    async post_swap(arr, k, l, pivotIdx, options) {
    
        let trans = d3.transition().duration(options.duration);
    
        let left_promise = this.bars()
            .filter(d => d.index == arr.index(k))
            .transition(trans)
            .attr('fill', 'lightcoral')
            .end();

        let rightColor = (l === pivotIdx) ? 'green' : 'lightblue';
        let right_promise = this.bars()
            .filter(d => d.index == arr.index(l))
            .transition(trans)
            .attr('fill', rightColor)
            .end();

        return Promise.all([left_promise, right_promise]);
    }


    async post_pass(arr, k, l, pivotIdx, options) {
    
        let trans = d3.transition().duration(options.duration);
    
        // Note that k is now to the right and l is now to the left
        let left_promise = this.bars()
            .filter(d => d.index == arr.index(l))
            .transition(trans)
            .attr('fill', 'lightcoral')
            .end();

        let right_promise = this.bars()
            .filter(d => d.index == arr.index(k))
            .transition(trans)
            .attr('fill', 'lightblue')
            .end();
        
        // Turn the pivot to lightblue
        let pivot_promise = this.bars()
            .filter(d => d.index == arr.index(pivotIdx))
            .transition(trans)
            .attr('fill', 'lightblue')
            .end();

        return Promise.all([left_promise, right_promise, pivot_promise]);
    }

    
    async pre_sort_left(arr, i, k, j, options) {

        let leftSize = (k - 1) - i + 1;
        let leftBars = new Array(leftSize);
        for (let n = i; n < k; n++) {
            leftBars[n - i] = arr.index(n);
        }

        let rightSize = j - k + 1;
        let rightBars = new Array(rightSize);
        for (let n = k; n <= j; n++) {
            rightBars[n - k] = arr.index(n);
        }

        let trans = d3.transition().duration(options.duration);

        let leftPromise = this.bars()
            .filter(d => leftBars.includes(d.index))
            .transition(trans)
            .attr('fill', 'lightgray')
            .end();

        let rightPromise = this.bars()
            .filter(d => rightBars.includes(d.index))
            .transition(trans)
            .attr('fill', 'darkgray')
            .end();
        
        return Promise.all([leftPromise, rightPromise]);
    }


    async pre_sort_right(arr, i, k, j, options) {

        let size = j - k + 1;
        let indices = new Array(size);
        for (let n = k; n <= j; n++) {
            indices[n - k] = arr.index(n);
        }

        return this.bars()
            .filter(d => indices.includes(d.index))
            .transition()
            .duration(options.duration)
            .attr('fill', 'lightgray')
            .end();
    }

}