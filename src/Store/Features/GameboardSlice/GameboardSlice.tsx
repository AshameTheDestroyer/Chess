import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import Cell from "../../../Types/Cell";
import "../../../Utilities/Extensions/GroupBy";
import DrawType from "../../../Types/DrawType";
import { Piece, PieceColour } from "../../../Types/Piece";
import CheckThreats from "../../../Functions/CheckThreats";
import CheckOccurrence from "../../../Types/CheckOccurrence";
import Coordinates from "../../../Utilities/Types/Coordinates";
import SetPieceActionType from "./ActionTypes/SetPieceActionType";
import SetUpGameActionType from "./ActionTypes/SetUpGameActionType";
import MovePieceActionType from "./ActionTypes/MovePieceActionType";
import { PlayHandlers, PlaySliceType } from "../PlaySlice/PlaySlice";
import DecodeFENCode, { INITIAL_GAME_FEN_CODE } from "./ChessDecoder";
import { DeepCopy } from "../../../Utilities/Functions/HandleLocalStorage";
import _DetectEndgameActionType from "./ActionTypes/_DetectEndgameActionType";
import AlterCellStateActionType from "./ActionTypes/AlterCellStateActionType";
import GenerateEmptyGameboard from "../../../Functions/GenerateEmptyGameboard";
import _DetectCheckingActionType from "./ActionTypes/_DetectCheckingActionType";
import { CoordinatesToChessCoordinates } from "../../../Types/ChessCoordinates";
import _HandleSubMovementActionType from "./ActionTypes/_HandleSubMovementActionType";
import MovementRecord, { MovementRecordToString } from "../../../Types/MovementRecord";
import _UpdateKingCheckStateActionType from "./ActionTypes/_UpdateKingCheckStateActionType";
import _UpdateKingTerritoryCellsActionType from "./ActionTypes/_UpdateKingTerritoryCellsActionType";
import PieceMovement, { GeneratePieceMovements, PieceMovements } from "../../../Types/PieceMovements";
import AddPieceMovementToPieceCoordinates from "../../../Functions/AddPieceMovementToPieceCoordinates";
import _UpdatePlayerRecordedMovementsActionType from "./ActionTypes/_UpdatePlayerRecordedMovementsActionType";
import { EvaluatePieceMovementOutputProps, FindKingRookCells } from "../../../Functions/EvaluatePieceMovement";
import ApplyToPieceValidMovements, { GetPieceValidMovements } from "../../../Functions/ApplyToValidPieceMovements";
import _UpdatePlayerFiftyMovementCountersActionType from "./ActionTypes/_UpdatePlayerFiftyMovementCountersActionType";

import CellState, {
    AddCellState,
    RemoveCellState,
    IsCellStateMovable,
    IsCellStateSingular,
    DoCellStatesIntersect,
    GetMostImportantCellState,
} from "../../../Types/CellState";

export type PlayerCounter = {
    counter: number;
    colour: PieceColour;
};

export type PlayerRecordedMovement = {
    colour: PieceColour;
    movements: Array<MovementRecord>;
};

type GameboardSignals = {
    illegalMovement?: {};
    check?: { kingCell: Cell };
    draw?: { drawType: DrawType };
    pawnPromote?: { pawnCell: Cell };
    pieceMove?: { mostImportantCellState: CellState };
    checkmate?: { kingPieceColour: PieceColour };
};

type GameboardSliceType = {
    pieceCells: Array<Cell>;
    cells: Array<Array<Cell>>;
    checkOccurrence?: CheckOccurrence;
    playerCheckCounters: Array<PlayerCounter>;
    playerFiftyRuleMovementCounters: Array<PlayerCounter>;
    playerRecordedMovements: Array<PlayerRecordedMovement>;
    playState?: {
        playerTurn: PieceColour;
    } & PlayHandlers;

    signals: GameboardSignals;
};

const INITIAL_STATE: GameboardSliceType = {
    pieceCells: new Array<Cell>(),
    cells: GenerateEmptyGameboard(),
    playerCheckCounters: [
        { colour: PieceColour.white, counter: 0 },
        { colour: PieceColour.black, counter: 0 },
    ],
    playerFiftyRuleMovementCounters: [
        { colour: PieceColour.white, counter: 0 },
        { colour: PieceColour.black, counter: 0 },
    ],
    playerRecordedMovements: [
        { colour: PieceColour.white, movements: [] },
        { colour: PieceColour.black, movements: [] },
    ],

    signals: {},
};

export const GameboardSlice = createSlice({
    name: "gameboard",
    initialState: INITIAL_STATE,

    reducers: {
        SetUpGame: (state: GameboardSliceType, action: PayloadAction<SetUpGameActionType>): void => {
            state.playState = {
                ...action.payload.handlers,
                playerTurn: (action.payload.binaries.whitePlaysFirst) ? PieceColour.white : PieceColour.black,
            };

            DecodeFENCode(action.payload.FENCode).forEach(cell => {
                if (cell.colouredPiece == null) { return; }

                GameboardSlice.caseReducers.SetPiece(state, {
                    payload: {
                        ...cell,
                        doesntTriggerDetectChecking: true,
                        colouredPiece: cell.colouredPiece,
                    },
                    type: "gameboard/SetPiece",
                });
            });
        },

        SetUpInitialGame: (state: GameboardSliceType, action: PayloadAction<PlaySliceType>): void => {
            GameboardSlice.caseReducers.SetUpGame(state, {
                payload: { ...action.payload, FENCode: INITIAL_GAME_FEN_CODE },
                type: "gameboard/SetUpGame",
            });
        },

        ResetGameboard: (state: GameboardSliceType): void => {
            state.playState = null;
            state.playState = null;
            state.checkOccurrence = null;
            state.cells = DeepCopy(INITIAL_STATE.cells);
            state.pieceCells = DeepCopy(INITIAL_STATE.pieceCells);
            state.playerCheckCounters = DeepCopy(INITIAL_STATE.playerCheckCounters);
            state.playerRecordedMovements = DeepCopy(INITIAL_STATE.playerRecordedMovements);
            state.playerFiftyRuleMovementCounters = DeepCopy(INITIAL_STATE.playerFiftyRuleMovementCounters);

            state.signals = DeepCopy(INITIAL_STATE.signals);
        },

        AddStateToCell: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].state = AddCellState(state.cells[x][y].state, action.payload.cellState);

            let cellHasPiece: boolean = state.cells[x][y].colouredPiece != null,
                cellIsReady: boolean = action.payload.cellState == CellState.ready,
                itsPlayersTurn: boolean = state.playState.playerTurn == state.cells[x][y].colouredPiece?.colour;

            if (cellIsReady) { GameboardSlice.caseReducers._ResetMovableCells(state); }
            if (!cellHasPiece || !cellIsReady) { return; }

            if (!itsPlayersTurn) {
                state.signals.illegalMovement = {};

                return;
            }

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

            GameboardSlice.caseReducers._UpdatePlayerFiftyMovementCounters(state, {
                payload: {
                    colour: fromCell.colouredPiece.colour,
                    pieceHasBeenAttacked: toCell.colouredPiece != null,
                    pawnHasMoved: fromCell.colouredPiece.piece == Piece.pawn,
                },
                type: "gameboard/_UpdatePlayerFiftyMovementCounters"
            });

            toCell.colouredPiece = fromCell.colouredPiece;
            delete fromCell.colouredPiece;

            state.pieceCells = state.pieceCells.filter(pieceCell =>
                (pieceCell.x != x1 || pieceCell.y != y1) && (pieceCell.x != x2 || pieceCell.y != y2));
            state.pieceCells.push(toCell);

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

            if (action.payload.doesntRecordMovement) { return; }

            state.playState.playerTurn = (state.playState.playerTurn == PieceColour.white) ? PieceColour.black : PieceColour.white;

            GameboardSlice.caseReducers._UpdatePlayerRecordedMovements(state, {
                payload: {
                    to: toCell,
                    from: fromCell,
                    movingPiece: toCell.colouredPiece,
                    hasChecked: state.checkOccurrence != null,
                },
                type: "gameboard/_UpdatePlayerRecordedMovements",
            });
        },

        SetPiece: (state: GameboardSliceType, action: PayloadAction<SetPieceActionType>): void => {
            const { x, y }: Coordinates = action.payload;
            state.cells[x][y].colouredPiece = action.payload.colouredPiece;

            state.pieceCells = state.pieceCells.filter(pieceCell => pieceCell.x != x || pieceCell.y != y);
            state.pieceCells.push(state.cells[x][y]);

            if (action.payload.colouredPiece.piece == Piece.king) {
                GameboardSlice.caseReducers._UpdateKingTerritoryCells(state, {
                    payload: { kingCell: state.cells[x][y] },
                    type: "gameboard/_DetectChecking",
                });
            }

            GameboardSlice.caseReducers._HandlePostMovementActions(state, {
                payload: {
                    toCell: state.cells[x][y],
                    fromCell: state.cells[x][y],
                    doesntTriggerDetectChecking: action.payload.doesntTriggerDetectChecking,
                },
                type: "gameboard/_HandlePostMovementActions",
            });

            if (action.payload.isPromoting) {
                state.signals.pawnPromote = { pawnCell: state.cells[x][y] };

                GameboardSlice.caseReducers._UpdatePlayerRecordedMovements(state, {
                    payload: {
                        movingPiece: state.cells[x][y].colouredPiece,
                        pawnPromotedTo: action.payload.colouredPiece.piece,
                    },
                    type: "gameboard/_UpdatePlayerRecordedMovements",
                });
            }
        },

        _ResetMovableCells: (state: GameboardSliceType): void => {
            state.cells.flat()
                .forEach(cell => cell.state = IsCellStateMovable(cell.state) ? null : cell.state);
        },

        _GeneratePieceMovements: (state: GameboardSliceType, action: PayloadAction<AlterCellStateActionType>): void => {
            const
                { x, y }: Coordinates = action.payload,
                pieceMovements: PieceMovements = GeneratePieceMovements(state.cells[x][y].colouredPiece.piece);

            let validMovementCount: number = 0;
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
                    validMovementCount++;
                },
            });

            if (validMovementCount == 0) {
                state.signals.illegalMovement = {};
            }
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
                payload: {
                    from: rookCell,
                    to: rookTargetCell,
                    doesntRecordMovement: true,
                },
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

            if (action.payload.doesntTriggerDetectChecking) { return; }

            if (pieceRecordsMovements) { action.payload.toCell.colouredPiece.hasMoved ||= true; }

            GameboardSlice.caseReducers._DetectChecking(state, {
                payload: { kingPieceColour: action.payload.toCell.colouredPiece.colour },
                type: "gameboard/_DetectChecking",
            });

            state.signals.pieceMove = {
                mostImportantCellState: GetMostImportantCellState(action.payload.toCell.state),
            };

            GameboardSlice.caseReducers._DetectEndgame(state, {
                payload: { lastMovingPiece: action.payload.toCell.colouredPiece },
                type: "gameboard/_DetectEndgame",
            });
        },

        _UpdatePlayerRecordedMovements: (state: GameboardSliceType, action: PayloadAction<_UpdatePlayerRecordedMovementsActionType>): void => {
            const playerRecordedMovements: PlayerRecordedMovement = state.playerRecordedMovements
                .find(playerCheckCounter => playerCheckCounter.colour == action.payload.movingPiece.colour);

            if (action.payload.pawnPromotedTo != null) {
                playerRecordedMovements.movements[playerRecordedMovements.movements.length - 1] = {
                    ...playerRecordedMovements.movements.at(-1),

                    hasChecked: state.checkOccurrence != null,
                    pawnPromotedTo: action.payload.pawnPromotedTo,
                };
            } else {
                playerRecordedMovements.movements.push({
                    hasChecked: action.payload.hasChecked,
                    movingPiece: action.payload.movingPiece.piece,
                    to: CoordinatesToChessCoordinates(action.payload.to),
                    from: CoordinatesToChessCoordinates(action.payload.from),
                });
            }

            GameboardSlice.caseReducers._DetectRepetition(state);
        },

        _UpdatePlayerFiftyMovementCounters: (state: GameboardSliceType, action: PayloadAction<_UpdatePlayerFiftyMovementCountersActionType>): void => {
            const playerFiftyMovementCounter: PlayerCounter = state.playerFiftyRuleMovementCounters
                .find(playerFiftyMovementCounter => playerFiftyMovementCounter.colour == action.payload.colour);

            if (action.payload.pawnHasMoved || action.payload.pieceHasBeenAttacked) {
                playerFiftyMovementCounter.counter = 0;
                return;
            }

            playerFiftyMovementCounter.counter++;
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

            state.signals.check = { kingCell };

            state.checkOccurrence ??= {
                kingCell,
                threateningCellLines,
            };

            state.playerCheckCounters
                .find(playerCheckCounter => playerCheckCounter.colour != kingCell.colouredPiece.colour)
                .counter++;
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

            GameboardSlice.caseReducers._DetectDraw(state);

            let kingIsPinned: boolean = kingValidMovements.length == 0;
            if (!kingIsPinned) { return; }

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
                state.signals.checkmate = {
                    kingPieceColour: kingCell.colouredPiece.colour,
                };

                return;
            }

            state.signals.draw = { drawType: DrawType.Stalemate };
        },

        _DetectDraw: (state: GameboardSliceType): void => {
            GameboardSlice.caseReducers._DetectFiftyMovementRule(state);
            GameboardSlice.caseReducers._DetectInsufficientMaterials(state);
        },

        _DetectInsufficientMaterials: (state: GameboardSliceType): void => {
            if (state.pieceCells.length > 3) { return; }
            let onlyKingsRemain: boolean = state.pieceCells.length == 2,
                knightOrBishopExists: boolean = state.pieceCells.find(pieceCell =>
                    [Piece.knight, Piece.bishop].includes(pieceCell.colouredPiece.piece)) != null;

            if (onlyKingsRemain || knightOrBishopExists) {
                state.signals.draw = { drawType: DrawType.InsufficientMaterials };
            }
        },

        _DetectFiftyMovementRule: (state: GameboardSliceType): void => {
            for (const { colour: _playerColour, counter: fiftyMovementCounter } of state.playerFiftyRuleMovementCounters) {
                if (fiftyMovementCounter != state.playState.fiftyRuleMovementCounterValue) { continue; }

                state.signals.draw = { drawType: DrawType.FiftyMovementRule };
                break;
            };
        },

        _DetectRepetition: (state: GameboardSliceType): void => {
            const MINIMUM_RECORDED_MOVEMENT_COUNT: number = state.playerRecordedMovements
                .reduce((minimumRecordedMovementCount, playerRecordedMovements) =>
                    minimumRecordedMovementCount =
                    (minimumRecordedMovementCount > playerRecordedMovements.movements.length) ?
                        playerRecordedMovements.movements.length : minimumRecordedMovementCount
                    , Infinity);

            if (MINIMUM_RECORDED_MOVEMENT_COUNT < state.playState.repetitionCounterValue * 2 - 1) { return; }

            const playerRepetitionCounters: Array<PlayerCounter> = state.playerRecordedMovements
                .map(playerRecordedMovements => ({ colour: playerRecordedMovements.colour, counter: 0 }));

            state.playerRecordedMovements.forEach((playerRecordedMovements, i) => {
                const lastRecordedMovement: MovementRecord = playerRecordedMovements.movements.at(-1);

                for (let j: number = state.playState.repetitionCounterValue - 1,
                    k: number = playerRecordedMovements.movements.length - 1; j >= 0; j--, k -= 2) {
                    if (MovementRecordToString(playerRecordedMovements.movements[k]) == MovementRecordToString(lastRecordedMovement)) {
                        playerRepetitionCounters[i].counter++;
                    }
                }
            });

            const REPETITION_COUNTER_VALUE: number = playerRepetitionCounters
                .reduce((repetitionCounterValue, playerRepetitionCounter) =>
                    repetitionCounterValue += playerRepetitionCounter.counter, 0);

            if (REPETITION_COUNTER_VALUE >= state.playState.repetitionCounterValue * 2 - 1) {
                state.signals.draw = { drawType: DrawType.Repetition };
            }
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