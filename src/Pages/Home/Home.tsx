import React from "react";

import useContextMenu from "../../Utilities/Hooks/useContextMenu";
import ContextMenu from "../../Components/ContextMenu/ContextMenu";

import "./Home.scss";

import chess_icon from "../../assets/Icons/chess.svg";

export default function Home(): React.ReactElement {
    const [
        isContextMenuOpen,
        contextMenuCoordinates,
        _contextMenuClickedElement,
        setIsContextMenuOpen,
        _setContextMenuCoordinates,
        _setContextMenuClickedElement,
    ] = useContextMenu();

    return (
        <main id="home-page">
            <h1>Home</h1>
            <ContextMenu
                isOpen={isContextMenuOpen}
                {...contextMenuCoordinates}
                groups={[{
                    options: [{
                        name: "Play",
                        iconURL: chess_icon,
                        keyShortcut: "Ctrl+P",
                        onClick: _e => { console.log("Let's Play!"); },
                    }, {
                        name: "WTF",
                        opensTab: "wtf-tab",
                    }],
                }, {
                    options: [{
                        name: "Call API",
                        onClick: _e => { console.log("API's Called."); },
                    }, {
                        name: "Post to API",
                        keyShortcut: "Ctrl+Shift+X",
                        onClick: _e => { console.log("API's Been Posted To.") },
                    }, {
                        name: "Nothing",
                        opensTab: "nothing-tab",
                    }],
                }, {
                    tabName: "wtf-tab",
                    options: [{
                        name: "WTF",
                        onClick: _e => { console.log("WTFFFFFF.") },
                    }],
                }]}

                setIsOpen={setIsContextMenuOpen}
            />
        </main>
    );
}