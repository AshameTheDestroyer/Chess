import Cell from "../Types/Cell";
import Coordinates from "../Utilities/Types/Coordinates";

function AddPieceMovementToPieceCoordinates(cell: Cell, pieceMovementCoordinates: Coordinates): Coordinates {
    const
        { x, y }: Coordinates = cell,
        { x: x0, y: y0 }: Coordinates = pieceMovementCoordinates,
        SIGN: number = (cell.colouredPiece.colour == "white") ? +1 : -1;

    return { x: x + x0 * SIGN, y: y + y0 * SIGN };
}

export default AddPieceMovementToPieceCoordinates;