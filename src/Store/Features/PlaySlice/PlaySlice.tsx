import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import RepetitionCounterValues from "./RepetitionCounterValues";
import FiftyRuleMovementCounterValues from "./FiftyRuleMovementCounterValues";

export type PlayBinaries = {
    whitePlaysFirst: boolean;
};

export type PlayHandlers = {
    repetitionCounterValue: RepetitionCounterValues;
    fiftyRuleMovementCounterValue: FiftyRuleMovementCounterValues;
};

export type PlaySliceType = {
    binaries: PlayBinaries;
    handlers: PlayHandlers;
};

const INITIAL_STATE: PlaySliceType = {
    binaries: {
        whitePlaysFirst: true,
    },
    handlers: {
        repetitionCounterValue: 3,
        fiftyRuleMovementCounterValue: 50,
    },
};

export const PlaySlice = createSlice({
    name: "PlaySlice",
    initialState: INITIAL_STATE,

    reducers: {
        ResetPlayState: (state: PlaySliceType): void => {
            state.binaries = INITIAL_STATE.binaries;
            state.handlers = INITIAL_STATE.handlers;
        },

        SetBinaries: (state: PlaySliceType, action: PayloadAction<PlayBinaries>): void => {
            state.binaries = action.payload;
        },

        SetHandlers: (state: PlaySliceType, action: PayloadAction<PlayHandlers>): void => {
            state.handlers = action.payload;
        },
    },
});

// @ts-ignore
export const SelectPlaySlice = (state: typeof Store): PlaySliceType => state.play;

export const PlaySliceReducer = PlaySlice.reducer;

export const {
    SetBinaries,
    SetHandlers,
    ResetPlayState,
} = PlaySlice.actions;
