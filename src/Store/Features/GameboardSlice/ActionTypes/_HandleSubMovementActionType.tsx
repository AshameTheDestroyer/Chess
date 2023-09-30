import Cell from "../../../../Types/Cell";

type _HandleSubMovementActionType = {
    toCell: Cell;
    fromCell: Cell;
    doesntTriggerDetectChecking?: boolean;
};

export default _HandleSubMovementActionType;