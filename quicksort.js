class Quicksort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async sort_left(arr, i, k, j, options) {}
    async sort_right(arr, i, k, j, options) {}
    async post_pivot(arr, pivotIdx, options) {}
    async pre_seek(arr, k, options) {}
    async post_seek(arr, k, options) {}
    async found(arr, k, options) {}
    async pre_swap(arr, k, l, options) {}
    async post_swap(arr, k, l, options) {}
    async in_place(arr, i, options) {}
    async end(arr, options) {}


    getPivotIndex(arr, i, j) {

        let lowerIdx = Math.floor((arr.length - 0.5) / 2);
        let higherIdx = Math.ceil((arr.length - 0.5) / 2);

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

        while (k <= l) {
            while (arr.value(k) < pivotVal) {
                await this.pre_seek(arr, k, options);
                k++;
                await this.post_seek(arr, k, options);
            }
            await this.found(k, options);

            while (arr.value(l) >= pivotVal) {
                await this.pre_seek(arr, k, options);
                l--;
                await this.post_seek(arr, k, options);
            }
            await this.found(k, options);

            if (k < l) {
                await this.pre_swap(arr, k, l, options);
                arr.swap(k, l);
                await this.post_swap(arr, k, l, options);
            }
        }

        return k;
    }

    
    async quicksort(arr, i, j, options) {
        if (i === j) {
            await this.in_place(arr, i, options);
            return;
        }

        let k = this.split(arr, i, j, options);

        await this.sort_left(arr, i, k, j, options);
        this.quicksort(arr, i, k - 1, options);

        await this.sort_right(arr, i, k, k, options);
        this.quicksort(arr, k, j, options);
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

}