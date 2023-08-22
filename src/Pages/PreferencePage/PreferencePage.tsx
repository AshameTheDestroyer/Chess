import React from "react";

import ChessThemePickerDisplayer from "../../Components/ChessThemePickerDisplayer/ChessThemePickerDisplayer";

import "./PreferencePage.scss";

export default function PreferencePage(): React.ReactElement {
    return (
        <main id="preferences-page">
            <ChessThemePickerDisplayer />
        </main>
    );
}