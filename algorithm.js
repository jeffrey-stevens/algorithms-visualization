
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


class SearchAlgorithm {

    constructor() {
    }

    async sort(arr, options) {}

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