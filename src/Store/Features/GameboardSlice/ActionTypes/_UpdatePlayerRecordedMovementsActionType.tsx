import ColouredPiece from "../../../../Types/Piece";
import Either from "../../../../Utilities/Types/Either";
import MovementRecord from "../../../../Types/MovementRecord";
import Coordinates from "../../../../Utilities/Types/Coordinates";

type _UpdatePlayerRecordedMovementsActionType = {
    movingPiece: ColouredPiece;
} & Either<{
    to: Coordinates;
    from: Coordinates;
} & Omit<MovementRecord, "from" | "to" | "movingPiece" | "pawnPromotedTo">, {
} & Pick<MovementRecord, "pawnPromotedTo">>;

export default _UpdatePlayerRecordedMovementsActionType;