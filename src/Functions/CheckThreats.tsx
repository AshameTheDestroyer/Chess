import Cell from "../Types/Cell";
import { Piece } from "../Types/Piece";
import CheckOccurrence from "../Types/CheckOccurrence";
import Coordinates from "../Utilities/Types/Coordinates";
import { AllPieceMovements } from "../Types/PieceMovements";
import ApplyToPieceValidMovements from "./ApplyToValidPieceMovements";
import { EvaluatePieceMovementOutputProps } from "./EvaluatePieceMovement";
import AddPieceMovementToPieceCoordinates from "./AddPieceMovementToPieceCoordinates";

type CheckThreatsProps = {
    kingCell: Cell;
    cells: Array<Array<Cell>>;
    checkOccurrence?: CheckOccurrence;
};

export function CheckThreats(props: CheckThreatsProps): Array<Array<Cell>> {
    let threateningCellLines: Array<Array<Cell>> = [];
    const setThreateningCellLines: (threateningCellLines_: Array<Array<Cell>>) => Array<Array<Cell>> =
        (threateningCellLines_) => threateningCellLines = threateningCellLines_;

    for (const [piece, pieceMovements] of AllPieceMovements) {
        if (piece == Piece.king) { continue; }

        ApplyToPieceValidMovements({
            ...props.kingCell,
            pieceMovements,
            cells: props.cells,
            checkOccurrence: props.checkOccurrence,
            callback: (evaluationProps: EvaluatePieceMovementOutputProps): void =>
                GenerateThreateningCellLines({
                    ...props,
                    ...evaluationProps,
                    currentPiece: piece,
                    threateningCellLines,
                    setThreateningCellLines,
                }),
            preferredArguments: { cell: props.kingCell },
        });
    }

    return threateningCellLines;
}

export default CheckThreats;

type GenerateThreateningCellLinesProps = {
    currentPiece: Piece;
    threateningCellLines: Array<Array<Cell>>;

    setThreateningCellLines: (threateningCellLines: Array<Array<Cell>>) => Array<Array<Cell>>;
} & CheckThreatsProps & EvaluatePieceMovementOutputProps;

function GenerateThreateningCellLines(props: GenerateThreateningCellLinesProps): void {
    const
        { x: x0, y: y0 } = AddPieceMovementToPieceCoordinates(props.kingCell, props.pieceMovement),
        cell: Cell = props.cells[x0]?.[y0];

    let pieceExists: boolean = cell?.colouredPiece != null,
        canPieceMovementAttackKing: boolean =
            !props.pieceMovement.isMoveOnly &&
            !props.pieceMovement.isCastlable &&
            !props.pieceMovement.isSneakAttack &&
            !props.pieceMovement.isFirstMoveOnly;

    if (!pieceExists || !canPieceMovementAttackKing) { return; }

    let pieceIsFoe: boolean = cell.colouredPiece.colour != props.kingCell.colouredPiece.colour,
        pieceIsThreatening: boolean = pieceIsFoe && cell.colouredPiece.piece == props.currentPiece,
        isThreatRegisteredInLine: boolean = props.threateningCellLines.find(threateningCellLine => threateningCellLine[0] == cell) != null,
        threateningPieceHasNoLine: boolean = [Piece.knight, Piece.pawn].includes(cell.colouredPiece.piece);

    if (!pieceIsThreatening || isThreatRegisteredInLine) { return; }
    if (threateningPieceHasNoLine) { props.setThreateningCellLines([...props.threateningCellLines, [cell]]); return; }

    const threateningCellLine: Array<Cell> = [cell,
        ...props.pieceMovementLine?.map(pieceMovement => {
            const { x, y }: Coordinates = AddPieceMovementToPieceCoordinates(cell, pieceMovement);
            return props.cells[x]?.[y];
        }).filter(cell => cell != null) ?? [],
    ];

    props.setThreateningCellLines([...props.threateningCellLines, threateningCellLine]);
}