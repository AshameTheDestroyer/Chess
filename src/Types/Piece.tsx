import Either from "../Utilities/Types/Either";

export enum PieceColour {
    white = "white",
    black = "black",
}

export enum Piece {
    pawn = "pawn",
    knight = "knight",
    bishop = "bishop",
    rook = "rook",
    queen = "queen",
    king = "king",
}

type ColouredPiece = {
    colour: PieceColour;
} & Either<{
    piece: Piece;
}, Either<{
    piece: Piece.pawn;

    hasMoved: boolean;
    canBeSnuckUpon: boolean;
}, Either<{
    piece: Piece.king;

    hasMoved: boolean;
}, {
    piece: Piece.rook;

    hasMoved: boolean;
    isLeftRook: boolean;
    isRightRook: boolean;
}>>>;

export default ColouredPiece;