import ColouredPiece from "../../../../Types/Piece";
import Coordinates from "../../../../Utilities/Types/Coordinates";

type SetPieceActionType = {
    isPromoting?: boolean;
    colouredPiece: ColouredPiece;
    doesntTriggerDetectChecking?: boolean;
} & Coordinates;

export default SetPieceActionType;