import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import InitializeGameboard from "../../../Functions/GameboardInitializer";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import { AddCellState, DoCellStatesIntersect, IsCellStateSingular, RemoveCellState } from "../../../Types/CellState";

type GameboardSliceType = {
    pieceCells?: Array<Cell>;
    cells: Array<Array<Cell>>;
};

export const CHESS_PIECE_COUNT: number = 8;

const INITIAL_STATE: GameboardSliceType = {
    cells: InitializeGameboard(),
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

        ResetGameboard: (state: GameboardSliceType): void => {
            state.cells = InitializeGameboard();
            state.pieceCells = null;
        },

        SetUpGame: (state: GameboardSliceType, action: PayloadAction<SetUpGameActionType>): void => {
            state.pieceCells = DecodeFENCode(action.payload.FENCode);
            state.pieceCells.forEach(pieceCell =>
                state.cells[pieceCell.x][pieceCell.y].piece = pieceCell.piece);
        },

        AddStateToCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y } = action.payload;
            state.cells[x][y].state = AddCellState(state.cells[x][y].state, action.payload.cellState);
        },

        RemoveStateFromCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y } = action.payload;
            state.cells[x][y].state = RemoveCellState(state.cells[x][y].state, action.payload.cellState);
        },

        RemoveStateFromSingularCell: (state: GameboardSliceType, action: PayloadAction<Omit<AlterCellStateActionType, "x" | "y">>): void => {
            if (!IsCellStateSingular(action.payload.cellState)) {
                throw new EvalError(`The Cell State "${action.payload.cellState}" is not a Singular Cell State`);
            }

            const cell: Cell = state.cells.flat().find(cell => DoCellStatesIntersect(cell.state, action.payload.cellState));

            if (cell == null) { return; }

            cell.state = RemoveCellState(cell.state, action.payload.cellState);
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
    MovePiece,
    AddStateToCell,
    ResetGameboard,
    SetUpInitialGame,
    RemoveStateFromCell,
    RemoveStateFromSingularCell,
} = GameboardSlice.actions;