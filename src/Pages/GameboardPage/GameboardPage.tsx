import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";

import Cell from "../../Types/Cell";
import ColouredPiece from "../../Types/Piece";
import useContextMenu from "../../Utilities/Hooks/useContextMenu";
import { CHESS_PIECE_COUNT } from "../../Functions/GenerateEmptyGameboard";
import PromotionPickerModal from "../../Modals/PromotionPickerModal/PromotionPickerModal";
import { SelectPreferenceSlice } from "../../Store/Features/PreferenceSlice/PreferenceSlice";
import ChessCoordinates, { CoordinatesToChessCoordinates } from "../../Types/ChessCoordinates";
import ContextMenu, { ContextMenuGroupWithSelector } from "../../Utilities/Components/ContextMenu/ContextMenu";
import CellState, { DoCellStatesIntersect, GetMostImportantCellState, IsCellStateMovable } from "../../Types/CellState";

import Coordinates, {
    CoordinateToIndex,
    IndexToCoordinates,
    RegularIndexToBoardIndex,
} from "../../Utilities/Types/Coordinates";

import {
    MovePiece,
    AddStateToCell,
    ResetGameboard,
    SetUpInitialGame,
    SelectGameboardSlice,
    RemoveStateFromSingularCell,
} from "../../Store/Features/GameboardSlice/GameboardSlice";

import "./GameboardPage.scss";

import PIECE_IMAGES from "./PieceImages";

export default function GameboardPage(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);
    const Dispatch = useDispatch();

    const [draggedCell, setDraggedCell] = useState<Cell>(null);
    const draggedPieceImageElementRef = useRef<SVGSVGElement>();

    const [readyToPromoteCell, setReadyToPromoteCell] = useState<Cell>(null);

    const [
        isContextMenuOpen,
        contextMenuCoordinates,
        contextMenuClickedElement,
        setIsContextMenuOpen,
        _setContextMenuCoordinates,
        _setContextMenuClickedElement,
    ] = useContextMenu();

    const groups: Array<ContextMenuGroupWithSelector> = [{
        options: [{
            name: "Restart",
            keyShortcut: "Ctrl+R",
            selector: "#gameboard",
            // iconURL: PIECE_IMAGES.black_king,
            onClick: _e => { console.log("Game's Restarted."); },
        }, {
            name: "Capture",
            selector: ".cell-with-piece",
            // iconURL: PIECE_IMAGES.white_queen,
            onClick: _e => { console.log("Piece's Capture."); },
            condition: GameboardSlice.cells.flat().find(cell => DoCellStatesIntersect(cell.state, CellState.ready)) != null
        }, {
            name: "Do",
            opensTab: "do-tab",
        }],
    }, {
        options: [{
            name: "LOL",
            opensTab: "lol-tab",
        }],
    }, {
        tabName: "do-tab",
        options: [{
            name: "Information",
            opensTab: "information-tab",
        }, {
            name: "Undo",
            keyShortcut: "Ctrl+Z",
            onClick: _e => { console.log("Game's Undone."); },
        }, {
            name: "Redo",
            keyShortcut: "Ctrl+Y",
            onClick: _e => { console.log("Game's Redone."); },
        }],
    }, {
        tabName: "information-tab",
        options: [{
            name: "Furthermore",
            opensTab: "furthermore-tab",
            // iconURL: PIECE_IMAGES.black_knight,
        }],
    }, {
        tabName: "furthermore-tab",
        options: [{
            name: "Good",
            // iconURL: PIECE_IMAGES.black_pawn,
            onClick: _e => { console.log("Gooooooooood."); },
        }],
    }, {
        tabName: "furthermore-tab",
        options: [{
            name: "Bad",
            // iconURL: PIECE_IMAGES.white_pawn,
            onClick: _e => { console.log("Baaaaaaaaad."); },
        }],
    }, {
        tabName: "lol-tab",
        options: [{
            name: "LOL",
            onClick: _e => { console.log("LOOOOOOOOOOOL."); },
        }],
    }];

    useEffect(() => {
        Dispatch(SetUpInitialGame());

        return () => { Dispatch(ResetGameboard()); };
    }, []);

    return (
        <main id="gameboard-body">
            <GameboardElement
                draggedCell={draggedCell}
                readyToPromoteCell={readyToPromoteCell}
                draggedPieceImageElementRef={draggedPieceImageElementRef}

                setDraggedCell={setDraggedCell}
                setIsContextMenuOpen={setIsContextMenuOpen}
                setReadyToPromoteCell={setReadyToPromoteCell}
            />

            <DraggedPieceElement
                draggedPiece={draggedCell?.colouredPiece}
                draggedPieceImageElementRef={draggedPieceImageElementRef}
            />

            <ContextMenu
                groups={groups}
                isOpen={isContextMenuOpen}
                {...contextMenuCoordinates}
                clickedElement={contextMenuClickedElement}

                setIsOpen={setIsContextMenuOpen}
            />
        </main>
    );
}

type GameboardElementProps = {
    draggedCell: Cell;
    readyToPromoteCell: Cell;
    draggedPieceImageElementRef: React.MutableRefObject<SVGSVGElement>;

    setDraggedCell: React.Dispatch<React.SetStateAction<Cell>>;
    setIsContextMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReadyToPromoteCell: React.Dispatch<React.SetStateAction<Cell>>;
};

function GameboardElement(props: GameboardElementProps): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);
    const PreferenceSlice = useSelector(SelectPreferenceSlice);
    const Dispatch = useDispatch();

    let cellElements_: Array<HTMLButtonElement>;
    const getCellElements =
        (): Array<HTMLButtonElement> => (cellElements_ ??= Array.from(document.querySelectorAll(".cell")));

    function OnGameboardKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        if (props.draggedCell != null) { ResetDragging(); }

        let cellHasBeenClicked: boolean = [" ", "Enter"].includes(e.key);
        if (cellHasBeenClicked) { return; }

        RemoveStateFromSingularCellElement(CellState.selected);

        const
            originalIndex: number = Number(cellElement.dataset["originalIndex"]),
            nextCellElement: HTMLButtonElement = getCellElements()[CalculateMovingIndex(originalIndex, e)];

        nextCellElement.focus();

        AddStateToCellElement(nextCellElement, CellState.selected);
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

    function OnGameboardClick(e: React.MouseEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        if (props.draggedCell != null) { ResetDragging(); }

        let pieceHasMoved: boolean = EvaluatePieceMovement(cellElement),
            cellIsReady: boolean = cellElement.classList.contains("ready-cell"),
            cellIsSelected: boolean = cellElement.classList.contains("selected-cell");

        RemoveStateFromSingularCellElement(CellState.ready);
        RemoveStateFromSingularCellElement(CellState.selected);

        if (pieceHasMoved || (cellIsSelected && cellIsReady)) { return; }

        AddStateToCellElement(cellElement, CellState.selected);
        AddStateToCellElement(cellElement, CellState.ready);
    }

    function AddStateToCellElement(cellElement: HTMLButtonElement, cellState: CellState): void {
        const coordinates: Coordinates = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);
        Dispatch(AddStateToCell({ ...coordinates, cellState }));
    }

    function RemoveStateFromSingularCellElement(cellState: CellState): void {
        Dispatch(RemoveStateFromSingularCell({ cellState }));
    }

    type EvaluatePieceMovementPredefinedOptionsProps = {
        toCell: Cell,
        fromCell: Cell,
    };

    function EvaluatePieceMovement(cellElement: HTMLButtonElement, predefinedOptions?: EvaluatePieceMovementPredefinedOptionsProps): boolean {
        const readyCell: Cell = GameboardSlice.cells.flat().find(cell => DoCellStatesIntersect(cell.state, CellState.ready));
        if (readyCell == null && predefinedOptions?.fromCell == null) { return false; }

        const
            { x: x1, y: y1 }: Coordinates = { ...(predefinedOptions?.fromCell ?? readyCell) },
            { x: x2, y: y2 }: Coordinates = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        const
            fromCell: Cell = predefinedOptions?.fromCell ?? GameboardSlice.cells[x1][y1],
            toCell: Cell = predefinedOptions?.toCell ?? GameboardSlice.cells[x2][y2];

        const
            movingPiece: ColouredPiece = predefinedOptions?.fromCell?.colouredPiece ?? fromCell?.colouredPiece,
            targetPiece: ColouredPiece = predefinedOptions?.toCell?.colouredPiece ?? toCell?.colouredPiece;

        let movingPieceExists: boolean = movingPiece != null,
            targetPieceExists: boolean = targetPiece != null,
            targetPieceIsFoe: boolean = targetPieceExists && movingPiece?.colour != targetPiece?.colour,
            targetCellIsMovable: boolean = IsCellStateMovable(toCell.state),
            cellIsPromotable: boolean = DoCellStatesIntersect(toCell.state, CellState.promote);

        if (!targetCellIsMovable) { return false; }
        if (!movingPieceExists || (targetPieceExists && !targetPieceIsFoe)) { return false; }

        Dispatch(MovePiece({
            from: { x: x1, y: y1 },
            to: { x: x2, y: y2 },
        }));

        if (cellIsPromotable) {
            props.setReadyToPromoteCell({
                ...toCell,
                colouredPiece: movingPiece,
            });
        }

        RemoveStateFromSingularCellElement(CellState.ready);
        RemoveStateFromSingularCellElement(CellState.selected);
        RemoveStateFromSingularCellElement(CellState.playedTo);
        RemoveStateFromSingularCellElement(CellState.playedFrom);

        const
            index: number = CoordinateToIndex({ x: x1, y: CHESS_PIECE_COUNT - y1 - 1 }, CHESS_PIECE_COUNT),
            previousCellElement: HTMLButtonElement = getCellElements()[index];

        AddStateToCellElement(previousCellElement, CellState.playedFrom);
        AddStateToCellElement(cellElement, CellState.playedTo);

        return true;
    }

    function OnGameboardDragStart(e: React.DragEvent<HTMLElement>): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { return; }

        e.preventDefault();

        props.setIsContextMenuOpen(false);

        RemoveStateFromSingularCellElement(CellState.ready);
        RemoveStateFromSingularCellElement(CellState.selected);

        AddStateToCellElement(cellElement, CellState.ready);
        AddStateToCellElement(cellElement, CellState.selected);

        const { x, y }: Coordinates = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        props.setDraggedCell(GameboardSlice.cells[x][y]);

        document.onmousemove = OnDocumentMouseMove;
        document.onmouseup = OnDocumentMouseUp;
    }

    function ResetDragging(): void {
        const draggedCell: HTMLButtonElement = document.querySelector(".dragged-cell");
        draggedCell.classList.remove("dragged-cell");

        document.onmousemove = null;
        document.onmouseup = null;

        props.setDraggedCell(null);

        RemoveStateFromSingularCellElement(CellState.selected);
        RemoveStateFromSingularCellElement(CellState.ready);
    }

    function OnDocumentMouseMove(e: MouseEvent): void {
        const
            PADDING_IN_PIXELS: number = 30,
            TOP: number = Math.min(Math.max(e.y, PADDING_IN_PIXELS), window.innerHeight - PADDING_IN_PIXELS),
            LEFT: number = Math.min(Math.max(e.x, PADDING_IN_PIXELS), window.innerWidth - PADDING_IN_PIXELS);

        if (props.draggedPieceImageElementRef.current == null) { return; }

        props.draggedPieceImageElementRef.current.style.top = `${TOP}px`;
        props.draggedPieceImageElementRef.current.style.left = `${LEFT}px`;
    }

    function OnDocumentMouseUp(e: MouseEvent): void {
        const cellElement: HTMLButtonElement = (e.target as HTMLButtonElement).closest(".cell");
        if (cellElement == null) { ResetDragging(); return; }

        const
            readyCellElement: HTMLButtonElement = document.querySelector(".cell.dragged-cell"),
            { x: x1, y: y1 } = IndexToCoordinates(Number(readyCellElement.dataset["index"]), CHESS_PIECE_COUNT),
            { x: x2, y: y2 } = IndexToCoordinates(Number(cellElement.dataset["index"]), CHESS_PIECE_COUNT);

        const cellState = GetMostImportantCellState(CellElementClassListToCellState(cellElement));

        EvaluatePieceMovement(cellElement, {
            fromCell: GameboardSlice.cells[x1][y1],
            toCell: { ...GameboardSlice.cells[x2][y2], state: cellState },
        });

        ResetDragging();
    }

    function CellElementClassListToCellState(cellElement: HTMLButtonElement): CellState {
        return Array.from(cellElement.classList)
            .map<string>(className => className.toString())
            .filter(className => className.endsWith("-cell"))
            .map<CellState>(cellStateName => CellState[cellStateName.replace("-cell", "")])
            .reduce((previous, current) => previous + (current ?? 0), 0);
    }

    return <section
        id="gameboard"
        key="gameboard"

        onClick={OnGameboardClick}
        onKeyDown={OnGameboardKeyDown}
        onDragStart={OnGameboardDragStart}

        style={{
            "--dark-colour": PreferenceSlice.chessTheme.darkColour,
            "--light-colour": PreferenceSlice.chessTheme.lightColour,
            "--board-colour": PreferenceSlice.chessTheme.boardColour,
        } as React.CSSProperties}
    >
        {
            new Array(CHESS_PIECE_COUNT ** 2).fill(null).map((_, i) =>
                <CellElement
                    key={i}

                    index={i}
                    draggedCell={props.draggedCell}
                />
            )
        }

        <PromotionPickerModal
            isOpen={props.readyToPromoteCell != null}
            readyToPromoteCell={props.readyToPromoteCell}

            setIsOpen={value => props.setReadyToPromoteCell((value) ? props.readyToPromoteCell : null)}
        />
    </section>;
}

type CellProps = {
    index: number;
    draggedCell: Cell;
};

function CellElement(props: CellProps): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);
    const cellElementRef = useRef<HTMLButtonElement>(null);

    const
        index: number = RegularIndexToBoardIndex(props.index, CHESS_PIECE_COUNT),
        { x, y }: Coordinates = IndexToCoordinates(index, CHESS_PIECE_COUNT),
        { number, character }: ChessCoordinates = CoordinatesToChessCoordinates({ x, y }),
        cell: Cell = GameboardSlice.cells[x][y],
        piece: ColouredPiece = cell.colouredPiece;

    return (
        <button
            className={[
                "cell",
                (piece != null) && "cell-with-piece",
                (props.draggedCell?.x == x && props.draggedCell?.y == y) && "dragged-cell",

                ...Object.entries(CellState)
                    .filter(([key, _value]) => isNaN(Number(key)))
                    .map<[string, number]>(([key, value]) => [key, Number(value)])
                    .filter(([_key, value]) => DoCellStatesIntersect(cell.state, value))
                    .map(([key, _value]) => `${key}-cell`)
            ].toClassName()}
            ref={cellElementRef}

            draggable
            tabIndex={-1}
            data-index={index}
            data-number={number}
            data-character={character}
            data-coordinates={`${x},${y}`}
            data-original-index={props.index}
        >
            {
                (piece != null) &&
                PIECE_IMAGES[`${piece.colour}_${piece.piece}`]({
                    className: [
                        "piece",
                        `piece-${piece.colour}`,
                    ].toClassName(),
                })
            }
        </button>
    );
}

type DraggedPieceElementProps = {
    draggedPiece: ColouredPiece;
    draggedPieceImageElementRef: React.MutableRefObject<SVGSVGElement>;
};

function DraggedPieceElement(props: DraggedPieceElementProps): React.ReactNode {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    return (props.draggedPiece != null) &&
        createPortal(
            PIECE_IMAGES[`${props.draggedPiece.colour}_${props.draggedPiece.piece}`]({
                id: "dragged-piece",
                className: [
                    "piece",
                    `piece-${props.draggedPiece.colour}`,
                ].toClassName(),
                ref: props.draggedPieceImageElementRef,

                style: {
                    "--dark-colour": PreferenceSlice.chessTheme.darkColour,
                    "--light-colour": PreferenceSlice.chessTheme.lightColour,
                } as React.CSSProperties,
            })
            , document.body);
}