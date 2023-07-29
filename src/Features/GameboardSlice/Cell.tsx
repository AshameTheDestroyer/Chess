import ColouredPiece from "./Piece";
import Coordinates from "./Coordinates";

type Cell = {
    state?: CellState;
    piece?: ColouredPiece;
} & Coordinates;

export default Cell;

export type CellState =
    "selected" | "ready" | "played-from" | "played-to" | "pinned" |
    "move" | "attack" | "castle" | "sneak" | "promote" | "checked";