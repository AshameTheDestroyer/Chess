import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Store } from "../../Store";
import ChessTheme, { CHESS_THEMES } from "../../../Types/ChessTheme";
import { GetFromLocalStorage, SetInLocalStorage } from "../../../Utilities/Functions/HandleLocalStorage";

type PreferenceSliceType = {
    chessTheme: ChessTheme;
};

const INITIAL_STATE: PreferenceSliceType = {
    chessTheme: GetFromLocalStorage("preference-chess-theme") ?? CHESS_THEMES[0],
};

export const PreferenceSlice = createSlice({
    name: "preference",
    initialState: INITIAL_STATE,

    reducers: {
        SetChessTheme: (state: PreferenceSliceType, action: PayloadAction<ChessTheme>): void => {
            state.chessTheme = action.payload;
            SetInLocalStorage("preference-chess-theme", action.payload);
        },
    },
});

// @ts-ignore
export const SelectPreferenceSlice = (state: typeof Store): PreferenceSliceType => state.preference;

export const PreferenceSliceReducer = PreferenceSlice.reducer;

export const {
    SetChessTheme,
} = PreferenceSlice.actions;