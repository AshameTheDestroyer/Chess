import { Piece } from "./Piece";
import Coordinates from "../Utilities/Types/Coordinates";
import EitherOrNeither from "../Utilities/Types/EitherOrNeither";
import { CHESS_PIECE_COUNT } from "../Functions/GenerateEmptyGameboard";

type PieceMovement = {
    isFirstMoveOnly?: boolean;
    isCastlable?: boolean;
    isPromotable?: boolean;
    isSneakAttack?: boolean;
} & EitherOrNeither<{
    isMoveOnly: boolean;
}, {
    isAttackOnly: boolean;
}> & Coordinates;

export default PieceMovement;

export type PieceMovements = Array<PieceMovement | Array<PieceMovement>>;

export const AllPieceMovements: Map<Piece, PieceMovements> = (() => {
    const map = new Map<Piece, PieceMovements>();
    Object.keys(Piece).forEach(piece => map.set(Piece[piece], GeneratePieceMovements(Piece[piece])));

    return map;
})();

export function GeneratePieceMovements(piece: Piece): PieceMovements {
    switch (piece) {
        case "pawn": return GeneratePawnMovements();
        case "knight": return GenerateKnightMovements();
        case "bishop": return GenerateBishopMovements();
        case "rook": return GenerateRookMovements();
        case "queen": return GenerateQueenMovements();
        case "king": return GenerateKingMovements();
    }
}

function GeneratePawnMovements(): PieceMovements {
    return [
        [
            { x: 0, y: 1, isMoveOnly: true, isPromotable: true },
            { x: 0, y: 2, isMoveOnly: true, isFirstMoveOnly: true },
        ],
        { x: 1, y: 1, isAttackOnly: true, isPromotable: true },
        { x: -1, y: 1, isAttackOnly: true, isPromotable: true },
        { x: 1, y: 1, isSneakAttack: true },
        { x: -1, y: 1, isSneakAttack: true },
    ];
}

function GenerateKnightMovements(): PieceMovements {
    const movements: PieceMovements = [];

    for (let i: number = -1; i <= 1; i += 2) {
        for (let j: number = -1; j <= 1; j += 2) {
            movements.push({ x: i * 2, y: j });
            movements.push({ x: j, y: i * 2 });
        }
    }

    return movements;
}

function GenerateBishopMovements(): PieceMovements {
    const
        topLeftMovements: Array<PieceMovement> = [],
        topRightMovements: Array<PieceMovement> = [],
        bottomLeftMovements: Array<PieceMovement> = [],
        bottomRightMovements: Array<PieceMovement> = [];

    for (let i: number = 1; i <= CHESS_PIECE_COUNT - 1; i++) {
        topLeftMovements.push({ x: -i, y: i });
        topRightMovements.push({ x: i, y: i });
        bottomLeftMovements.push({ x: -i, y: -i });
        bottomRightMovements.push({ x: i, y: -i });
    }

    return [topLeftMovements, topRightMovements, bottomLeftMovements, bottomRightMovements];
}

function GenerateRookMovements(): PieceMovements {
    const
        topMovements: Array<PieceMovement> = [],
        leftMovements: Array<PieceMovement> = [],
        rightMovements: Array<PieceMovement> = [],
        bottomMovements: Array<PieceMovement> = [];

    for (let i: number = 1; i <= CHESS_PIECE_COUNT - 1; i++) {
        topMovements.push({ x: 0, y: i });
        leftMovements.push({ x: -i, y: 0 });
        rightMovements.push({ x: i, y: 0 });
        bottomMovements.push({ x: 0, y: -i });
    }

    return [topMovements, leftMovements, rightMovements, bottomMovements];
}

function GenerateQueenMovements(): PieceMovements {
    return [...GenerateBishopMovements(), ...GenerateRookMovements()];
}

function GenerateKingMovements(): PieceMovements {
    const movements: PieceMovements = [];

    for (let i: number = -1; i <= 1; i += 2) {
        movements.push([{ x: i, y: 0 }, { x: i * 2, y: 0, isCastlable: true }]);
        movements.push({ x: 0, y: i });
        movements.push({ x: i, y: i });
        movements.push({ x: -i, y: i });
    }

    return movements;
}