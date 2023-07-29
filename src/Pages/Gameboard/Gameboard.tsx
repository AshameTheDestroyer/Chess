import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";

import ColouredPiece from "../../Features/GameboardSlice/Piece";
import Cell, { CellState } from "../../Features/GameboardSlice/Cell";
import { CoordinatesToChessCoordinates } from "../../Features/GameboardSlice/ChessCoordinates";
import Coordinates, { CoordinateToIndex, IndexToCoordinates, RegularIndexToBoardIndex } from "../../Features/GameboardSlice/Coordinates";
import { CHESS_PIECE_COUNT, ResetCell, UpdateCell, SelectGameboardSlice, SetUpInitialGame, MovePiece } from "../../Features/GameboardSlice/GameboardSlice";

import "./Gameboard.scss";

import PIECE_IMAGES from "./PieceImages";

export default function Gameboard(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);
    const Dispatch = useDispatch();

    const [draggedPiece, setDraggedPiece] = useState<ColouredPiece>(null);
    const draggedPieceImageElementRef = useRef<HTMLImageElement>();

    let cellElements_: Array<HTMLButtonElement>;
    const getCellElements =
        (): Array<HTMLButtonElement> => (cellElements_ ??= Array.from(document.querySelectorAll(".cell")));

    useEffect(() => {
        Dispatch(SetUpInitialGame());
    }, []);

    function OnGameboardKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        if (draggedPiece != null) { ResetDragging(); }

        let cellHasBeenClicked: boolean = [" ", "Enter"].includes(e.key);

        if (cellHasBeenClicked) {
            let pieceHasMoved: boolean = EvaluatePieceMovement(cellElement);

            if (pieceHasMoved) { e.preventDefault(); return; }
        }

        const originalIndex: number = Number(cellElement.dataset["originalIndex"]);

        UpdateCellElement(getCellElements()[CalculateMovingIndex(originalIndex, e)], "selected");
    }

    function CalculateMovingIndex(index: number, e: React.KeyboardEvent<HTMLElement>): number {
        const n: number = CHESS_PIECE_COUNT;

        switch (e.key.toLowerCase()) {
            case "arrowup": case "w":
                let cellAtFirstRow: boolean = index < n;
                return (!cellAtFirstRow) ? index - n : index + n ** 2 - n;

            case "arrowdown": case "s":
                let cellAtLastRow: boolean = index >= n ** 2 - n;
                return (!cellAtLastRow) ? index + n : index - n ** 2 + n;

            case "arrowleft": case "a":
                let cellAtFirstColumn: boolean = index % n == 0;
                return (!cellAtFirstColumn) ? index - 1 : index + n - 1;

            case "arrowright": case "d":
                let cellAtLastColumn: boolean = (index + 1) % n == 0;
                return (!cellAtLastColumn) ? index + 1 : index - n + 1;

            default:
                return index;
        }
    }

    function OnGameboardMouseDown(e: React.MouseEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        if (draggedPiece != null) { ResetDragging(); }

        let pieceHasMoved: boolean = EvaluatePieceMovement(cellElement);

        if (pieceHasMoved) { return; }

        UpdateCellElement(cellElement, "selected");
        UpdateCellElement(cellElement, "ready");
    }

    function UpdateCellElement(cellElement: HTMLButtonElement, cellState: CellState): void {
        const cell: HTMLButtonElement = document.querySelector(`.${cellState}-cell`);
        cell?.classList.remove(`${cellState}-cell`);

        if (cell == cellElement) {
            Dispatch(ResetCell({ cellState }));

            return;
        }

        cellElement.classList.add(`${cellState}-cell`);
        cellElement.focus();

        const coordinates: Coordinates = IndexToCoordinates(
            Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        Dispatch(UpdateCell({ coordinates, cellState: cellState }));
    }

    function ResetCellElement(cellState: CellState): void {
        const selectedCell: HTMLButtonElement = document.querySelector(`.${cellState}-cell`);
        selectedCell?.classList.remove(`${cellState}-cell`);

        Dispatch(ResetCell({ cellState }));
    }

    function EvaluatePieceMovement(cellElement: HTMLButtonElement, fallbackOptions?: {
        toCell: Cell,
        fromCell: Cell,
    }): boolean {
        if (GameboardSlice.readyCell == null && fallbackOptions?.fromCell == null) { return false; }

        const
            { x: x1, y: y1 }: Coordinates = { ...(fallbackOptions?.fromCell ?? GameboardSlice.readyCell) },
            { x: x2, y: y2 }: Coordinates = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        const
            fromCell: Cell = GameboardSlice.cells[x1][y1],
            toCell: Cell = GameboardSlice.cells[x2][y2];

        const
            movingPiece: ColouredPiece = fallbackOptions?.fromCell?.piece ?? fromCell?.piece,
            targetPiece: ColouredPiece = fallbackOptions?.toCell?.piece ?? toCell?.piece;

        let movingPieceExists: boolean = movingPiece != null,
            targetPieceExists: boolean = targetPiece != null,
            targetPieceIsFoe: boolean = movingPiece?.colour != targetPiece?.colour;

        if (movingPieceExists && (!targetPieceExists || targetPieceIsFoe)) {
            Dispatch(MovePiece({
                from: { x: x1, y: y1 },
                to: { x: x2, y: y2 },
            }));

            ResetCellElement("selected");
            ResetCellElement("ready");

            const
                index: number = CoordinateToIndex({ x: x1, y: CHESS_PIECE_COUNT - y1 - 1 }, CHESS_PIECE_COUNT),
                previousCellElement: HTMLButtonElement = getCellElements()[index];

            UpdateCellElement(previousCellElement, "played-from");
            UpdateCellElement(cellElement, "played-to");

            return true;
        }

        return false;
    }

    function OnGameboardDragStart(e: React.DragEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        e.preventDefault();

        UpdateCellElement(cellElement, "selected");
        UpdateCellElement(cellElement, "ready");

        cellElement.classList.add("dragged-cell");

        const { x, y }: Coordinates = IndexToCoordinates(
            Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        setDraggedPiece(GameboardSlice.cells[x][y].piece);

        document.onmousemove = OnDocumentMouseMove;
        document.onmouseup = OnDocumentMouseUp;
    }

    function ResetDragging(): void {
        const draggedCell: HTMLButtonElement = document.querySelector(".dragged-cell");
        draggedCell.classList.remove("dragged-cell");

        document.onmousemove = null;
        document.onmouseup = null;

        setDraggedPiece(null);

        ResetCellElement("selected");
        ResetCellElement("ready");
    }

    function OnDocumentMouseMove(e: MouseEvent): void {
        const draggedPieceImageElement: HTMLImageElement = draggedPieceImageElementRef.current;

        const
            PADDING_IN_PIXEL: number = 30,
            TOP: number = Math.min(Math.max(e.y, PADDING_IN_PIXEL), window.innerHeight - PADDING_IN_PIXEL),
            LEFT: number = Math.min(Math.max(e.x, PADDING_IN_PIXEL), window.innerWidth - PADDING_IN_PIXEL);

        draggedPieceImageElement.style.top = `${TOP}px`;
        draggedPieceImageElement.style.left = `${LEFT}px`;
    }

    function OnDocumentMouseUp(e: MouseEvent): void {
        let isDraggingPiece: boolean = draggedPieceImageElementRef.current != null;
        if (!isDraggingPiece) { return; }

        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");

        if (cellElement == null) {
            if (isDraggingPiece) { ResetDragging(); }

            return;
        }

        const readyCellElement: HTMLButtonElement = document.querySelector(".cell.dragged-cell");

        const
            { x: x1, y: y1 } = IndexToCoordinates(Number(readyCellElement.dataset["index"]), CHESS_PIECE_COUNT),
            { x: x2, y: y2 } = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        EvaluatePieceMovement(cellElement, {
            fromCell: GameboardSlice.cells[x1][y1],
            toCell: GameboardSlice.cells[x2][y2],
        });

        ResetDragging();
    }

    return (
        <main id="gameboard-body">
            <section
                id="gameboard"
                key="gameboard"

                onKeyDown={OnGameboardKeyDown}
                onDragStart={OnGameboardDragStart}
                onClick={OnGameboardMouseDown}
            >
                {
                    new Array(CHESS_PIECE_COUNT ** 2).fill(null).map((_, i) =>
                        <CellElement key={i} index={i} />)
                }
            </section>
            {
                draggedPiece != null &&
                createPortal(
                    <img
                        id="dragged-piece"
                        ref={draggedPieceImageElementRef}

                        alt={`${draggedPiece}_icon`}
                        src={PIECE_IMAGES[`${draggedPiece.colour}_${draggedPiece.piece}`]}
                    />, document.body)
            }
        </main>
    );
}

type CellProps = {
    index: number;
}

function CellElement(props: CellProps): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);

    const
        index: number = RegularIndexToBoardIndex(props.index, CHESS_PIECE_COUNT),
        coordinates: Coordinates = IndexToCoordinates(index, CHESS_PIECE_COUNT),
        { number, character } = CoordinatesToChessCoordinates(coordinates);

    const colouredPiece: ColouredPiece = GameboardSlice.cells[coordinates.x][coordinates.y].piece;

    return (
        <button
            className="cell"

            tabIndex={-1}
            data-index={index}
            data-number={number}
            data-character={character}
            data-original-index={props.index}
            data-coordinates={Object.values(coordinates)}
        >
            {
                colouredPiece != null &&
                <img
                    alt={`${colouredPiece}_icon`}
                    src={PIECE_IMAGES[`${colouredPiece.colour}_${colouredPiece.piece}`]}
                />
            }
        </button>
    );
}
