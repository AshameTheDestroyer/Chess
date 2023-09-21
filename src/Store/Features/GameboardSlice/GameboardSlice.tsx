import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import { Piece, PieceColour } from "../../../Types/Piece";
import AudioManager from "../../../Managers/AudioManager";
import CheckThreats from "../../../Functions/CheckThreats";
import CheckOccurrence from "../../../Types/CheckOccurrence";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetPieceActionType from "./ActionTypes/SetPieceActionType";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import _DetectEndgameActionType from "./ActionTypes/_DetectEndgameActionType";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import GenerateEmptyGameboard from "../../../Functions/GenerateEmptyGameboard";
import _DetectCheckingActionType from "./ActionTypes/_DetectCheckingActionType";
import _HandleSubMovementActionType from "./ActionTypes/_HandleSubMovementActionType";
import _UpdateKingCheckStateActionType from "./ActionTypes/_UpdateKingCheckStateActionType";
import _UpdateKingTerritoryCellsActionType from "./ActionTypes/_UpdateKingTerritoryCellsActionType";
import PieceMovement, { GeneratePieceMovements, PieceMovements } from "../../../Types/PieceMovements";
import AddPieceMovementToPieceCoordinates from "../../../Functions/AddPieceMovementToPieceCoordinates";
import { EvaluatePieceMovementOutputProps, FindKingRookCells } from "../../../Functions/EvaluatePieceMovement";
import ApplyToPieceValidMovements, { GetPieceValidMovements } from "../../../Functions/ApplyToValidPieceMovements";

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
            pieceCells.forEach(pieceCell => {
                if (pieceCell.colouredPiece == null) { return; }

                GameboardSlice.caseReducers.SetPiece(state, {
                    payload: {
                        ...pieceCell,
                        doesntTriggerDetectChecking: true,
                        colouredPiece: pieceCell.colouredPiece,
                    },
                    type: "gameboard/SetPiece",
                });
            });

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
                movingPieceIsKing: boolean = fromCell.colouredPiece?.piece == Piece.king;

            if (!targetCellIsMovable) { return; }
            if (!movingPieceExists) {
                throw new Error(`Cell at { x: ${x1}, y: ${y1} } doesn't contain a piece.`);
            }

            GameboardSlice.caseReducers._HandleEnPassantMovement(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandleEnPassantMovement",
            });

            GameboardSlice.caseReducers._HandleCastlableMovement(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandleCastlableMovement",
            });

            toCell.colouredPiece = fromCell.colouredPiece;
            delete fromCell.colouredPiece;

            if (movingPieceIsKing) {
                state.cells[x1][y1].state = RemoveCellState(state.cells[x1][y1].state, CellState.checked);

                GameboardSlice.caseReducers._UpdateKingTerritoryCells(state, {
                    payload: { kingCell: state.cells[x2][y2] },
                    type: "gameboard/_DetectChecking",
                });
            }

            GameboardSlice.caseReducers._HandlePostMovementActions(state, {
                payload: { fromCell, toCell },
                type: "gameboard/_HandlePostMovementActions",
            });
        },

        SetPiece: (state: GameboardSliceType, action: PayloadAction<SetPieceActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].colouredPiece = action.payload.colouredPiece;

            if (action.payload.colouredPiece.piece == Piece.king) {
                GameboardSlice.caseReducers._UpdateKingTerritoryCells(state, {
                    payload: { kingCell: state.cells[x][y] },
                    type: "gameboard/_DetectChecking",
                });
            }

            if (action.payload.isPromoting) {
                AudioManager.Play("/Chess-Engine/src/assets/Audios/promote.mp3");
            }

            if (action.payload.doesntTriggerDetectChecking) { return; }

            GameboardSlice.caseReducers._HandlePostMovementActions(state, {
                payload: { fromCell: state.cells[x][y], toCell: state.cells[x][y] },
                type: "gameboard/_HandlePostMovementActions",
            });
        },

        _ResetMovableCells: (state: GameboardSliceType): void => {
            state.cells.flat()
                .forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
        },

        _GeneratePieceMovements: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const
                { x, y }: Coordinates = action.payload,
                pieceMovements: PieceMovements = GeneratePieceMovements(state.cells[x][y].colouredPiece.piece);

            ApplyToPieceValidMovements({
                x,
                y,
                pieceMovements,
                cells: state.cells,
                checkOccurrence: state.checkOccurrence,
                callback: (evaluationProps: EvaluatePieceMovementOutputProps): void => {
                    if (evaluationProps.cellState == null) { return; }

                    const { x: x0, y: y0 } = evaluationProps;
                    state.cells[x0][y0].state = AddCellState(state.cells[x0][y0].state, evaluationProps.cellState);
                },
            });
        },

        _UpdateKingTerritoryCells: (state: GameboardSliceType, action: PayloadAction<_UpdateKingTerritoryCellsActionType>): void => {
            const kingCell: Cell = action.payload.kingCell;

            state.cells.flat().forEach(cell => {
                let cellIsTerritorialized: boolean = cell.territorializedKingColours != null,
                    cellIsTerritorializedByKing: boolean = cell.territorializedKingColours?.includes(kingCell.colouredPiece.colour);

                if (!cellIsTerritorialized || !cellIsTerritorializedByKing) { return; }

                cell.territorializedKingColours = cell.territorializedKingColours
                    .filter(territorializedKingColour => territorializedKingColour != kingCell.colouredPiece.colour);

                if (cell.territorializedKingColours.length == 0) { delete cell.territorializedKingColours; }
            });

            const kingMovements: PieceMovements = GeneratePieceMovements(Piece.king);

            kingMovements.forEach(kingMovement => {
                let movementIsArray: boolean = kingMovement instanceof Array;

                const
                    kingMovement_: PieceMovement = (movementIsArray) ? kingMovement[0] : kingMovement,
                    { x: x0, y: y0 }: Coordinates = AddPieceMovementToPieceCoordinates(kingCell, kingMovement_),
                    cell: Cell = state.cells[x0]?.[y0];

                if (cell == null) { return; }
                if (cell.territorializedKingColours?.includes(kingCell.colouredPiece.colour)) { return; }

                cell.territorializedKingColours ??= [];
                cell.territorializedKingColours.push(kingCell.colouredPiece.colour);
            });
        },

        _HandleEnPassantMovement: (state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            const { x, y }: Coordinates = action.payload.toCell;

            let pieceIsWhite: boolean = action.payload.fromCell.colouredPiece?.colour == PieceColour.white,
                targetCellIsCurrentlyEnPassant: boolean = DoCellStatesIntersect(action.payload.toCell.state, CellState.enPassant);

            if (!targetCellIsCurrentlyEnPassant) { return; }

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

            let pieceRecordsEnPassant: boolean = action.payload.toCell.colouredPiece.canBeSnuckUpon != null,
                pieceRecordsMovements: boolean = action.payload.toCell.colouredPiece.hasMoved != null;

            if (pieceRecordsEnPassant) {
                let pawnHasMoved: boolean = action.payload.toCell.colouredPiece.hasMoved,
                    pawnHasMovedTwoCells: boolean = Math.abs(y1 - y2) == 2;

                action.payload.toCell.colouredPiece.canBeSnuckUpon = !pawnHasMoved && pawnHasMovedTwoCells;
            }

            if (pieceRecordsMovements) { action.payload.toCell.colouredPiece.hasMoved ||= true; }

            GameboardSlice.caseReducers._DetectChecking(state, {
                payload: { kingPieceColour: action.payload.toCell.colouredPiece.colour },
                type: "gameboard/_DetectChecking",
            });

            GameboardSlice.caseReducers._PlayMovementSound(state, {
                payload: action.payload,
                type: "gameboard/_PlayMovementSound",
            });

            GameboardSlice.caseReducers._DetectEndgame(state, {
                payload: { lastMovingPiece: action.payload.toCell.colouredPiece },
                type: "gameboard/_DetectEndgame",
            });
        },

        _PlayMovementSound: (_state: GameboardSliceType, action: PayloadAction<_HandleSubMovementActionType>): void => {
            const AUDIO_SOURCE: string = "/Chess-Engine/src/assets/Audios/" + (() => {
                const mostImportantState: CellState = GetMostImportantCellState(action.payload.toCell.state);
                switch (mostImportantState) {
                    case CellState.move: case CellState.enPassant:
                    case CellState.attack: case CellState.castle:
                        return CellState[mostImportantState];
                }
            })() + ".mp3";

            AudioManager.Play(AUDIO_SOURCE);
        },

        _UpdateKingCheckingState: (state: GameboardSliceType, action: PayloadAction<_UpdateKingCheckStateActionType>): void => {
            const
                kingCell: Cell = action.payload.kingCell,
                threateningCellLines: Array<Array<Cell>> = CheckThreats({ ...state, kingCell });

            let kingShouldBeSafe: boolean = threateningCellLines.length == 0;
            if (kingShouldBeSafe) {
                kingCell.state = RemoveCellState(kingCell.state, CellState.checked);
                delete state.checkOccurrence;

                return;
            }

            kingCell.state = AddCellState(kingCell.state, CellState.checked);
            AudioManager.Play("/src/assets/Audios/check.mp3");
            state.checkOccurrence ??= {
                kingCell,
                threateningCellLines,
            };
        },

        _DetectChecking: (state: GameboardSliceType, action: PayloadAction<_DetectCheckingActionType>): void => {
            const
                kingCells: Array<Cell> = state.cells.flat().filter(cell => cell.colouredPiece?.piece == Piece.king),
                kingCell: Cell = kingCells.find(cell => cell.colouredPiece.colour == action.payload.kingPieceColour),
                foeKingCell: Cell = kingCells.find(cell => cell.colouredPiece.colour != action.payload.kingPieceColour);

            let kingIsChecked: boolean = state.checkOccurrence?.kingCell.colouredPiece.colour == action.payload.kingPieceColour;
            if (kingIsChecked) {
                GameboardSlice.caseReducers._UpdateKingCheckingState(state, {
                    payload: { kingCell },
                    type: "gameboard/_UpdateKingCheckingState",
                });
            }

            GameboardSlice.caseReducers._UpdateKingCheckingState(state, {
                payload: { kingCell: foeKingCell },
                type: "gameboard/_UpdateKingCheckingState",
            });
        },

        _DetectEndgame: (state: GameboardSliceType, action: PayloadAction<_DetectEndgameActionType>): void => {
            const
                kingCell: Cell = state.cells.flat().find(cell =>
                    cell.colouredPiece?.piece == Piece.king &&
                    cell.colouredPiece?.colour != action.payload.lastMovingPiece.colour),
                kingMovements: PieceMovements = GeneratePieceMovements(Piece.king),
                kingValidMovements: Array<PieceMovement> = GetPieceValidMovements({
                    ...kingCell,
                    cells: state.cells,
                    pieceMovements: kingMovements,
                    checkOccurrence: state.checkOccurrence,
                    preferredArguments: {
                        cell: {
                            ...kingCell,
                            state: CellState.checked,
                        },
                    },
                });

            let kingIsCornered: boolean = kingValidMovements.length == 0;
            if (!kingIsCornered) { return; }

            const validMovementCount: number = state.cells.flat().reduce((validMovementCount, cell): number => {
                let pieceIsFoe: boolean = cell.colouredPiece?.colour != kingCell.colouredPiece.colour,
                    pieceIsKing: boolean = cell.colouredPiece?.piece == Piece.king;

                if (pieceIsFoe || pieceIsKing) { return validMovementCount; }

                const
                    pieceMovements: PieceMovements = GeneratePieceMovements(cell.colouredPiece.piece),
                    pieceValidMovements: Array<PieceMovement> = GetPieceValidMovements({
                        ...cell,
                        cells: state.cells,
                        pieceMovements: pieceMovements,
                        checkOccurrence: state.checkOccurrence,
                    });

                return validMovementCount + pieceValidMovements.length;
            }, 0);

            let noPieceCanHelpMove: boolean = validMovementCount == 0,
                checkOccurrenceExists: boolean = state.checkOccurrence != null;

            if (!noPieceCanHelpMove) { return; }

            if (checkOccurrenceExists) {
                AudioManager.Play("/Chess-Engine/src/assets/Audios/checkmate.mp3");
                alert("checkmate.");
                return;
            }

            AudioManager.Play("/Chess-Engine/src/assets/Audios/stalemate.mp3");
            alert("stalemate.");
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