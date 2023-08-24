import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { Store } from "./Store/Store";
import "./Utilities/Extensions/ToClassName";
import "./Utilities/Extensions/ChooseRandomly";
import Header from "./Components/Header/Header";
import HomePage from "./Pages/HomePage/HomePage";
import GameboardPage from "./Pages/GameboardPage/GameboardPage";
import PreferencePage from "./Pages/PreferencePage/PreferencePage";
import NotFound404Page from "./Pages/NotFound404Page/NotFound404Page";

import "./index.scss";

const
    // ROOT: HTMLElement = document.querySelector(":root")!,
    ROOT_DIV_ELEMENT: HTMLElement | null = document.querySelector("#root");

ReactDOM.createRoot(ROOT_DIV_ELEMENT ?? document.body).render(<Index />);

function Index(): React.ReactElement {
    useEffect(() => {
        document.body.oncontextmenu = _e => false;
    }, []);

    return (
        <HashRouter>
            <Header />
            <Provider store={Store}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/Gameboard" element={<GameboardPage />} />
                    <Route path="/Preference" element={<PreferencePage />} />
                    <Route path="/*" element={<NotFound404Page />} />
                </Routes>
            </Provider>
        </HashRouter>
    );
}