import React, { useEffect, useState } from "react";

import useContextMenu from "../../Utilities/Hooks/useContextMenu";
import CustomButton from "../../Components/CustomButton/CustomButton";
import CustomButtonDisplayer from "../../Components/CustomButtonDisplayer/CustomButtonDisplayer";
import ContextMenu, { ContextMenuGroupWithSelector } from "../../Components/ContextMenu/ContextMenu";

import "./Home.scss";

import PIECE_IMAGES from "../Gameboard/PieceImages";

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

    const groups: Array<ContextMenuGroupWithSelector> = [{
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
    }];

    const [displayedPieceImages, setDisplayedPieceImages] = useState<Array<string>>([]);

    const
        DISPLAYED_PIECE_COUNT: number = 4,
        PIECE_IMAGE_NAMES: Array<string> = Object.keys(PIECE_IMAGES);

    useEffect(() => {
        setDisplayedPieceImages(new Array(DISPLAYED_PIECE_COUNT)
            .fill(null).map(_item => PIECE_IMAGE_NAMES[~~(Math.random() * PIECE_IMAGE_NAMES.length)]));
    }, []);

    return (
        <main id="home-page">
            <section>
                <div>
                    <h1 className="big-header">Now Play With Passion</h1>
                    <h1>What're you waiting for? Go ahead and start playing now!</h1>
                    <p>
                        This website's still under development, and I'm willing to make
                        a <q>Chess AI</q> outta it, but that'd be, unfortunately,
                        for future potential work.
                    </p>
                </div>

                <div id="piece-image-displayer">
                    <figure> {
                        displayedPieceImages.map((_item, i) =>
                            <img key={i} src={PIECE_IMAGES[displayedPieceImages[i]]} alt={`${displayedPieceImages[i]}_icon`} />)
                    } </figure>

                    <CustomButtonDisplayer>
                        <CustomButton isArrowed iconPlace="left">Learn More</CustomButton>
                        <CustomButton isEmphasized link="/Gameboard">Play Now</CustomButton>
                    </CustomButtonDisplayer>
                </div>
            </section>

            <ContextMenu
                groups={groups}
                isOpen={isContextMenuOpen}
                {...contextMenuCoordinates}

                setIsOpen={setIsContextMenuOpen}
            />
        </main>
    );
}