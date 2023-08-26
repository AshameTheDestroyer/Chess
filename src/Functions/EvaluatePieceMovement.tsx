import Cell from "../Types/Cell";
import { Piece } from "../Types/Piece";
import CellState from "../Types/CellState";
import PieceMovement from "../Types/PieceMovements";
import Coordinates from "../Utilities/Types/Coordinates";
import { CHESS_PIECE_COUNT } from "./GenerateEmptyGameboard";
import AddPieceMovementToPieceCoordinates from "./AddPieceMovementToPieceCoordinates";
import CheckOccurrence from "../Types/CheckOccurrence";

type EvaluatePieceMovementsProps = {
    cells: Array<Array<Cell>>;
    pieceMovement: PieceMovement;
    checkOccurrence: CheckOccurrence;
} & Coordinates;

export type EvaluatePieceMovementOutputProps = {
    cellState?: CellState;
    movementIsExtendible: boolean;
} & Partial<Coordinates>;

function EvaluatePieceMovement(props: EvaluatePieceMovementsProps): EvaluatePieceMovementOutputProps {
    const
        { x, y }: Coordinates = props,
        { x: x0, y: y0 }: Coordinates = AddPieceMovementToPieceCoordinates(props.cells[x][y], props.pieceMovement);

    let cellExists: boolean = props.cells[x0]?.[y0] != null;
    if (!cellExists) { return { movementIsExtendible: false }; }

    let cellHasPiece: boolean = props.cells[x0][y0].colouredPiece != null,
        cellHasFoePiece: boolean = cellHasPiece && props.cells[x0][y0].colouredPiece.colour != props.cells[x][y].colouredPiece.colour,
        pieceIsWhite: boolean = props.cells[x][y].colouredPiece.colour == "white";

    if (cellHasPiece && !cellHasFoePiece) { return { movementIsExtendible: false }; }

    if (!EvaluateMovePieceMovement({
        cellHasFoePiece,
        pieceMovement: props.pieceMovement,
    })) { return { movementIsExtendible: false }; }

    if (!EvaluateAttackPieceMovement({
        cellHasFoePiece,
        pieceMovement: props.pieceMovement,
    })) { return { movementIsExtendible: false }; }

    if (!EvaluateFirstMovePieceMovement({
        pieceIsWhite,
        pieceCell: props.cells[x][y],
        pieceMovement: props.pieceMovement,
    })) { return { movementIsExtendible: false }; }

    if (!EvaluateCastlablePieceMovement({
        pieceIsWhite,
        cells: props.cells,
        pieceCell: props.cells[x][y],
        pieceMovement: props.pieceMovement,
    })) { return { movementIsExtendible: false }; }

    if (!EvaluateSneakPieceMovement({
        pieceIsWhite,
        cells: props.cells,
        pieceMovement: props.pieceMovement,
        pieceMovementCoordinates: { x: x0, y: y0 },
    })) { return { movementIsExtendible: false }; }

    if (props.checkOccurrence != null) {
        const { kingCell: checkedKingCell, threateningCell } = props.checkOccurrence;
        console.log(JSON.parse(JSON.stringify(props.checkOccurrence)));

        let checkedKingIsFoe: boolean = checkedKingCell.colouredPiece.colour != props.cells[x][y].colouredPiece.colour;
        if (!checkedKingIsFoe) {

        }
    }

    let cellIsLastCell: boolean = (pieceIsWhite) ? y0 == CHESS_PIECE_COUNT - 1 : y0 == 0;
    const cellState: CellState = ((): CellState => {
        if (props.pieceMovement.isSneakAttack) return CellState.sneak;
        if (props.pieceMovement.isCastlable) return CellState.castle;
        if (cellIsLastCell && props.pieceMovement.isPromotable) return CellState.promote;
        if (cellHasFoePiece) return CellState.attack;
        return CellState.move;
    })();

    return {
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
};

function EvaluateCastlablePieceMovement(props: EvaluateCastlablePieceMovementProps): boolean {
    let pieceIsKing: boolean = props.pieceCell.colouredPiece.piece == Piece.king;

    if (!pieceIsKing || !props.pieceMovement.isCastlable) { return true; }

    const { leftRookCell, rightRookCell } =
        FindKingRookCells({ cells: props.cells, kingCell: props.pieceCell });

    let kingHasMoved: boolean = props.pieceCell.colouredPiece.hasMoved,
        pieceIsOnFirstRow: boolean = (props.pieceIsWhite) ? props.pieceCell.y == 0 : props.pieceCell.y == CHESS_PIECE_COUNT - 1,
        moveIsToTheLeft: boolean = (props.pieceIsWhite) ? props.pieceMovement.x < 0 : props.pieceMovement.x > 0,
        rookHasMoved: boolean = (moveIsToTheLeft) ? leftRookCell?.colouredPiece.hasMoved : rightRookCell?.colouredPiece.hasMoved,
        rookIsOnFirstRow: boolean = ((moveIsToTheLeft) ?
            ((props.pieceIsWhite) ? leftRookCell?.y == 0 : leftRookCell?.y == CHESS_PIECE_COUNT - 1) :
            ((props.pieceIsWhite) ? rightRookCell?.y == 0 : rightRookCell?.y == CHESS_PIECE_COUNT - 1));

    return pieceIsOnFirstRow && !kingHasMoved && rookIsOnFirstRow && !rookHasMoved;
}

type EvaluateSneakPieceMovementProps = {
    pieceIsWhite: boolean;
    cells: Array<Array<Cell>>;
    pieceMovement: PieceMovement;
    pieceMovementCoordinates: Coordinates;
};

function EvaluateSneakPieceMovement(props: EvaluateSneakPieceMovementProps): boolean {
    if (!props.pieceMovement.isSneakAttack) { return true; }

    const { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates;

    let pawnToSneakUponExists: boolean =
        props.cells[x0][(props.pieceIsWhite) ? y0 - 1 : y0 + 1].colouredPiece?.canBeSnuckUpon,
        cellIsEmpty: boolean = props.cells[x0][y0].colouredPiece == null;

    return pawnToSneakUponExists && cellIsEmpty;
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