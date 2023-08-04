import CellState from "../../../../Types/CellState";
import Coordinates from "../../../../Utilities/Types/Coordinates";

type AlterCellStateActionType = {
    cellState: CellState;
} & Coordinates;

export default AlterCellStateActionType;