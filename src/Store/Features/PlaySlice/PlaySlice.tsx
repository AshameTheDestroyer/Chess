import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { PieceColour } from "../../../Types/Piece";
import RepetitionCounterValues from "./RepetitionCounterValues";
import FiftyRuleMovementCounterValues from "./FiftyRuleMovementCounterValues";

export type PlayBinaries = {
};

export type PlayHandlers = {
    firstPlayer: PieceColour;
    repetitionCounterValue: RepetitionCounterValues;
    fiftyRuleMovementCounterValue: FiftyRuleMovementCounterValues;
};

export type PlaySliceType = {
    binaries: PlayBinaries;
    handlers: PlayHandlers;
};

const INITIAL_STATE: PlaySliceType = {
    binaries: {
    },
    handlers: {
        repetitionCounterValue: 3,
        firstPlayer: PieceColour.white,
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
