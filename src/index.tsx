import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Home from "./Pages/Home/Home";
import { Store } from "./Store/Store";
import "./Utilities/Extensions/ToClassName";
import Header from "./Components/Header/Header";
import Gameboard from "./Pages/Gameboard/Gameboard";

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
        <HashRouter basename={window.location.pathname || ""}>
            <Header />
            <Provider store={Store}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Gameboard" element={<Gameboard />} />
                </Routes>
            </Provider>
        </HashRouter>
    );
}