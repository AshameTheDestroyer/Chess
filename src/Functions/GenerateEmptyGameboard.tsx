import Cell from "../Types/Cell";

export const CHESS_PIECE_COUNT: number = 8;

function GenerateEmptyGameboard(): Array<Array<Cell>> {
    return new Array(CHESS_PIECE_COUNT)
        .fill([]).map((_array, i) => new Array(CHESS_PIECE_COUNT)
            .fill(null).map<Cell>((_cell, j) => {
                return { x: i, y: j };
            })
        );
}

export default GenerateEmptyGameboard;