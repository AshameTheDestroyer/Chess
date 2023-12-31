import Coordinates from "../Utilities/Types/Coordinates";

type ChessCoordinates = {
    number: number;
    character: string;
};

export default ChessCoordinates;

const A_CHAR_CODE: number = 65;

export function CoordinatesToChessCoordinates(coordinates: Coordinates): ChessCoordinates {
    return {
        number: coordinates.y + 1,
        character: String.fromCharCode(A_CHAR_CODE + (coordinates.x)),
    };
}

export function ChessCoordinatesToString(chessCoordinates: ChessCoordinates): string {
    return `${chessCoordinates.character}${chessCoordinates.number}`;
}