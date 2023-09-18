interface Array<T> {

    /** Finds the element with the minimum value, according to a given predicate. */
    minBy<U>(predicate: (element: T) => U): T;
}

Array.prototype.minBy = function <T, U>(predicate: (element: T) => U): T {
    const ARRAY: Array<T> = this;

    let minimum: T = ARRAY[0];
    ARRAY.forEach(element => {
        if (predicate(minimum) >= predicate(element)) { minimum = element; }
    });

    return minimum;
}