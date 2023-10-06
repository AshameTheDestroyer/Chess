import Cell from "../../../Types/Cell";
import ColouredPiece, { Piece, PieceColour } from "../../../Types/Piece";
import { CHESS_PIECE_COUNT } from "../../../Functions/GenerateEmptyGameboard";
import Coordinates, { IndexToCoordinates, RegularIndexToBoardIndex } from "../../../Utilities/Types/Coordinates";

// INFO: FEN stands for Forsyth-Edwards Notation; a way to represent chess game via a string.
export const INITIAL_GAME_FEN_CODE: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
// export const INITIAL_GAME_FEN_CODE: string = "3k4/Q2r4/8/3b4/8/3Q4/8/6K";

const chessPieceMap = new Map<string, `${PieceColour}_${Piece}`>([
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
    let cells: Array<Cell> = [],
        i: number = 0;

    FENCode.split("").forEach(character => {
        if (character == "/") { return; }

        const number: number = Number(character);
        if (!isNaN(number)) { i += number; return; }

        if (!chessPieceMap.has(character)) { throw new EvalError(`The character "${character}" does not represent any chess piece.`); }

        const
            PIECE_NAME = chessPieceMap.get(character),
            piece: Piece = PIECE_NAME.split("_")[1] as Piece,
            colour: PieceColour = PIECE_NAME.split("_")[0] as PieceColour,
            index: number = RegularIndexToBoardIndex(i, CHESS_PIECE_COUNT),
            { x, y }: Coordinates = IndexToCoordinates(index, CHESS_PIECE_COUNT),
            colouredPiece: ColouredPiece = BuildColouredPiece({ piece, colour, x, y });

        cells.push({ x, y, colouredPiece });
        i++;
    });

    return cells;
}

function BuildColouredPiece(props: ColouredPiece & Coordinates): ColouredPiece {
    switch (props.piece) {
        case Piece.pawn: return {
            hasMoved: false,
            piece: props.piece,
            colour: props.colour,
            canBeSnuckUpon: false,
        };

        case Piece.rook: return {
            hasMoved: false,
            piece: props.piece,
            colour: props.colour,
            isLeftRook: props.x == 0 &&
                ((props.colour == PieceColour.white) ? props.y == 0 : props.y == CHESS_PIECE_COUNT - 1),
            isRightRook: props.x == CHESS_PIECE_COUNT - 1 &&
                ((props.colour == PieceColour.white) ? props.y == 0 : props.y == CHESS_PIECE_COUNT - 1),
        };

        case Piece.king: return {
            hasMoved: false,
            piece: props.piece,
            colour: props.colour,
        };

        default: return {
            piece: props.piece,
            colour: props.colour,
        };
    }
}
