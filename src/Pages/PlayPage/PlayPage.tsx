import React from "react";
import { useDispatch, useSelector } from "react-redux";

import RadioGroup from "../../Utilities/Components/RadioGroup/RadioGroup";
import ToggleButton from "../../Utilities/Components/ToggleButton/ToggleButton";
import CustomButton from "../../Utilities/Components/CustomButton/CustomButton";
import RepetitionCounterValues from "../../Store/Features/PlaySlice/RepetitionCounterValues";
import { ResetPlayState, SelectPlaySlice, SetBinaries, SetHandlers } from "../../Store/Features/PlaySlice/PlaySlice";
import FiftyRuleMovementCounterValues from "../../Store/Features/PlaySlice/FiftyRuleMovementCounterValues";
import CustomButtonDisplayer from "../../Utilities/Components/CustomButtonDisplayer/CustomButtonDisplayer";

import "./PlayPage.scss";

export default function PlayPage(): React.ReactElement {
    const PlaySlice = useSelector(SelectPlaySlice);
    const Dispatch = useDispatch();

    return (
        <main id="play-page">
            <form action={`${location.origin}${location.pathname}#/Play/Gameboard`} >
                <section>
                    <ToggleButton
                        id="white-plays-first"

                        text="White Plays First"
                        isChecked={PlaySlice.binaries.whitePlaysFirst}

                        setIsChecked={_previousValue => Dispatch(SetBinaries({
                            ...PlaySlice.binaries,
                            whitePlaysFirst: !PlaySlice.binaries.whitePlaysFirst,
                        }))}
                    />
                </section>

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

                        children="Defaults"

                        events={{ onClick: _e => Dispatch(ResetPlayState()) }}
                    />

                    <CustomButton
                        type="submit"

                        isArrowed
                        isEmphasized
                        iconPlace="right"

                        children="Play"
                    />
                </CustomButtonDisplayer>
            </form>
        </main>
    );
}