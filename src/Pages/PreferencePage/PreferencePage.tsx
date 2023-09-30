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
            <form onSubmit={e => e.preventDefault()}>
                <ChessThemePickerDisplayer selectedChessTheme={PreferenceSlice.chessTheme} />

                <OptionSection />
            </form>
        </main>
    );
}

function OptionSection(): React.ReactElement {
    const Dispatch = useDispatch();
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    const [showHintMovements, setShowHintMovements] = useState(PreferenceSlice.options.showHintMovements);
    const [alterPieceColours, setAlterPieceColours] = useState(PreferenceSlice.options.alterPieceColours);
    const [showPlayedMovements, setShowPlayedMovements] = useState(PreferenceSlice.options.showPlayedMovements);

    useEffect(() => {
        Dispatch(SetOptions({
            showHintMovements,
            alterPieceColours,
            showPlayedMovements: showPlayedMovements || showHintMovements,
        }));
    }, [showHintMovements, showPlayedMovements, alterPieceColours]);

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

            <ToggleButton
                id="alter-piece-colours"
                text="Alter Piece Colours"
                isChecked={alterPieceColours}

                setIsChecked={setAlterPieceColours}
            />
        </section>
    );
}