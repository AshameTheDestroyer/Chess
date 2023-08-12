import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import InitializeGameboard from "../../../Functions/InitializeGameboard";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import PieceMovement, { GeneratePieceMovements } from "../../../Types/PieceMovements";
import EvaluatePieceMovement, { FindKingRookCells } from "../../../Functions/EvaluatePieceMovement";
import CellState, { AddCellState, DoCellStatesIntersect, IsCellStateMovable, IsCellStateSingular, RemoveCellState } from "../../../Types/CellState";
import { PieceColour } from "../../../Types/Piece";

type GameboardSliceType = {
    cells: Array<Array<Cell>>;
};

const INITIAL_STATE: GameboardSliceType = {
    cells: InitializeGameboard(),
};

export const GameboardSlice = createSlice({
    name: "gameboard",
    initialState: INITIAL_STATE,

    reducers: {
        SetUpInitialGame: (state: GameboardSliceType): void => {
            GameboardSlice.caseReducers.SetUpGame(state, {
                payload: { FENCode: INITIAL_GAME_FEN_CODE },
                type: "gameboard/SetUpGame",
            });
        },

        ResetGameboard: (state: GameboardSliceType): void => {
            state.cells = InitializeGameboard();
        },

        SetUpGame: (state: GameboardSliceType, action: PayloadAction<SetUpGameActionType>): void => {
            const pieceCells: Array<Cell> = DecodeFENCode(action.payload.FENCode);
            pieceCells.forEach(pieceCell =>
                state.cells[pieceCell.x][pieceCell.y].colouredPiece = pieceCell.colouredPiece);
        },

        AddStateToCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].state = AddCellState(state.cells[x][y].state, action.payload.cellState);

            let cellHasPiece: boolean = state.cells[x][y].colouredPiece != null,
                cellIsReady: boolean = action.payload.cellState == CellState.ready;

            if (cellIsReady) {
                state.cells.flat().forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
            }

            if (!cellHasPiece || !cellIsReady) { return; }

            const pieceMovements: Array<PieceMovement | Array<PieceMovement>> =
                GeneratePieceMovements(state.cells[x][y].colouredPiece.piece);

            pieceMovements.forEach(pieceMovement => {
                if (pieceMovement instanceof Array) {
                    for (let i: number = 0; i < pieceMovement.length; i++) {
                        let moveIsExtendable: boolean = EvaluatePieceMovement({
                            cells: state.cells,
                            pieceMovement: pieceMovement[i],
                            pieceCoordinates: action.payload,
                        });

                        if (!moveIsExtendable) { break; }
                    }

                    return;
                }

                EvaluatePieceMovement({
                    pieceMovement,
                    cells: state.cells,
                    pieceCoordinates: action.payload,
                });
            });
        },

        RemoveStateFromCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].state = RemoveCellState(state.cells[x][y].state, action.payload.cellState);
        },

        RemoveStateFromSingularCell: (state: GameboardSliceType, action: PayloadAction<Omit<AlterCellStateActionType, "x" | "y">>): void => {
            if (!IsCellStateSingular(action.payload.cellState)) {
                throw new EvalError(`The Cell State "${action.payload.cellState}" is not a Singular Cell State`);
            }

            let cellWasReady: boolean = action.payload.cellState == CellState.ready;
            if (cellWasReady) {
                state.cells.flat().forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
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

            let pieceIsWhite: boolean = fromCell.colouredPiece?.colour == PieceColour.white,
                movingPieceExists: boolean = fromCell.colouredPiece != null,
                targetCellIsMovable: boolean = IsCellStateMovable(toCell.state),
                targetCellIsCastlable: boolean = DoCellStatesIntersect(toCell.state, CellState.castle),
                targetCellIsSneaking: boolean = DoCellStatesIntersect(toCell.state, CellState.sneak);

            if (!targetCellIsMovable) { return; }
            if (!movingPieceExists) { throw new Error(`Cell at { x: ${x1}, y: ${y1} } contains no piece.`); }

            if (targetCellIsSneaking) {
                delete state.cells[x2][y2 + ((pieceIsWhite) ? -1 : + 1)].colouredPiece;
            }

            if (targetCellIsCastlable) {
                let kingHasMovedToLeft: boolean = x1 > x2;

                const { leftRookCell, rightRookCell } =
                    FindKingRookCells({ cells: state.cells, kingCell: fromCell }),
                    rookCell: Cell = (kingHasMovedToLeft) ? leftRookCell : rightRookCell,
                    rookTargetCell: Cell = (kingHasMovedToLeft) ? state.cells[x2 + 1][y2] : state.cells[x2 - 1][y2];

                GameboardSlice.caseReducers.MovePiece(state, {
                    payload: { from: rookCell, to: rookTargetCell },
                    type: "gameboard/MovePiece",
                });
            }

            toCell.colouredPiece = fromCell.colouredPiece;
            delete fromCell.colouredPiece;

            state.cells.flat().forEach(pieceCell => {
                if (pieceCell.colouredPiece?.canBeSnuckUpon == null) { return; }

                const { x, y }: Coordinates = pieceCell;
                state.cells[x][y].colouredPiece.canBeSnuckUpon &&= false;
            });

            let pieceRecordsSneaking: boolean = toCell.colouredPiece.canBeSnuckUpon != null,
                pieceRecordsMovements: boolean = toCell.colouredPiece.hasMoved != null;

            if (pieceRecordsSneaking) {
                let pawnHasMoved: boolean = toCell.colouredPiece.hasMoved,
                    pawnHasMovedTwoCells: boolean = Math.abs(y1 - y2) == 2;

                toCell.colouredPiece.canBeSnuckUpon = !pawnHasMoved && pawnHasMovedTwoCells;
            }

            if (pieceRecordsMovements) { toCell.colouredPiece.hasMoved ||= true; }
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