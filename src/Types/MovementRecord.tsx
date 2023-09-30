import { GetPieceLetter, Piece } from "./Piece";
import ChessCoordinates, { ChessCoordinatesToString } from "./ChessCoordinates";

type MovementRecord = {
    movingPiece: Piece;
    to: ChessCoordinates;
    hasChecked?: boolean;
    pawnPromotedTo?: Piece;
    from: ChessCoordinates;
};

export default MovementRecord;

export function MovementRecordToString(movementRecord: MovementRecord): string {
    return (
        GetPieceLetter(movementRecord.movingPiece).toUpperCase() +
        ChessCoordinatesToString(movementRecord.to) +
        ((movementRecord.pawnPromotedTo) ? `=${GetPieceLetter(movementRecord.pawnPromotedTo).toUpperCase()}` : "") +
        ((movementRecord.hasChecked) ? "#" : "")
    );
}