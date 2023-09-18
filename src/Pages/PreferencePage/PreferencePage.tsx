import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ToggleButton from "../../Utilities/Components/ToggleButton/ToggleButton";
import { SelectPreferenceSlice, SetOptions } from "../../Store/Features/PreferenceSlice/PreferenceSlice";
import ChessThemePickerDisplayer from "../../Components/ChessThemePickerDisplayer/ChessThemePickerDisplayer";

import "./PreferencePage.scss";

export default function PreferencePage(): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    return (
        <main id="preferences-page">
            <ChessThemePickerDisplayer selectedChessTheme={PreferenceSlice.chessTheme} />

            <OptionSection />
        </main>
    );
}

function OptionSection(): React.ReactElement {
    const Dispatch = useDispatch();
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    const [showHintMovements, setShowHintMovements] = useState(PreferenceSlice.options.showHintMovements);
    const [showPlayedMovements, setShowPlayedMovements] = useState(PreferenceSlice.options.showPlayedMovements);

    useEffect(() => {
        Dispatch(SetOptions({
            showHintMovements,
            showPlayedMovements: showPlayedMovements || showHintMovements,
        }));
    }, [showHintMovements, showPlayedMovements]);

    return (
        <section id="options-section">
            <h1>Options</h1>

            <ToggleButton
                id="show-hint-movements"
                text="Show Hint Movements"
                isChecked={showHintMovements}

                setIsChecked={setShowHintMovements}
            />

            <ToggleButton
                id="show-played-movements"
                text="Show Played Movements"
                isDisabled={showHintMovements}
                isChecked={showPlayedMovements}

                setIsChecked={setShowPlayedMovements}
            />
        </section>
    );
}
