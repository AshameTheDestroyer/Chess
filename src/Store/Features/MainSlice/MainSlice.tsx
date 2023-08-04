import { createSlice } from "@reduxjs/toolkit";

type MainSliceType = {

};

const INITIAL_STATE: MainSliceType = {

};

export const MainSlice = createSlice({
    name: "main",
    initialState: INITIAL_STATE,

    reducers: {
        SetHeaderHeight: (state: MainSliceType) => {
            return {
                ...state,
            };
        },
    },
});

export const SelectMainSlice = (state: MainSliceType) => state;

export const MainSliceReducer = MainSlice.reducer;

export const { SetHeaderHeight } = MainSlice.actions;