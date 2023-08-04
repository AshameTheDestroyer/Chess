import Cell from "../../../Types/Cell";
import { CHESS_PIECE_COUNT } from "./GameboardSlice";
import ColouredPiece, { Piece, PieceColour } from "../../../Types/Piece";
import Coordinates, { IndexToCoordinates, RegularIndexToBoardIndex } from "../../../Utilities/Types/Coordinates";

// INFO: FEN stands for Forsyth-Edwards Notation; a way to represent chess game via a string.
export const INITIAL_GAME_FEN_CODE: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const CHESS_PIECE_MAP = new Map<string, `${PieceColour}_${Piece}`>([
    ["p", "black_pawn"],
    ["n", "black_knight"],
    ["b", "black_bishop"],
    ["r", "black_rook"],
    ["q", "black_queen"],
    ["k", "black_king"],
    ["P", "white_pawn"],
    ["N", "white_knight"],
    ["B", "white_bishop"],
    ["R", "white_rook"],
    ["Q", "white_queen"],
    ["K", "white_king"],
]);

export default function DecodeFENCode(FENCode: string): Array<Cell> {
    const CELLS: Array<Cell> = new Array<Cell>();

    let i: number = 0;
    FENCode.split("").forEach(character => {
        if (character == "/") { return; }

        const number: number = Number(character);
        if (!isNaN(number)) { i += number; return; }

        const
            piece_string = CHESS_PIECE_MAP.get(character),
            piece: ColouredPiece = {
                piece: piece_string.split("_")[1] as Piece,
                colour: piece_string.split("_")[0] as PieceColour,
            };

        if (piece == null) { throw new EvalError(`The character "${character}" does not represent any chess piece.`); }

        const index: number = RegularIndexToBoardIndex(i, CHESS_PIECE_COUNT),
            { x, y }: Coordinates = IndexToCoordinates(index, CHESS_PIECE_COUNT);

        CELLS.push({ x, y, piece });
        i++;
    });

    return CELLS;
}