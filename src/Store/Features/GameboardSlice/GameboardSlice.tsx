import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import { Piece, PieceColour } from "../../../Types/Piece";
import AudioManager from "../../../Managers/AudioManager";
import CheckOccurrence from "../../../Types/CheckOccurrence";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetPieceActionType from "./ActionTypes/SetPieceActionType";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import GenerateEmptyGameboard from "../../../Functions/GenerateEmptyGameboard";
import _HandleSubMovementActionType from "./ActionTypes/_HandleSubMovementActionType";
import ApplyToValidPieceMovements from "../../../Functions/ApplyToValidPieceMovements";
import _UpdateKingCheckStateActionType from "./ActionTypes/_UpdateKingCheckStateActionType";
import { GeneratePieceMovements, PieceMovements, AllPieceMovements } from "../../../Types/PieceMovements";
import { EvaluatePieceMovementOutputProps, FindKingRookCells } from "../../../Functions/EvaluatePieceMovement";

import CellState, {
    AddCellState,
    RemoveCellState,
    IsCellStateMovable,
    IsCellStateSingular,
    DoCellStatesIntersect,
    GetMostImportantCellState,
} from "../../../Types/CellState";

type GameboardSliceType = {
    cells: Array<Array<Cell>>;
    checkOccurrence?: CheckOccurrence;
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

            // FIX: Sound doesn't play on refresh, because DOM doesn't exist yet.
            AudioManager.Play("/src/assets/Audios/game-start.mp3");
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
                { x: x2, y: y2 }: Coordinates = action.payload.to,
                fromCell: Cell = state.cells[x1][y1],
                toCell: Cell = state.cells[x2][y2];

            let movingPieceExists: boolean = fromCell.colouredPiece != null,
                targetCellIsMovable: boolean = IsCellStateMovable(toCell.state),
                movingPieceIsKing: boolean = movingPieceExists && fromCell.colouredPiece.piece == Piece.king;

            if (!targetCellIsMovable) { return; }
            if (!movingPieceExists) { throw new Error(`Cell at { x: ${x1}, y: ${y1} } doesn't contain a piece.`); }
            if (movingPieceIsKing) { state.cells[x1][y1].state = RemoveCellState(state.cells[x1][y1].state, CellState.checked); }

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

            GameboardSlice.caseReducers._DetectChecking(state);

            GameboardSlice.caseReducers._PlayMovementSound(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_PlayMovementSound",
            });
        },

        SetPiece: (state: GameboardSliceType, action: PayloadAction<SetPieceActionType>): void => {
            const { x, y }: Coordinates = action.payload;

            state.cells[x][y].colouredPiece = action.payload.colouredPiece;

            GameboardSlice.caseReducers._DetectChecking(state);
        },

        _ResetMovableCells: (state: GameboardSliceType): void => {
            state.cells.flat()
                .forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
        },

        _GeneratePieceMovements: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const
                { x, y }: Coordinates = action.payload,
                pieceMovements: PieceMovements = GeneratePieceMovements(state.cells[x][y].colouredPiece.piece);

            ApplyToValidPieceMovements({
                x,
                y,
                pieceMovements,
                cells: state.cells,
                checkOccurrence: state.checkOccurrence,
                callbackFunction: (props: EvaluatePieceMovementOutputProps): void => {
                    const { x: x0, y: y0 } = props;
                    if (props.cellState == null) { return; }
                    state.cells[x0][y0].state = AddCellState(state.cells[x0][y0].state, props.cellState);
                },
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

        _PlayMovementSound: (_state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            // TODO: Add sneak attack sound.
            const AUDIO_SOURCE: string = "/src/assets/Audios/" + (() => {
                switch (GetMostImportantCellState(action.payload.toCell.state)) {
                    case CellState.move: return "move";
                    case CellState.attack: return "attack";
                    case CellState.castle: return "castle";
                    case CellState.promote: return "promote";
                }
            })() + ".mp3";

            AudioManager.Play(AUDIO_SOURCE);
        },

        _DetectChecking: (state: GameboardSliceType): void => {
            const kingCells: Array<Cell> = state.cells.flat()
                .filter(cell => cell.colouredPiece?.piece == Piece.king);

            kingCells.forEach(kingCell => GameboardSlice.caseReducers._UpdateKingCheckState(state, {
                payload: { kingCell },
                type: "gameboard/_UpdateKingCheckState",
            }));
        },

        _UpdateKingCheckState: (state: GameboardSliceType, action: PayloadAction<_UpdateKingCheckStateActionType>): void => {
            const kingCell: Cell = action.payload.kingCell;

            let foeKingIsSafe: boolean = true;
            AllPieceMovementsLoop: for (const [piece, pieceMovements] of AllPieceMovements) {
                if (piece == Piece.king) { continue; }

                ApplyToValidPieceMovements({
                    ...kingCell,
                    pieceMovements,
                    cells: state.cells,
                    checkOccurrence: state.checkOccurrence,
                    callbackFunction: (props: EvaluatePieceMovementOutputProps): void => {
                        const
                            { x: x0, y: y0 } = props,
                            cell: Cell = state.cells[x0]?.[y0];

                        let foePieceExists: boolean = cell?.colouredPiece?.colour != kingCell.colouredPiece.colour,
                            pieceIsThreatening: boolean = foePieceExists && cell?.colouredPiece?.piece == piece;

                        if (foeKingIsSafe &&= !pieceIsThreatening) { return; }

                        kingCell.state = AddCellState(kingCell.state, CellState.checked);

                        state.checkOccurrence ??= {
                            kingCell,
                            threateningCell: cell,
                        };

                        AudioManager.Play("/src/assets/Audios/check.mp3");
                    },
                });

                if (!foeKingIsSafe) { break; }
            }

            if (!foeKingIsSafe) { return; }

            kingCell.state = RemoveCellState(kingCell.state, CellState.checked);
            delete state.checkOccurrence;
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