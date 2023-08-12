import ColouredPiece from "./Piece";
import CellState from "./CellState";
import Coordinates from "../Utilities/Types/Coordinates";

type Cell = {
    state?: CellState;
    colouredPiece?: ColouredPiece;
} & Coordinates;

export default Cell;