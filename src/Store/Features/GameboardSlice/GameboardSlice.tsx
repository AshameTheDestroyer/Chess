import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import { PieceColour } from "../../../Types/Piece";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetPieceActionType from "./ActionTypes/SetPieceActionType";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import GenerateEmptyGameboard from "../../../Functions/GenerateEmptyGameboard";
import PieceMovement, { GeneratePieceMovements } from "../../../Types/PieceMovements";
import _HandleSubMovementActionType from "./ActionTypes/_HandleSubMovementActionType";
import EvaluatePieceMovement, { FindKingRookCells } from "../../../Functions/EvaluatePieceMovement";

import CellState, {
    AddCellState,
    RemoveCellState,
    IsCellStateMovable,
    IsCellStateSingular,
    DoCellStatesIntersect,
} from "../../../Types/CellState";

type GameboardSliceType = {
    cells: Array<Array<Cell>>;
};

const INITIAL_STATE: GameboardSliceType = {
    cells: GenerateEmptyGameboard(),
};

export const GameboardSlice = createSlice({
    name: "gameboard",
    initialState: INITIAL_STATE,

    reducers: {
        SetUpGame: (state: GameboardSliceType, action: PayloadAction<SetUpGameActionType>): void => {
            const pieceCells: Array<Cell> = DecodeFENCode(action.payload.FENCode);
            pieceCells.forEach(pieceCell =>
                state.cells[pieceCell.x][pieceCell.y].colouredPiece = pieceCell.colouredPiece);
        },

        SetUpInitialGame: (state: GameboardSliceType): void => {
            GameboardSlice.caseReducers.SetUpGame(state, {
                payload: { FENCode: INITIAL_GAME_FEN_CODE },
                type: "gameboard/SetUpGame",
            });
        },

        ResetGameboard: (state: GameboardSliceType): void => {
            state.cells = GenerateEmptyGameboard();
        },

        AddStateToCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].state = AddCellState(state.cells[x][y].state, action.payload.cellState);

            let cellHasPiece: boolean = state.cells[x][y].colouredPiece != null,
                cellIsReady: boolean = action.payload.cellState == CellState.ready;

            if (cellIsReady) { GameboardSlice.caseReducers._ResetMovableCells(state); }
            if (!cellHasPiece || !cellIsReady) { return; }

            GameboardSlice.caseReducers._GeneratePieceMovements(state, action);
        },

        RemoveStateFromCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].state = RemoveCellState(state.cells[x][y].state, action.payload.cellState);
        },

        RemoveStateFromSingularCell: (state: GameboardSliceType, action: PayloadAction<Omit<AlterCellStateActionType, "x" | "y">>): void => {
            if (!IsCellStateSingular(action.payload.cellState)) {
                throw new EvalError(`The Cell State "${action.payload.cellState}" is not a Singular Cell State.`);
            }

            let cellWasReady: boolean = action.payload.cellState == CellState.ready;
            if (cellWasReady) { GameboardSlice.caseReducers._ResetMovableCells(state); }

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

            let movingPieceExists: boolean = fromCell.colouredPiece != null,
                targetCellIsMovable: boolean = IsCellStateMovable(toCell.state);

            if (!targetCellIsMovable) { return; }
            if (!movingPieceExists) { throw new Error(`Cell at { x: ${x1}, y: ${y1} } doesn't contain a piece.`); }

            GameboardSlice.caseReducers._HandleSneakMovement(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandleSneakMovement",
            });

            GameboardSlice.caseReducers._HandleCastlableMovement(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandleCastlableMovement",
            });

            toCell.colouredPiece = fromCell.colouredPiece;
            delete fromCell.colouredPiece;

            GameboardSlice.caseReducers._HandlePostMovementActions(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandlePostMovementActions",
            });
        },

        SetPiece: (state: GameboardSliceType, action: PayloadAction<SetPieceActionType>): void => {
            const { x, y }: Coordinates = action.payload;

            state.cells[x][y].colouredPiece = action.payload.colouredPiece;
        },

        _ResetMovableCells: (state: GameboardSliceType): void => {
            state.cells.flat()
                .forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
        },

        _GeneratePieceMovements: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const
                { x, y }: Coordinates = action.payload,
                pieceMovements: Array<PieceMovement | Array<PieceMovement>> =
                    GeneratePieceMovements(state.cells[x][y].colouredPiece.piece);

            pieceMovements.forEach(pieceMovement => {
                if (!(pieceMovement instanceof Array)) {
                    EvaluatePieceMovement({
                        pieceMovement,
                        cells: state.cells,
                        pieceCoordinates: action.payload,
                    });
                    return;
                }

                for (let i: number = 0; i < pieceMovement.length; i++) {
                    let moveIsExtendable: boolean = EvaluatePieceMovement({
                        cells: state.cells,
                        pieceMovement: pieceMovement[i],
                        pieceCoordinates: action.payload,
                    });

                    if (!moveIsExtendable) { break; }
                }
            });
        },

        _HandleSneakMovement: (state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            const { x, y }: Coordinates = action.payload.toCell;

            let pieceIsWhite: boolean = action.payload.fromCell.colouredPiece?.colour == PieceColour.white,
                targetCellIsSneaking: boolean = DoCellStatesIntersect(action.payload.toCell.state, CellState.sneak);

            if (!targetCellIsSneaking) { return; }

            delete state.cells[x][y + ((pieceIsWhite) ? -1 : + 1)].colouredPiece;
        },

        _HandleCastlableMovement: (state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            const
                { x: x1, y: _y1 }: Coordinates = action.payload.fromCell,
                { x: x2, y: y2 }: Coordinates = action.payload.toCell;

            let targetCellIsCastlable: boolean = DoCellStatesIntersect(action.payload.toCell.state, CellState.castle),
                kingHasMovedToLeft: boolean = x1 > x2;

            if (!targetCellIsCastlable) { return; }

            const { leftRookCell, rightRookCell } =
                FindKingRookCells({ cells: state.cells, kingCell: action.payload.fromCell }),
                rookCell: Cell = (kingHasMovedToLeft) ? leftRookCell : rightRookCell,
                rookTargetCell: Cell = (kingHasMovedToLeft) ? state.cells[x2 + 1][y2] : state.cells[x2 - 1][y2];

            GameboardSlice.caseReducers.MovePiece(state, {
                payload: { from: rookCell, to: rookTargetCell },
                type: "gameboard/MovePiece",
            });
        },

        _HandlePostMovementActions: (state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            const
                { x: _x1, y: y1 }: Coordinates = action.payload.fromCell,
                { x: _x2, y: y2 }: Coordinates = action.payload.toCell;

            state.cells.flat().forEach(cell => {
                if (cell.colouredPiece?.canBeSnuckUpon == null) { return; }

                cell.colouredPiece.canBeSnuckUpon &&= false;
            });

            let pieceRecordsSneaking: boolean = action.payload.toCell.colouredPiece.canBeSnuckUpon != null,
                pieceRecordsMovements: boolean = action.payload.toCell.colouredPiece.hasMoved != null;

            if (pieceRecordsSneaking) {
                let pawnHasMoved: boolean = action.payload.toCell.colouredPiece.hasMoved,
                    pawnHasMovedTwoCells: boolean = Math.abs(y1 - y2) == 2;

                action.payload.toCell.colouredPiece.canBeSnuckUpon = !pawnHasMoved && pawnHasMovedTwoCells;
            }

            if (pieceRecordsMovements) { action.payload.toCell.colouredPiece.hasMoved ||= true; }
        },
    },
});

// @ts-ignore
export const SelectGameboardSlice = (state: typeof Store): GameboardSliceType => state.gameboard;

export const GameboardSliceReducer = GameboardSlice.reducer;

export const {
    SetPiece,
    MovePiece,
    AddStateToCell,
    ResetGameboard,
    SetUpInitialGame,
    RemoveStateFromCell,
    RemoveStateFromSingularCell,
} = GameboardSlice.actions;