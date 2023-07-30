import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import Coordinates from "./Coordinates";
import Cell, { CellState } from "./Cell";
import { Store } from "../../Store/Store";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";

type GameboardSliceType = {
    readyCell?: Cell;
    selectedCell?: Cell;
    playedToCell?: Cell;
    playedFromCell?: Cell;
    pieceCells?: Array<Cell>;
    cells: Array<Array<Cell>>;
};

export const CHESS_PIECE_COUNT: number = 8;

const INITIAL_STATE: GameboardSliceType = {
    cells: new Array(CHESS_PIECE_COUNT)
        .fill([]).map((_array, i) => new Array(CHESS_PIECE_COUNT)
            .fill(null).map<Cell>((_cell, j) => {
                return { x: i, y: j };
            })
        ),
};

export const GameboardSlice = createSlice({
    name: "gameboard",
    initialState: INITIAL_STATE,

    reducers: {
        SetUpInitialGame: (state: GameboardSliceType): void => {
            state.pieceCells = DecodeFENCode(INITIAL_GAME_FEN_CODE);
            state.pieceCells.forEach(pieceCell =>
                state.cells[pieceCell.x][pieceCell.y].piece = pieceCell.piece);
        },

        UpdateCell: (state: GameboardSliceType, action: PayloadAction<{ coordinates: Coordinates, cellState: CellState }>): void => {
            const { x, y } = action.payload.coordinates;

            switch (action.payload.cellState) {
                case "selected": state.selectedCell = state.cells[x][y]; break;
                case "ready": state.readyCell = state.cells[x][y]; break;
                case "played-from": state.playedFromCell = state.cells[x][y]; break;
                case "played-to": state.playedToCell = state.cells[x][y]; break;
            }
        },

        ResetCell: (state: GameboardSliceType, action: PayloadAction<{ cellState: CellState }>): void => {
            switch (action.payload.cellState) {
                case "selected": delete state.selectedCell; break;
                case "ready": delete state.readyCell; break;
                case "played-from": delete state.playedFromCell; break;
                case "played-to": delete state.playedToCell; break;
            }
        },

        MovePiece: (state: GameboardSliceType, action: PayloadAction<MovePieceActionType>): void => {
            const
                { x: x1, y: y1 }: Coordinates = action.payload.from,
                { x: x2, y: y2 }: Coordinates = action.payload.to;

            const
                fromCell: Cell = state.cells[x1][y1],
                toCell: Cell = state.cells[x2][y2];

            let
                movingPieceExists: boolean = fromCell.piece != null,
                targetPieceExists: boolean = toCell.piece != null;

            if (!movingPieceExists) {
                throw new Error(`Cell at { x: ${x1}, y: ${y1} } contains no piece.`);
            }

            if (targetPieceExists) {
                state.pieceCells =
                    state.pieceCells.filter(pieceCell => pieceCell.x != x2 || pieceCell.y != y2);
            }

            const movedPieceCell: Cell =
                state.pieceCells.find(pieceCell => pieceCell.x == x1 && pieceCell.y == y1);

            movedPieceCell.x = x2, movedPieceCell.y = y2;

            toCell.piece = fromCell.piece;
            delete fromCell.piece;
        },
    },
});

// @ts-ignore
export const SelectGameboardSlice = (state: typeof Store): GameboardSliceType => state.gameboard;

export const GameboardSliceReducer = GameboardSlice.reducer;

export const {
    ResetCell,
    MovePiece,
    UpdateCell,
    SetUpInitialGame,
} = GameboardSlice.actions;