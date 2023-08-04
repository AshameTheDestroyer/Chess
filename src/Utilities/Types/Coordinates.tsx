type Coordinates = {
    x: number;
    y: number;
};

export default Coordinates;

export function IndexToCoordinates(index: number, maximum: number): Coordinates {
    return {
        x: index % maximum,
        y: ~~(index / maximum),
    };
}

export function CoordinateToIndex(coordinates: Coordinates, maximum: number): number {
    return coordinates.x + coordinates.y * maximum;
}

export function RegularIndexToBoardIndex(index: number, maximum: number): number {
    const
        I: number = ~~(index / maximum) + 1,
        J: number = index % maximum + 1,
        INDEX: number = J + maximum ** 2 - maximum * I - 1;

    return INDEX;
}