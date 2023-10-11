import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "../../Utilities/Extensions/ToTitleCase";
import { PieceColour } from "../../Types/Piece";
import RadioGroup from "../../Utilities/Components/RadioGroup/RadioGroup";
import CustomButton from "../../Utilities/Components/CustomButton/CustomButton";
import { SelectGameboardSlice } from "../../Store/Features/GameboardSlice/GameboardSlice";
import RepetitionCounterValues from "../../Store/Features/PlaySlice/RepetitionCounterValues";
import { ResetPlayState, SelectPlaySlice, SetHandlers } from "../../Store/Features/PlaySlice/PlaySlice";
import FiftyRuleMovementCounterValues from "../../Store/Features/PlaySlice/FiftyRuleMovementCounterValues";
import CustomButtonDisplayer from "../../Utilities/Components/CustomButtonDisplayer/CustomButtonDisplayer";

import "./PlayPage.scss";

export default function PlayPage(): React.ReactElement {
    const PlaySlice = useSelector(SelectPlaySlice);
    const GameboardSlice = useSelector(SelectGameboardSlice);
    const Dispatch = useDispatch();

    const Navigate = useNavigate();

    const GAMEBOARD_URL: string = `${location.origin}${location.pathname}#/Play/Gameboard`;

    useEffect(() => {
        if (!GameboardSlice.gameHasStarted) { return; }

        Navigate("Gameboard");
    }, [])


    return (GameboardSlice.gameHasStarted) ? null : (
        <main id="play-page">
            <form action={GAMEBOARD_URL}>
                <h1 className="big-header">Plan a Game!</h1>

                <RadioGroup
                    id="first-player"

                    heading={{ text: "First Turn", type: "h2" }}
                    checkedValue={PlaySlice.handlers.firstPlayer}
                    entries={
                        Object.keys(PieceColour)
                            .map(pieceColour => ({
                                value: pieceColour,
                                text: pieceColour.toTitleCase(),
                            }))
                    }

                    setCheckedValue={value => Dispatch(SetHandlers({
                        ...PlaySlice.handlers,
                        firstPlayer: value as PieceColour,
                    }))}
                />

                <RadioGroup
                    id="repetition-counter-value"

                    heading={{ text: "Repetition Counter Value", type: "h2" }}
                    checkedValue={PlaySlice.handlers.repetitionCounterValue}
                    entries={
                        Object.values(RepetitionCounterValues)
                            .filter(value => typeof value == "number")
                            .map(value => Number(value)).map(value => ({
                                value: value,
                                text: value.toString(),
                            }))
                    }

                    setCheckedValue={value => Dispatch(SetHandlers({
                        ...PlaySlice.handlers,
                        repetitionCounterValue: value as RepetitionCounterValues,
                    }))}
                />

                <RadioGroup
                    id="fifty-rule-movement-counter-value"

                    heading={{ text: "Fifty Rule Movement Counter Value", type: "h2" }}
                    checkedValue={PlaySlice.handlers.fiftyRuleMovementCounterValue}
                    entries={
                        Object.values(FiftyRuleMovementCounterValues)
                            .filter(value => typeof value == "number")
                            .map(value => Number(value)).map(value => ({
                                value: value,
                                text: value.toString(),
                            }))
                    }

                    setCheckedValue={value => Dispatch(SetHandlers({
                        ...PlaySlice.handlers,
                        fiftyRuleMovementCounterValue: value as FiftyRuleMovementCounterValues,
                    }))}
                />

                <CustomButtonDisplayer>
                    <CustomButton
                        type="reset"
                        text="Defaults"

                        events={{ onClick: _e => Dispatch(ResetPlayState()) }}
                    />

                    <CustomButton
                        isArrowed
                        text="Play"
                        type="submit"
                        isEmphasized
                        iconPlace="right"
                    />
                </CustomButtonDisplayer>
            </form>
        </main>
    );
}