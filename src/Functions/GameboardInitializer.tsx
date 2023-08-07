import Cell from "../Types/Cell";
import { CHESS_PIECE_COUNT } from "../Store/Features/GameboardSlice/GameboardSlice";

function InitializeGameboard(): Array<Array<Cell>> {
    return new Array(CHESS_PIECE_COUNT)
        .fill([]).map((_array, i) => new Array(CHESS_PIECE_COUNT)
            .fill(null).map<Cell>((_cell, j) => {
                return { x: i, y: j };
            })
        );
}

export default InitializeGameboard;