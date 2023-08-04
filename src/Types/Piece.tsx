export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
export type PieceColour = "white" | "black";

type ColouredPiece = {
    piece: Piece;
    colour: PieceColour;
};

export default ColouredPiece;