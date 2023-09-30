import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import ChessTheme from "../../../Types/ChessTheme";
import CHESS_THEMES from "../../../Constants/ChessThemes";
import { GetFromLocalStorage, SetInLocalStorage } from "../../../Utilities/Functions/HandleLocalStorage";

type PreferenceSliceType = {
    chessTheme: ChessTheme;
    options: PreferenceOptions;
};

export type PreferenceOptions = {
    showHintMovements: boolean;
    alterPieceColours: boolean;
    showPlayedMovements: boolean;
};

const INITIAL_STATE: PreferenceSliceType = {
    chessTheme: GetFromLocalStorage("preference-chess-theme") ?? CHESS_THEMES[0],
    options: GetFromLocalStorage("preference-options") ?? {
        showHintMovements: true,
        alterPieceColours: false,
        showPlayedMovements: true,
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

        SetOptions: (state: PreferenceSliceType, action: PayloadAction<PreferenceOptions>): void => {
            state.options = action.payload;
            SetInLocalStorage("preference-options", action.payload);
        },
    },
});

// @ts-ignore
export const SelectPreferenceSlice = (state: typeof Store): PreferenceSliceType => state.preference;

export const PreferenceSliceReducer = PreferenceSlice.reducer;

export const {
    SetOptions,
    SetChessTheme,
} = PreferenceSlice.actions;