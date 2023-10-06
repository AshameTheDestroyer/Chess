import Cell from "../Types/Cell";
import { PieceColour } from "../Types/Piece";
import Coordinates from "../Utilities/Types/Coordinates";

type AddPieceMovementToPieceCoordinatesProps = {
    cell: Cell;
    pieceMovementCoordinates: Coordinates;
    preferredArguments?: {
        colour: PieceColour;
    };
};

function AddPieceMovementToPieceCoordinates(props: AddPieceMovementToPieceCoordinatesProps): Coordinates {
    const
        { x, y }: Coordinates = props.cell,
        { x: x0, y: y0 }: Coordinates = props.pieceMovementCoordinates,
        SIGN: number = ((props.preferredArguments?.colour ?? props.cell.colouredPiece.colour) == "white") ? +1 : -1;

    return { x: x + x0 * SIGN, y: y + y0 * SIGN };
}

export default AddPieceMovementToPieceCoordinates;