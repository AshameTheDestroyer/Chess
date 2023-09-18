import CellState from "./CellState";
import ColouredPiece, { PieceColour } from "./Piece";
import Coordinates from "../Utilities/Types/Coordinates";

type Cell = {
    state?: CellState;
    colouredPiece?: ColouredPiece;
    territorializedKingColours?: Array<PieceColour>;
} & Coordinates;

export default Cell;