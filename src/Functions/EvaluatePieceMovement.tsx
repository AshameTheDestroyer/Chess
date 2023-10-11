import Cell from "../Types/Cell";
import { Piece } from "../Types/Piece";
import CheckThreats from "./CheckThreats";
import PieceMovement from "../Types/PieceMovements";
import CheckOccurrence from "../Types/CheckOccurrence";
import Coordinates from "../Utilities/Types/Coordinates";
import { CHESS_PIECE_COUNT } from "./GenerateEmptyGameboard";
import CellState, { DoCellStatesIntersect } from "../Types/CellState";
import AddPieceMovementToPieceCoordinates from "./AddPieceMovementToPieceCoordinates";

type EvaluatePieceMovementsProps = {
    cells: Array<Array<Cell>>;
    pieceMovement: PieceMovement;
    checkOccurrence: CheckOccurrence;
    pieceMovementLine?: Array<PieceMovement>;
    preferredArguments?: {
        cell?: Cell;
    };
} & Coordinates;

export type EvaluatePieceMovementOutputProps = {
    cellState?: CellState;
    pieceMovement: PieceMovement;
    movementIsExtendible: boolean;
    pieceMovementLine?: Array<PieceMovement>;
} & Partial<Coordinates>;

function EvaluatePieceMovement(props: EvaluatePieceMovementsProps): EvaluatePieceMovementOutputProps {
    const
        cell: Cell = props.preferredArguments?.cell ?? props.cells[props.x][props.y],
        { x: x0, y: y0 }: Coordinates = AddPieceMovementToPieceCoordinates({
            cell,
            pieceMovementCoordinates: props.pieceMovement,
        }),
        pieceMovementEvaluationOnFailed: EvaluatePieceMovementOutputProps = { ...props, movementIsExtendible: false };

    let cellExists: boolean = props.cells[x0]?.[y0] != null;
    if (!cellExists) { return pieceMovementEvaluationOnFailed; }

    let cellHasPiece: boolean = props.cells[x0][y0].colouredPiece != null,
        cellHasFoePiece: boolean = cellHasPiece && props.cells[x0][y0].colouredPiece.colour != cell.colouredPiece.colour,
        pieceIsWhite: boolean = cell.colouredPiece.colour == "white",
        canCanPromote: boolean = (pieceIsWhite) ? y0 == CHESS_PIECE_COUNT - 1 : y0 == 0;

    if (cellHasPiece && !cellHasFoePiece) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateMovePieceMovement({
        cellHasFoePiece,
        pieceMovement: props.pieceMovement,
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateAttackPieceMovement({
        cellHasFoePiece,
        pieceMovement: props.pieceMovement,
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateFirstMovePieceMovement({
        pieceIsWhite,
        pieceCell: cell,
        pieceMovement: props.pieceMovement,
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateCastlablePieceMovement({
        pieceIsWhite,
        pieceCell: cell,
        cells: props.cells,
        pieceMovement: props.pieceMovement,
        checkOccurrence: props.checkOccurrence,
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateEnPassantPieceMovement({
        cell,
        pieceIsWhite,
        cells: props.cells,
        pieceMovement: props.pieceMovement,
        pieceMovementCoordinates: { x: x0, y: y0 },
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluateCheckDefendingMovement({
        cell,
        cells: props.cells,
        checkOccurrence: props.checkOccurrence,
        pieceMovementCoordinates: { x: x0, y: y0 },
    })) { return { ...props, movementIsExtendible: true }; }

    if (!EvaluateKingSafeMovementProps({
        cell,
        cells: props.cells,
        pieceMovementCoordinates: { x: x0, y: y0 },
    })) { return pieceMovementEvaluationOnFailed; }

    if (!EvaluatePinViolatingMovement({
        ...props,
        cell,
        pieceMovementCoordinates: { x: x0, y: y0 },
    })) { return pieceMovementEvaluationOnFailed; }

    const cellState: CellState =
        (props.pieceMovement.isEnPassant) ? CellState.enPassant :
            (props.pieceMovement.isCastlable) ? CellState.castle :
                (canCanPromote && props.pieceMovement.isPromotable) ? CellState.promote :
                    (cellHasFoePiece) ? CellState.attack :
                        CellState.move;

    return {
        ...props,
        x: x0,
        y: y0,
        cellState,
        movementIsExtendible: !cellHasFoePiece,
    };
}

export default EvaluatePieceMovement;

type EvaluateMovePieceMovementProps = {
    cellHasFoePiece: boolean;
    pieceMovement: PieceMovement;
};

function EvaluateMovePieceMovement(props: EvaluateMovePieceMovementProps): boolean {
    return !props.cellHasFoePiece || !props.pieceMovement.isMoveOnly;
}

type EvaluateAttackPieceMovementProps = {
    cellHasFoePiece: boolean;
    pieceMovement: PieceMovement;
};

function EvaluateAttackPieceMovement(props: EvaluateAttackPieceMovementProps): boolean {
    return props.cellHasFoePiece || !props.pieceMovement.isAttackOnly;
}

type EvaluateFirstMovePieceMovementProps = {
    pieceCell: Cell;
    pieceIsWhite: boolean;
    pieceMovement: PieceMovement;
};

function EvaluateFirstMovePieceMovement(props: EvaluateFirstMovePieceMovementProps): boolean {
    if (!props.pieceMovement.isFirstMoveOnly) { return true; }

    let pieceIsPawn: boolean = props.pieceCell.colouredPiece.piece == Piece.pawn,
        pieceIsOnSecondRow: boolean = (pieceIsPawn) ?
            ((props.pieceIsWhite) ? props.pieceCell.y == 1 : props.pieceCell.y == CHESS_PIECE_COUNT - 2) :
            ((props.pieceIsWhite) ? props.pieceCell.y == 0 : props.pieceCell.y == CHESS_PIECE_COUNT - 1);

    return pieceIsOnSecondRow;
}

type EvaluateCastlablePieceMovementProps = {
    pieceCell: Cell;
    pieceIsWhite: boolean;
    cells: Array<Array<Cell>>;
    pieceMovement: PieceMovement;
    checkOccurrence: CheckOccurrence;
};

function EvaluateCastlablePieceMovement(props: EvaluateCastlablePieceMovementProps): boolean {
    let pieceIsKing: boolean = props.pieceCell.colouredPiece.piece == Piece.king;

    if (!pieceIsKing || !props.pieceMovement.isCastlable) { return true; }
    if (props.checkOccurrence != null) { return false; }

    const { leftRookCell, rightRookCell } =
        FindKingRookCells({ cells: props.cells, kingCell: props.pieceCell });

    let kingHasMoved: boolean = props.pieceCell.colouredPiece.hasMoved,
        pieceIsOnFirstRow: boolean = (props.pieceIsWhite) ? props.pieceCell.y == 0 : props.pieceCell.y == CHESS_PIECE_COUNT - 1,
        moveIsToTheLeft: boolean = (props.pieceIsWhite) ? props.pieceMovement.x < 0 : props.pieceMovement.x > 0,
        rookHasMoved: boolean = (moveIsToTheLeft) ? leftRookCell?.colouredPiece.hasMoved : rightRookCell?.colouredPiece.hasMoved,
        rookIsAccessible: boolean = !moveIsToTheLeft || props.cells[leftRookCell?.x + 1]?.[leftRookCell?.y]?.colouredPiece == null,
        rookIsOnFirstRow: boolean = (moveIsToTheLeft) ?
            ((props.pieceIsWhite) ? leftRookCell?.y == 0 : leftRookCell?.y == CHESS_PIECE_COUNT - 1) :
            ((props.pieceIsWhite) ? rightRookCell?.y == 0 : rightRookCell?.y == CHESS_PIECE_COUNT - 1);

    return pieceIsOnFirstRow && !kingHasMoved && rookIsOnFirstRow && !rookHasMoved && rookIsAccessible;
}

type EvaluateEnPassantPieceMovementProps = {
    cell: Cell;
    pieceIsWhite: boolean;
    cells: Array<Array<Cell>>;
    pieceMovement: PieceMovement;
    pieceMovementCoordinates: Coordinates;
};

function EvaluateEnPassantPieceMovement(props: EvaluateEnPassantPieceMovementProps): boolean {
    if (!props.pieceMovement.isEnPassant) { return true; }

    const
        { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates,
        foePawnCell: Cell = props.cells[x0][(props.pieceIsWhite) ? y0 - 1 : y0 + 1];

    let pawnToEnPassantUponExists: boolean = foePawnCell.colouredPiece?.canBeSnuckUpon,
        isPawnFoe: boolean = foePawnCell.colouredPiece?.colour != props.cell.colouredPiece.colour,
        cellIsEmpty: boolean = props.cells[x0][y0].colouredPiece == null;

    return pawnToEnPassantUponExists && isPawnFoe && cellIsEmpty;
}

type EvaluateCheckDefendingMovementProps = {
    cell: Cell;
    cells: Array<Array<Cell>>;
    checkOccurrence: CheckOccurrence;
    pieceMovementCoordinates: Coordinates;
};

function EvaluateCheckDefendingMovement(props: EvaluateCheckDefendingMovementProps): boolean {
    if (props.checkOccurrence == null) { return true; }

    const
        { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates,
        { kingCell: checkedKingCell, threateningCellLines } = props.checkOccurrence;

    let checkedKingIsFoe: boolean = checkedKingCell.colouredPiece.colour != props.cell.colouredPiece.colour,
        pieceIsKing: boolean = props.cell.colouredPiece.piece == Piece.king,
        isDoubleCheck: boolean = threateningCellLines.length >= 2;

    if (checkedKingIsFoe) { return true; }
    if (isDoubleCheck) { return pieceIsKing; }

    const
        threateningCellLine: Array<Cell> = threateningCellLines[0],
        threateningCell: Cell = threateningCellLine[0],
        cutThreateningCellLine: Array<Cell> = threateningCellLine.slice(0, threateningCellLine
            .indexOf(threateningCellLine.find(cell => cell.colouredPiece?.piece == Piece.king)));

    let canDefendKing: boolean = cutThreateningCellLine.find(cell => cell.x == x0 && cell.y == y0) != null,
        canAttackThreateningPiece: boolean = threateningCell.x == x0 && threateningCell.y == y0,
        pieceCanMove: boolean = !pieceIsKing && (canAttackThreateningPiece || canDefendKing),
        kingCanEscape: boolean = threateningCellLine.find(cell => cell.x == x0 && cell.y == y0) == null,
        kingCanMove: boolean = pieceIsKing && (canAttackThreateningPiece || kingCanEscape);

    return pieceCanMove || kingCanMove;
}

type EvaluateKingSafeMovementPropsType = {
    cell: Cell;
    cells: Array<Array<Cell>>;
    pieceMovementCoordinates: Coordinates;
};

function EvaluateKingSafeMovementProps(props: EvaluateKingSafeMovementPropsType): boolean {
    const { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates;

    let pieceIsKing: boolean = props.cell.colouredPiece.piece == Piece.king,
        movementIsAttack: boolean = DoCellStatesIntersect(props.cells[x0][y0].state, CellState.attack),
        kingIsReadyOrChecked: boolean =
            DoCellStatesIntersect(props.cell.state, CellState.ready) ||
            DoCellStatesIntersect(props.cell.state, CellState.checked);

    if (!pieceIsKing || movementIsAttack || !kingIsReadyOrChecked) { return true; }

    const threateningCellLines: Array<Array<Cell>> = CheckThreats({
        ...props,
        kingCell: {
            ...props.cell,
            x: x0,
            y: y0,
            state: null,
        },
    });

    let kingShouldBeSafe: boolean = threateningCellLines.length == 0,
        cellIsTerritorializedByFoe: boolean = props.cells[x0][y0].territorializedKingColours?.length > 1;

    return kingShouldBeSafe && !cellIsTerritorializedByFoe;
}

type EvaluatePinViolatingMovementProps = {
    cell: Cell;
    cells: Array<Array<Cell>>;
    checkOccurrence: CheckOccurrence;
    pieceMovementCoordinates: Coordinates;
};

function EvaluatePinViolatingMovement(props: EvaluatePinViolatingMovementProps): boolean {
    const { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates;

    let pieceIsKing: boolean = props.cell.colouredPiece.piece == Piece.king;
    if (pieceIsKing) { return true; }

    const
        kingCell: Cell = props.cells.flat().find(cell =>
            cell.colouredPiece?.piece == Piece.king &&
            cell.colouredPiece?.colour == props.cell.colouredPiece.colour),
        threateningCellLines: Array<Array<Cell>> = CheckThreats({
            kingCell,
            checkOccurrence: props.checkOccurrence,
            isCheckingForPinViolationPieceMovements: true,
            cells: props.cells.map(cellRow =>
                cellRow.map(cell =>
                    (cell.x != props.cell.x || cell.y != props.cell.y) ? cell :
                        { ...props.cell, state: cell.state, colouredPiece: null })),
        });

    let moveThreatensKing: boolean = threateningCellLines.some(threateningCellLine => threateningCellLine.find(cell => cell.x == x0 && cell.y == y0) == null),
        pieceIsPinned: boolean = threateningCellLines.some(threateningCellLine => threateningCellLine.flat().find(cell => cell.x == props.cell.x && cell.y == props.cell.y) != null);

    return !moveThreatensKing || !pieceIsPinned;
}

type FindKingRookCellsProps = {
    kingCell: Cell;
    cells: Array<Array<Cell>>;
};

export function FindKingRookCells(props: FindKingRookCellsProps): { leftRookCell: Cell, rightRookCell: Cell } {
    const relatedRookCells: Array<Cell> = props.cells.flat().filter(cell =>
        (cell.colouredPiece?.isLeftRook &&
            cell.colouredPiece?.colour == props.kingCell.colouredPiece.colour) ||
        (cell.colouredPiece?.isRightRook &&
            cell.colouredPiece?.colour == props.kingCell.colouredPiece.colour));

    const
        leftRookCell: Cell = relatedRookCells.find(rookCell => rookCell.colouredPiece.isLeftRook),
        rightRookCell: Cell = relatedRookCells.find(rookCell => rookCell.colouredPiece.isRightRook);

    return { leftRookCell, rightRookCell };
}