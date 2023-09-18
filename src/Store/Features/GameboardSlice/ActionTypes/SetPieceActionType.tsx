import ColouredPiece from "../../../../Types/Piece";
import Coordinates from "../../../../Utilities/Types/Coordinates";

type SetPieceActionType = {
    colouredPiece: ColouredPiece;
    dontTriggerDetectChecking?: boolean;
} & Coordinates;

export default SetPieceActionType;