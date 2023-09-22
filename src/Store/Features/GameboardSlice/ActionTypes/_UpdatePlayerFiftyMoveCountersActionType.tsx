import { PieceColour } from "../../../../Types/Piece";

type _UpdatePlayerFiftyMoveCountersActionType = {
    colour: PieceColour;
    pawnHasMoved?: boolean;
    pieceHasBeenAttacked?: boolean;
};

export default _UpdatePlayerFiftyMoveCountersActionType;