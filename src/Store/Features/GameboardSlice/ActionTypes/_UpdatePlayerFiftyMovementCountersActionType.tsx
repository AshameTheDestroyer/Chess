import { PieceColour } from "../../../../Types/Piece";

type _UpdatePlayerFiftyMovementCountersActionType = {
    colour: PieceColour;
    pawnHasMoved?: boolean;
    pieceHasBeenAttacked?: boolean;
};

export default _UpdatePlayerFiftyMovementCountersActionType;