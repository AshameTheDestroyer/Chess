import { configureStore } from "@reduxjs/toolkit";

import { GameboardSliceReducer } from "./Features/GameboardSlice/GameboardSlice";
import { PreferenceSliceReducer } from "./Features/PreferenceSlice/PreferenceSlice";

export const Store = configureStore({
    reducer: {
        gameboard: GameboardSliceReducer,
        preference: PreferenceSliceReducer,
    },
});