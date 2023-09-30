import { configureStore } from "@reduxjs/toolkit";

import { PlaySliceReducer } from "./Features/PlaySlice/PlaySlice";
import { GameboardSliceReducer } from "./Features/GameboardSlice/GameboardSlice";
import { PreferenceSliceReducer } from "./Features/PreferenceSlice/PreferenceSlice";

export const Store = configureStore({
    reducer: {
        play: PlaySliceReducer,
        gameboard: GameboardSliceReducer,
        preference: PreferenceSliceReducer,
    },
});