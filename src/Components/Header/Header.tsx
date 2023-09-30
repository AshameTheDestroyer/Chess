import React, { useState } from "react";
import { Link } from "react-router-dom";

import NavigationBar from "../../Utilities/Components/NavigationBar/NavigationBar";
import HamburgerButton from "../../Utilities/Components/HamburgerButton/HamburgerButton";

import "./Header.scss";

import chess_icon from "../../assets/Icons/chess.svg";

export default function Header(): React.ReactElement {
    const [isNavigationBarOpen, setIsNavigationBarOpen] = useState(false);

    return (
        <header id="main-header">
            <Logo />

            <NavigationBar
                isOpen={isNavigationBarOpen}
                anchors={[
                    "Play",
                    "Puzzles",
                    "Learn",
                    "Preference",
                ]}

                setIsOpen={setIsNavigationBarOpen}
            />

            <HamburgerButton
                isActive={isNavigationBarOpen}

                setIsActive={setIsNavigationBarOpen}
            />
        </header>
    );
}

function Logo(): React.ReactElement {
    return (
        <Link to="./" id="logo">
            <img src={chess_icon} alt="chess_icon" />
            <h1>Chess</h1>
        </Link>
    );
}