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


    async merge(arr, i, k, j, options) {
        let size = j - i + 1;
        let tmpArr = new Array(size);

        let leftIdx = i;
        let rightIdx = k;
        let leftIsLeast;

        for (let n = 0; n < size; n++) {
            
            leftIsLeast = (rightIdx > j) || 
                ((leftIdx < k) && (arr.value(leftIdx) <= arr.value(rightIdx)));

            if (leftIsLeast) {
                tmpArr[n] = arr.index(leftIdx);
                leftIdx++;
            } else {
                tmpArr[n] = arr.index(rightIdx);
                rightIdx++;
            }
        }

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
            .attr('fill', 'black')
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
}