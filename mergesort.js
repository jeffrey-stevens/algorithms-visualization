class Mergesort extends SortAlgorithm {

    constructor() {
        super();
    }

    async begin(arr, options) {}
    async end(arr, options) {}
    async pre_sort(arr, i, j, options) {}
    async in_place(arr, i, options) {}
    async post_in_place(arr, i, options) {}
    async split(arr, i, k, j, options) {}
    async sort_left(arr, i, k, j, options) {}
    async sort_right(arr, i, k, j, options) {}
    async post_merge(arr, i, k, j, options) {}
    async pre_merge(arr, i, k, j, options) {}
    async next_idx_found(arr, i, k, j, nextIdx, options) {}
    async copy_idx(arr, i, n, nextIdx, options) {}
    async post_copy_idx(arr, i, n, nextIdx, options) {}
    async copy_array(arr, i, j, options) {}
    async split(arr, i, k, j, options) {}


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

        await this.pre_sort(arr, i, j, options);

        if (i === j) {
            await this.in_place(arr, i, options);
            await this.post_in_place(arr, i, options);
            return;
        }

        let k = Math.trunc((i + j + 1) / 2);
        await this.split(arr, i, k, j, options);

        await this.sort_left(arr, i, k, j, options);
        await this.mergesort(arr, i, k - 1, options);

        await this.sort_right(arr, i, k, j, options);
        await this.mergesort(arr, k, j, options);

        await this.merge(arr, i, k, j, options);

        await this.post_merge(arr, i, k, j, options);
    }


    async sort(arr, options) {

        await this.begin(arr, options);

        await this.mergesort(arr, 0, arr.length - 1, options);

        await this.end(arr, options);
    }
}


class MergesortViz extends Mergesort {

    ROW_PADDING = 10;
    PADDING_FACTOR = 0.1;

    svg;

    constructor(svg) {
        super();

        this.svg = svg;
    }

    bars() {
        return this.svg.selectAll('rect');
    }

    col_width(arr) {
        return PLOT_WIDTH / arr.length;
    }

    row_height() {
        return (PLOT_HEIGHT - this.ROW_PADDING) / 2;
    }

    top_row_base() {
        return PLOT_HEIGHT - this.row_height() - this.ROW_PADDING;
    }

    bar_padding(arr) {
        return this.PADDING_FACTOR * this.col_width(arr);
    }

    bar_width(arr) {
        return this.col_width(arr) - 2 * this.bar_padding(arr);
    }

    group_bar_base() {
        return this.top_row_base() + this.ROW_PADDING / 2;
    }


    async color_bar(arr, i, color, trans, options) {
        if (trans === null) {
            trans = d3.transition().duration(options.duration);
        }

        let barPromise = this.bars()
            .filter(d => d.index === arr.index(i))
            .transition(trans)
            .attr('fill', color)
            .end();

        return barPromise;
    }
    

    async color_bars(arr, i, j, color, trans, options) {

        if (trans === null) {
            trans = d3.transition().duration(options.duration);
        }

        let size = j - i + 1;
        let barIndices = new Array(size);
        for (let n = 0; n < size; n++) {
           barIndices[n] = arr.index(i + n);
        }

        let barsPromise = this.bars()
            .filter(d => barIndices.includes(d.index))
            .transition(trans)
            .attr('fill', color)
            .end();

        return barsPromise;
    }


    new_group_bar(arr, i, j, color, options) {

        let barPadding = this.bar_padding(arr);
        let colWidth = this.col_width(arr);
        let groupBarBase = this.group_bar_base();

        let groupBar = this.svg
            .append('line')
            .datum({i: i, j: j})
            .attr('x1', d => colWidth * d.i + barPadding)
            .attr('x2', d => colWidth * (d.j + 1) - barPadding)
            .attr('y1', groupBarBase)
            .attr('y2', groupBarBase)
            .style('stroke', color)
            .style('stroke-width', 4)
            .style('opacity', 0);
    
        return groupBar;
    }


    get_group_bar(i, j) {
        let groupBar = this.svg.selectAll('line')
            .filter(d => d.i === i && d.j===j);
        return groupBar;
    }


    async break_group_bar(arr, i, k, j, color, trans, options) {

        if (trans === null) {
            trans = d3.transition().duration(options.duration);
        }

        let oldGroupBar = this.get_group_bar(i, j);
        let leftGroupBar = this.new_group_bar(arr, i, k - 1, color, options);
        let rightGroupBar = this.new_group_bar(arr, k, j, color, options);

        let oldGroupBarPromise = oldGroupBar
            .transition(trans)
            .style('opacity', 0)
            .end();
        
        let leftGroupBarPromise = leftGroupBar
            .raise()
            .transition(trans)
            .style('opacity', 1)
            .end();

        let rightGroupBarPromise = rightGroupBar
            .raise()
            .transition(trans)
            .style('opacity', 1)
            .end();
        
        let allPromises = Promise.all([oldGroupBarPromise, leftGroupBarPromise, rightGroupBarPromise])
            .then(result => {
                oldGroupBar.remove();
                leftGroupBar.lower();
                rightGroupBar.lower();
            })

        return allPromises;
    }


    async merge_group_bars(arr, i, k, j, color, trans, options) {

        if (trans === null) {
            trans = d3.transition().duration(options.duration);
        }

        let leftGroupBar = this.get_group_bar(i, k - 1);
        let rightGroupBar = this.get_group_bar(k, j);
        let newGroupBar = this.new_group_bar(arr, i, j, color, options);

        let leftGroupBarPromise = leftGroupBar
            .raise()
            .transition(trans)
            .style('opacity', 0)
            .end()
            .then(result => {
                leftGroupBar.remove()
            });

        let rightGroupBarPromise = rightGroupBar
            .raise()
            .transition(trans)
            .style('opacity', 0)
            .end()
            .then(result => {
                rightGroupBar.remove()
            });
        
        let newGroupBarPromise = newGroupBar
            .lower()
            .transition(trans)
            .style('opacity', 1)
            .end();

        let allPromises = Promise.all([leftGroupBarPromise, rightGroupBarPromise, newGroupBarPromise]);

        return allPromises;
    }


    async color_group_bar(i, j, color, options) {

        let groupBar = this.get_group_bar(i, j);

        return groupBar
            .transition()
            .duration(options.duration)
            .style('stroke', color)
            .end();
    }


    async begin(arr, options) {

        let rowHeight = this.row_height();
        let barPadding = this.bar_padding(arr);
        let colWidth = this.col_width(arr);
        let barWidth = this.bar_width(arr);
        let topRowBase = this.top_row_base();
        
        let data = [];
        for (let i = 0; i < arr.length; i++) {
            data[i] = {
                index: arr.index(i),
                // Easier to scale the value here...
                // Just a workaround; should remove dependence on the scale
                value: (rowHeight / PLOT_HEIGHT) * arr.value(i)
            };
        }

        this.bars()
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => barPadding + colWidth * d.index)
            .attr('y', d => topRowBase - d.value)
            .attr('width', barWidth)
            .attr('height', d => d.value)
            .attr('fill', 'lightgray')
        ;

        this.new_group_bar(arr, 0, arr.length - 1, 'lightgray', options)
            .style('opacity', 1);
    }


    async pre_sort(arr, i, j, options) {
        return this.color_group_bar(i, j, 'darkgray', options);
    }


    async in_place(arr, i, options) {
        return this.color_bar(arr, i, 'lightcoral', null, options) ;
    }


    async post_in_place(arr, i, options) {
        let barPromise = this.color_bar(arr, i, 'darkgray', null, options) ;
        let groupBarPromise = this.color_group_bar(i, i, 'black', options);

        return Promise.all([barPromise, groupBarPromise]);
    }


    async split(arr, i, k, j, options) {

        let trans = d3.transition().duration(options.duration)

        let leftBarsPromise = this.color_bars(arr, i, k - 1, 'lightcoral', trans, options);
        let rightBarsPromise = this.color_bars(arr, k, j, 'lightblue', trans, options);
        let groupBarsPromise = this.break_group_bar(arr, i, k, j, 'darkgray', trans, options);
        
        return Promise.all([leftBarsPromise, rightBarsPromise, groupBarsPromise]);
    }


    async sort_left(arr, i, k, j, options) {

        let rightSize = j - k + 1;
        let rightIndices = new Array(rightSize);
        for (let n = 0; n < rightSize; n++) {
           rightIndices[n] = arr.index(n + k);
        }

        let trans = d3.transition().duration(options.duration);

        let rightBarsPromise = this.color_bars(arr, k, j, 'lightgray', trans, options);
        let leftGroupBarPromise = this.color_group_bar(i, k - 1, 'darkgray', options);
        let rightGroupBarPromise = this.color_group_bar(k, j, 'lightgray', options);

        return Promise.all([rightBarsPromise, leftGroupBarPromise, rightGroupBarPromise]);
    }


    async sort_right(arr, i, k, j, options) {

        let trans = d3.transition().duration(options.duration);

        let rightBarsPromise = this.color_bars(arr, k, j, 'lightcoral', trans, options);
        let rightGroupBarPromise = this.color_group_bar(k, j, 'darkgray', options);

        return Promise.all([rightBarsPromise, rightGroupBarPromise]);
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

        let leftBarsPromise = this.color_bars(arr, i, k - 1, 'lightcoral', trans, options);
        let rightBarsPromise = this.color_bars(arr, k, j, 'lightblue', trans, options);
        let groupBarPromise = this.merge_group_bars(arr, i, k, j, 'darkgray', trans, options);

        return Promise.all([leftBarsPromise, rightBarsPromise, groupBarPromise]);
    }


    async next_idx_found(arr, i, k, j, nextIdx, options) {

        let color;
        if (i <= nextIdx && nextIdx < k) {
            color = 'darkred';
        } else if (k <= nextIdx && nextIdx <= j) {
            color = 'darkblue';
        }

        let barPromise = this.color_bar(arr, nextIdx, color, null, options);

        return barPromise;
    }


    async copy_idx(arr, i, n, nextIdx, options) {

        let colWidth = this.col_width(arr);
        let barPadding = this.bar_padding(arr)

        return this.bars()
            .filter(d => d.index === arr.index(nextIdx))
            .transition()
            .duration(options.duration)
            .attr('x', barPadding + colWidth * (i + n))
            .attr('y', d => PLOT_HEIGHT - d.value)
            .end();
    }


    async post_copy_idx(arr, i, n, nextIdx, options) {
    }


    async copy_array(arr, i, j, options) {
        let size = j - i + 1;
        let indices = new Array(size);
        for (let n = 0; n < size; n++) {
           indices[n] = arr.index(n + i);
        }

        let rowHeight = this.row_height();

        return this.bars()
            .filter(d => indices.includes(d.index))
            .transition()
            .duration(options.duration)
            .attr('y', d => rowHeight - d.value)
            .attr('fill', 'lightgray')
            .end();
    }


    async post_merge(arr, i, k, j, options) {

        let barsPromise = this.color_bars(arr, i, j, 'darkgray', null, options);
        let groupBarPromise = this.color_group_bar(i, j, 'black', options);
        let chainedPromise = groupBarPromise.then(result => barsPromise);

        return chainedPromise;
    }


    async end(arr, options) {
        return this.bars()
            .transition()
            .duration(options.duration)
            .attr('fill', 'black')
            .end();
    }

}