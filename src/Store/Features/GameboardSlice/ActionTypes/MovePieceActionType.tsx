import Coordinates from "../../../../Utilities/Types/Coordinates";

type MovePieceActionType = {
    to: Coordinates;
    from: Coordinates;
    doesntRecordMovement?: boolean;
};

export default MovePieceActionType;