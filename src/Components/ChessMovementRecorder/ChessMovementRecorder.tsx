import React from "react";
import { useSelector } from "react-redux";

import "../../Utilities/Extensions/Zip";
import "../../Utilities/Extensions/ToNth";
import { PieceColour } from "../../Types/Piece";
import { MovementRecordToString } from "../../Types/MovementRecord";
import { ChessCoordinatesToString } from "../../Types/ChessCoordinates";
import { SelectGameboardSlice } from "../../Store/Features/GameboardSlice/GameboardSlice";

import "./ChessMovementRecorder.scss";

export default function ChessMovementRecorder(): React.ReactElement {
    return (
        <table id="chess-movement-recorder">
            <caption>Played Movements</caption>
            <ChessMovementRecorderHeader />
            <ChessMovementRecorderBody />
            <ChessMovementRecorderFooter />
        </table>
    );
}

function ChessMovementRecorderHeader(): React.ReactElement {
    return (
        <thead>
            <tr>
                <th>nth</th>
                {
                    Object.keys(PieceColour).map((pieceColour, i) =>
                        <th key={i}> {`${pieceColour[0].toUpperCase()}${pieceColour.slice(1)}`} </th>)
                }
            </tr>
        </thead>
    );
}

function ChessMovementRecorderBody(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);

    const [whiteRecordedMovements, blackRecordedMovements] = [...GameboardSlice.playerRecordedMovements]
        .sort((a, b) => a.colour.charCodeAt(0) + b.colour.charCodeAt(0))
        .map(playerRecorderMovements => playerRecorderMovements.movements)
        .map(recordedMovements => recordedMovements.map(recordedMovement => [
            ChessCoordinatesToString(recordedMovement.from),
            MovementRecordToString(recordedMovement),
        ]));

    const movementRecordRows: Array<Array<string>> =
        whiteRecordedMovements.zip(blackRecordedMovements,
            (a, b) => [...a, ...b], [["", ""], ["", ""]]);

    return (
        <tbody> {
            movementRecordRows.map((movementRecordRow, i) =>
                <tr key={i}>
                    <th> {(i + 1).toNth()} </th>
                    {
                        movementRecordRow.map((movementRecord, j) =>
                            <td key={j}> {movementRecord} </td>)
                    }
                </tr>
            )
        } </tbody>
    );
}

function ChessMovementRecorderFooter(): React.ReactElement {
    const GameboardSlice = useSelector(SelectGameboardSlice);

    return (
        <tfoot>
            <tr>
                <th>Checks</th>
                {
                    GameboardSlice.playerCheckCounters
                        .map(({ colour: _playerColour, counter: checkCounter }, i) =>
                            <td key={i}>{checkCounter}</td>)
                }
            </tr>
        </tfoot>
    );
}