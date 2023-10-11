import { useSelector } from "react-redux";
import React, { createContext, useContext } from "react";

import "../../Utilities/Extensions/Zip";
import "../../Utilities/Extensions/ToNth";
import { PieceColour } from "../../Types/Piece";
import { MovementRecordToString } from "../../Types/MovementRecord";
import { ChessCoordinatesToString } from "../../Types/ChessCoordinates";
import { SelectGameboardSlice } from "../../Store/Features/GameboardSlice/GameboardSlice";

import "./ChessMovementRecorder.scss";

type ChessMovementRecorderContextType = {
    whitePlaysFirst: boolean;
};

const ChessMovementRecorderContext =
    createContext<ChessMovementRecorderContextType>(null);

export default function ChessMovementRecorder(): React.ReactElement {
    const searchParams = new URLSearchParams(location.search);

    const context: ChessMovementRecorderContextType = {
        whitePlaysFirst: searchParams.get("first-player") == PieceColour.white,
    };

    return (
        <ChessMovementRecorderContext.Provider value={context}>
            <table id="chess-movement-recorder">
                <caption>Played Movements</caption>
                <ChessMovementRecorderHeader />
                <ChessMovementRecorderBody />
                <ChessMovementRecorderFooter />
            </table>
        </ChessMovementRecorderContext.Provider>
    );
}

function ChessMovementRecorderHeader(): React.ReactElement {
    const context = useContext(ChessMovementRecorderContext);

    return (
        <thead>
            <tr>
                <th>nth</th>
                {
                    ((context.whitePlaysFirst) ?
                        Object.keys(PieceColour) :
                        Object.keys(PieceColour).reverse()
                    ).map((pieceColour, i) =>
                        <th key={i}> {`${pieceColour[0].toUpperCase()}${pieceColour.slice(1)}`} </th>)
                }
            </tr>
        </thead>
    );
}

function ChessMovementRecorderBody(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);

    const context = useContext(ChessMovementRecorderContext);

    const [whiteRecordedMovements, blackRecordedMovements] = [...GameboardSlice.playerRecordedMovements]
        .sort((a, b) => a.colour.charCodeAt(0) + b.colour.charCodeAt(0) * ((context.whitePlaysFirst) ? +1 : -1))
        .map(playerRecorderMovements => playerRecorderMovements.movements)
        .map(recordedMovements => recordedMovements.map(recordedMovement => [
            ChessCoordinatesToString(recordedMovement.from),
            MovementRecordToString(recordedMovement),
        ]));

    const movementRecordRows: Array<Array<string>> =
        whiteRecordedMovements.zip(blackRecordedMovements,
            (a, b) => [...a, ...b], [["", ""], ["", ""]]);

    return (
        <tbody>{
            movementRecordRows.map((movementRecordRow, i) =>
                <tr key={i}>
                    <th> {(i + 1).toNth()} </th>
                    {
                        movementRecordRow.map((movementRecord, j) =>
                            <td key={j}> {movementRecord} </td>)
                    }
                </tr>
            )
        }</tbody>
    );
}

function ChessMovementRecorderFooter(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);

    const context = useContext(ChessMovementRecorderContext);

    return (
        <tfoot>
            <tr>
                <th>Checks</th>
                {
                    ((context.whitePlaysFirst) ?
                        GameboardSlice.playerCheckCounters :
                        [...GameboardSlice.playerCheckCounters].reverse()
                    ).map(({ colour: _playerColour, counter: checkCounter }, i) =>
                        <td key={i}>{checkCounter}</td>)
                }
            </tr>
        </tfoot>
    );
}