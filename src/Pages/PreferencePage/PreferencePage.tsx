import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "../../Utilities/Extensions/ToTitleCase";
import Theme from "../../Utilities/Types/Theme";
import RadioGroup from "../../Utilities/Components/RadioGroup/RadioGroup";
import ToggleButton from "../../Utilities/Components/ToggleButton/ToggleButton";
import ChessThemePickerDisplayer from "../../Components/ChessThemePickerDisplayer/ChessThemePickerDisplayer";
import { SelectPreferenceSlice, SetBinaries, SetHandlers } from "../../Store/Features/PreferenceSlice/PreferenceSlice";

import "./PreferencePage.scss";

export default function PreferencePage(): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    return (
        <main id="preference-page">
            <form onSubmit={e => e.preventDefault()}>
                <BinarySection />
                <HandlerSection />
                <ChessThemePickerDisplayer selectedChessTheme={PreferenceSlice.chessTheme} />
            </form>
        </main>
    );
}

function BinarySection(): React.ReactElement {
    const Dispatch = useDispatch();
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    const [showHintMovements, setShowHintMovements] = useState(PreferenceSlice.binaries.showHintMovements);
    const [alterPieceColours, setAlterPieceColours] = useState(PreferenceSlice.binaries.alterPieceColours);
    const [showPlayedMovements, setShowPlayedMovements] = useState(PreferenceSlice.binaries.showPlayedMovements);

    useEffect(() => {
        Dispatch(SetBinaries({
            showHintMovements,
            alterPieceColours,
            showPlayedMovements: showPlayedMovements || showHintMovements,
        }));
    }, [showHintMovements, showPlayedMovements, alterPieceColours]);

    return (
        <section id="binary-section">
            <h1>Binaries</h1>

            <div>
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
            </div>
        </section>
    );
}

function HandlerSection(): React.ReactElement {
    const Dispatch = useDispatch();
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    const [theme, setTheme] = useState<Theme>(PreferenceSlice.handlers.theme);

    useEffect(() => {
        Dispatch(SetHandlers({ theme }));
    }, [theme]);

    return (
        <section id="handler-section">
            <h1>Handlers</h1>

            <div>
                <RadioGroup
                    heading={{ text: "Theme", type: "h2" }}
                    id="theme"
                    entries={Object.values(Theme).map(theme => ({
                        value: theme,
                        text: theme.toTitleCase(),
                    }))}
                    checkedValue={theme}
                    setCheckedValue={value => setTheme(value)}
                />
            </div>
        </section>
    );
}