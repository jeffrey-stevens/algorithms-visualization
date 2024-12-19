class Mergesort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async end(arr, options) {}
    async in_place(arr, i, options) {}
    async split(arr, i, k, j, options) {}
    async sort_left(arr, i, k, j, options) {}
    async sort_right(arr, i, k, j, options) {}
    async pre_merge(arr, i, k, j, options) {}
    async next_idx_found(arr, i, k, j, nextIdx, options) {}
    async copy_idx(arr, i, n, nextIdx, options) {}
    async post_copy_idx(arr, i, n, nextIdx, options) {}
    async copy_array(arr, i, j, options) {}


    async merge(arr, i, k, j, options) {
        let size = j - i + 1;
        let tmpArr = new Array(size);

        let leftIdx = i;
        let rightIdx = k;
        let leftIsLeast;

        await this.pre_merge(arr, i, k, j, options);

        for (let n = 0; n < size; n++) {
            
            leftIsLeast = (rightIdx > j) || 
                ((leftIdx < k) && (arr.value(leftIdx) <= arr.value(rightIdx)));
            let nextIdx = (leftIsLeast) ? leftIdx : rightIdx;

            await this.next_idx_found(arr, i, k, j, nextIdx, options);

            await this.copy_idx(arr, i, n, nextIdx, options);
            tmpArr[n] = arr.index(nextIdx);
            await this.post_copy_idx(arr, i, n, nextIdx, options);

            (leftIsLeast) ? leftIdx++ : rightIdx++;
        }

        await this.copy_array(arr, i, j, options);

        // Copy the temporary array to arr
        for (let n = 0; n < size; n++) {
            arr.setIndex(i + n, tmpArr[n]);
        }
    }


    async mergesort(arr, i, j, options) {
        if (i === j) {
            await this.in_place(arr, i, options);
            return;
        }

        let k = Math.trunc((i + j + 1) / 2);

        await this.sort_left(arr, i, k, j, options);
        await this.mergesort(arr, i, k - 1, options);

        await this.sort_right(arr, i, k, j, options);
        await this.mergesort(arr, k, j, options);

        await this.merge(arr, i, k, j, options);
    }


    async sort(arr, options) {

        await this.begin(arr, options);

        await this.mergesort(arr, 0, arr.length - 1, options);

        await this.end(arr, options);
    }
}


class MergesortViz extends Mergesort {

    ROW_PADDING = 10;

    svg;

    constructor(svg) {
        super();
        this.svg = svg;
    }

    bars() {
        return this.svg.selectAll('rect');
    }


    async begin(arr, options) {
        
        let row_height = (PLOT_HEIGHT - this.ROW_PADDING) / 2;

        let data = [];
        for (let i = 0; i < arr.length; i++) {
            data[i] = {
                index: arr.index(i),
                // Easier to scale the value here...
                // Just a workaround; should removed dependence on the scale
                value: (row_height / PLOT_HEIGHT) * arr.value(i)
            };
        }

        let col_width = PLOT_WIDTH / arr.length;
        let top_row_base = PLOT_HEIGHT - row_height - this.ROW_PADDING;
        let bar_padding = 0.1 * col_width;
        let bar_width = col_width - 2 * bar_padding;

        this.bars()
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => bar_padding + col_width * d.index)
            .attr('y', d => top_row_base - d.value)
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
            .attr('fill', 'darkgray')
            .end();
    }


    async sort_left(arr, i, k, j, options) {

        let leftSize = (k - 1) - i + 1;
        let leftIndices = new Array(leftSize);
        for (let n = 0; n < leftSize; n++) {
           leftIndices[n] = arr.index(n + i);
        }

        return this.bars()
            .filter(d => leftIndices.includes(d.index))
            .transition()
            .duration(options.duration)
            .attr('fill', 'lightcoral')
            .end();
    }

    async sort_right(arr, i, k, j, options) {

        let rightSize = j - k + 1;
        let rightIndices = new Array(rightSize);
        for (let n = 0; n < rightSize; n++) {
           rightIndices[n] = arr.index(n + k);
        }

        return this.bars()
            .filter(d => rightIndices.includes(d.index))
            .transition()
            .duration(options.duration)
            .attr('fill', 'lightcoral')
            .end();
    }


    async pre_merge(arr, i, k, j, options) {

        let leftSize = (k - 1) - i + 1;
        let leftIndices = new Array(leftSize);
        for (let n = 0; n < leftSize; n++) {
           leftIndices[n] = arr.index(n + i);
        }

        let rightSize = j - k + 1;
        let rightIndices = new Array(rightSize);
        for (let n = 0; n < rightSize; n++) {
           rightIndices[n] = arr.index(n + k);
        }

        let trans = d3.transition().duration(options.duration)

        let leftPromise = this.bars()
            .filter(d => leftIndices.includes(d.index))
            .transition(trans)
            .attr('fill', 'red')
            .end();

        let rightPromise = this.bars()
            .filter(d => rightIndices.includes(d.index))
            .transition(trans)
            .attr('fill', 'blue')
            .end();

        return Promise.all([leftPromise, rightPromise]);
    }


    async next_idx_found(arr, i, k, j, nextIdx, options) {

        let color;
        if (i <= nextIdx && nextIdx < k) {
            color = 'darkred';
        } else if (k <= nextIdx && nextIdx <= j) {
            color = 'darkblue';
        }

        return this.bars()
            .filter(d => d.index === arr.index(nextIdx))
            .transition()
            .duration(options.duration)
            .attr('fill', color)
            .end();
    }


    async copy_idx(arr, i, n, nextIdx, options) {

        let col_width = PLOT_WIDTH / arr.length;
        let bar_padding = 0.1 * col_width;

        return this.bars()
            .filter(d => d.index === arr.index(nextIdx))
            .transition()
            .duration(options.duration)
            .attr('x', bar_padding + col_width * (i + n))
            .attr('y', d => PLOT_HEIGHT - d.value)
            .end();
    }


    async post_copy_idx(arr, i, n, nextIdx, options) {

        // return this.bars()
        //     .filter(d => d.index == arr.index(nextIdx))
        //     .transition()
        //     .duration(options.duration)
        //     .attr('fill', 'darkgray')
        //     .end();
    }


    async copy_array(arr, i, j, options) {
        let size = j - i + 1;
        let indices = new Array(size);
        for (let n = 0; n < size; n++) {
           indices[n] = arr.index(n + i);
        }

        let row_height = (PLOT_HEIGHT - this.ROW_PADDING) / 2;

        return this.bars()
            .filter(d => indices.includes(d.index))
            .transition()
            .duration(options.duration)
            .attr('y', d => row_height - d.value)
            .attr('fill', 'lightgray')
            .end();
    }


    async end(arr, options) {
        return this.bars()
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }

}