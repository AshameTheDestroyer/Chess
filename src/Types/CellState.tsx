enum CellState {
    selected = 2 ** 0,
    ready = 2 ** 1,
    playedFrom = 2 ** 2,
    playedTo = 2 ** 3,
    move = 2 ** 4,
    attack = 2 ** 5,
    enPassant = 2 ** 6,
    castle = 2 ** 7,
    promote = 2 ** 8,
    checked = 2 ** 9,
};

export default CellState;

export function IsCellStateSingular(cellState: CellState): boolean {
    return [
        CellState.ready,
        CellState.playedTo,
        CellState.selected,
        CellState.playedFrom,
    ].includes(GetMostImportantCellState(cellState));
}

export function IsCellStateMovable(cellState: CellState): boolean {
    return [
        CellState.move,
        CellState.enPassant,
        CellState.attack,
        CellState.castle,
        CellState.promote,
    ].includes(GetMostImportantCellState(cellState));
}

export function AddCellState(cellState1: CellState, cellState2: CellState): CellState {
    return cellState1 | cellState2;
}

export function RemoveCellState(cellState1: CellState, cellState2: CellState): CellState {
    return cellState1 & ~cellState2;
}

export function DoCellStatesIntersect(cellState1: CellState, cellState2: CellState): boolean {
    return cellState1 == (cellState1 | cellState2);
}

export function GetMostImportantCellState(cellState: CellState): CellState {
    return 2 ** ~~Math.log2(cellState);
}