import Cell from "./Cell";

type CheckOccurrence = {
    kingCell: Cell;
    threateningCellLines: Array<Array<Cell>>;
};

export default CheckOccurrence;