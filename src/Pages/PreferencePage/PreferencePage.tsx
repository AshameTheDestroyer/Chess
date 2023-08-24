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

    const [showMovements, setShowMovements] = useState(PreferenceSlice.options.showMovements);

    useEffect(() => {
        Dispatch(SetOptions({
            showMovements,
        }));
    }, [showMovements]);

    return (
        <section id="options-section">
            <h1>Options</h1>

            <ToggleButton
                id="show-movements1"
                text="Show Movements"
                isChecked={showMovements}

                setIsChecked={setShowMovements}
            />
        </section>
    );
}
