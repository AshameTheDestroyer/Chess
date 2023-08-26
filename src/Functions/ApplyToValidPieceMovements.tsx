import Cell from "../Types/Cell";
import CheckOccurrence from "../Types/CheckOccurrence";
import { PieceMovements } from "../Types/PieceMovements";
import Coordinates from "../Utilities/Types/Coordinates";
import EvaluatePieceMovement, { EvaluatePieceMovementOutputProps } from "./EvaluatePieceMovement";

type ApplyToValidPieceMovementsProps = {
    cells: Array<Array<Cell>>;
    pieceMovements: PieceMovements;
    checkOccurrence: CheckOccurrence;

    callbackFunction: (props: EvaluatePieceMovementOutputProps) => void;
} & Coordinates;

function ApplyToValidPieceMovements(props: ApplyToValidPieceMovementsProps): void {
    props.pieceMovements.forEach(pieceMovement => {
        if (!(pieceMovement instanceof Array)) {
            const evaluationProps: EvaluatePieceMovementOutputProps = EvaluatePieceMovement({
                ...props,
                pieceMovement,
                cells: props.cells,
            });

            props.callbackFunction(evaluationProps);
            return;
        }

        for (let i: number = 0; i < pieceMovement.length; i++) {
            const evaluationProps: EvaluatePieceMovementOutputProps = EvaluatePieceMovement({
                ...props,
                cells: props.cells,
                pieceMovement: pieceMovement[i],
            });

            props.callbackFunction(evaluationProps);

            if (!evaluationProps.movementIsExtendible) { break; }
        }
    });
}

export default ApplyToValidPieceMovements;