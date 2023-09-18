import Cell from "../Types/Cell";
import CheckOccurrence from "../Types/CheckOccurrence";
import Coordinates from "../Utilities/Types/Coordinates";
import PieceMovement, { PieceMovements } from "../Types/PieceMovements";
import EvaluatePieceMovement, { EvaluatePieceMovementOutputProps } from "./EvaluatePieceMovement";

type ApplyToPieceValidMovementsProps = {
    cells: Array<Array<Cell>>;
    pieceMovements: PieceMovements;
    checkOccurrence: CheckOccurrence;
    preferredArguments?: {
        cell: Cell;
    };

    callback: (props: EvaluatePieceMovementOutputProps) => void;
} & Coordinates;

function ApplyToPieceValidMovements(props: ApplyToPieceValidMovementsProps): void {
    props.pieceMovements.forEach(pieceMovement => {
        let pieceMovementIsArray: boolean = pieceMovement instanceof Array;
        if (!pieceMovementIsArray) {
            const evaluationProps: EvaluatePieceMovementOutputProps = EvaluatePieceMovement({
                ...props,
                cells: props.cells,
                preferredArguments: props.preferredArguments,
                pieceMovement: pieceMovement as PieceMovement,
            });

            props.callback(evaluationProps);
            return;
        }

        const pieceMovementArray: Array<PieceMovement> = pieceMovement as Array<PieceMovement>;
        for (let i: number = 0; i < pieceMovementArray.length; i++) {
            const evaluationProps: EvaluatePieceMovementOutputProps = EvaluatePieceMovement({
                ...props,
                cells: props.cells,
                pieceMovement: pieceMovementArray[i],
                pieceMovementLine: pieceMovementArray,
                preferredArguments: props.preferredArguments,
            });

            props.callback(evaluationProps);

            if (!evaluationProps.movementIsExtendible) { break; }
        }
    });
}

export default ApplyToPieceValidMovements;

type GetPieceValidMovementsProps = {
    cells: Array<Array<Cell>>;
    pieceMovements: PieceMovements;
    checkOccurrence: CheckOccurrence;
    preferredArguments?: {
        cell: Cell;
    };
} & Coordinates;

export function GetPieceValidMovements(props: GetPieceValidMovementsProps): Array<PieceMovement> {
    var pieceValidMovements: Array<PieceMovement> = [];

    ApplyToPieceValidMovements({
        ...props,
        callback: (evaluationProps: EvaluatePieceMovementOutputProps): void => {
            if (evaluationProps.cellState == null) { return; }

            pieceValidMovements.push(evaluationProps.pieceMovement);
        },
    });

    return pieceValidMovements;
}