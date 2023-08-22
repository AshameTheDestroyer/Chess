import { configureStore } from "@reduxjs/toolkit";

import { MainSliceReducer } from "./Features/MainSlice/MainSlice";
import { GameboardSliceReducer } from "./Features/GameboardSlice/GameboardSlice";
import { PreferenceSliceReducer } from "./Features/PreferenceSlice/PreferenceSlice";

export const Store = configureStore({
    reducer: {
        main: MainSliceReducer,
        gameboard: GameboardSliceReducer,
        preference: PreferenceSliceReducer,
    },
});