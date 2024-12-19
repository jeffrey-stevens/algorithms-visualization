class Mergesort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async end(arr, options) {}


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
            return;
        }

        let k = Math.trunc((i + j + 1) / 2);
        await this.mergesort(arr, i, k - 1, options);
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


    // async begin(arr, options) {
    //     let data = [];
    //     for (let i = 0; i < arr.length; i++) {
    //         data[i] = {
    //             index: arr.index(i),
    //             value: arr.value(i)
    //         };
    //     }

    //     let col_width = PLOT_WIDTH / arr.length;
    //     let row_height = (PLOT_HEIGHT - ROW_PADDING) / 2;
    //     let top_row_base = PLOT_HEIGHT - row_height - ROW_PADDING;
    //     let bar_padding = 0.1 * col_width;
    //     let bar_width = col_width - 2 * bar_padding;

    //     this.bars()
    //         .data(data)
    //         .enter()
    //         .append('rect')
    //         .attr('x', d => bar_padding + col_width * d.index)
    //         .attr('y', d => PLOT_HEIGHT - d.value)
    //         .attr('width', bar_width)
    //         .attr('height', d => d.value)
    //         .attr('fill', 'lightgray')
    //     ;
    // }
}