interface Array<T> {

    /** Finds the element with the maximum value, according to a given predicate. */
    maxBy<U>(predicate: (element: T) => U): T;
}

Array.prototype.maxBy = function <T, U>(predicate: (element: T) => U): T {
    const ARRAY: Array<T> = this;

    let maximum: T = ARRAY[0];
    ARRAY.forEach(element => {
        if (predicate(maximum) <= predicate(element)) { maximum = element; }
    });

    return maximum;
}