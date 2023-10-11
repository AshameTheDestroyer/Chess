import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import ChessTheme from "../../../Types/ChessTheme";
import Theme from "../../../Utilities/Types/Theme";
import CHESS_THEMES from "../../../Constants/ChessThemes";
import GetCurrentTheme from "../../../Utilities/Functions/GetCurrentTheme";
import { GetFromLocalStorage, SetInLocalStorage } from "../../../Utilities/Functions/HandleLocalStorage";

export type PreferenceBinaries = {
    showHintMovements: boolean;
    alterPieceColours: boolean;
    showPlayedMovements: boolean;
};

export type PreferenceHandlers = {
    theme: Theme;
};

type PreferenceSliceType = {
    chessTheme: ChessTheme;
    binaries: PreferenceBinaries;
    handlers: PreferenceHandlers;
};

const INITIAL_STATE: PreferenceSliceType = {
    chessTheme: GetFromLocalStorage("preference-chess-theme") ?? CHESS_THEMES[0],
    binaries: GetFromLocalStorage("preference-binaries") ?? {
        showHintMovements: true,
        alterPieceColours: false,
        showPlayedMovements: true,
    },
    handlers: GetFromLocalStorage("preference-handlers") ?? {
        theme: GetCurrentTheme(),
    },
};

export const PreferenceSlice = createSlice({
    name: "preference",
    initialState: INITIAL_STATE,

    reducers: {
        SetChessTheme: (state: PreferenceSliceType, action: PayloadAction<ChessTheme>): void => {
            state.chessTheme = action.payload;
            SetInLocalStorage("preference-chess-theme", action.payload);
        },

        SetBinaries: (state: PreferenceSliceType, action: PayloadAction<PreferenceBinaries>): void => {
            state.binaries = action.payload;
            SetInLocalStorage("preference-binaries", action.payload);
        },

        SetHandlers: (state: PreferenceSliceType, action: PayloadAction<PreferenceHandlers>): void => {
            state.handlers = action.payload;
            SetInLocalStorage("preference-handlers", action.payload);
        },
    },
});

// @ts-ignore
export const SelectPreferenceSlice = (state: typeof Store): PreferenceSliceType => state.preference;

export const PreferenceSliceReducer = PreferenceSlice.reducer;

export const {
    SetBinaries,
    SetHandlers,
    SetChessTheme,
} = PreferenceSlice.actions;