import React from "react";
import { useSelector } from "react-redux";

import useGeneratePieceImages from "../../Hooks/useGeneratePieceImages";
import CustomButton from "../../Utilities/Components/CustomButton/CustomButton";
import { SelectPreferenceSlice } from "../../Store/Features/PreferenceSlice/PreferenceSlice";
import CustomButtonDisplayer from "../../Utilities/Components/CustomButtonDisplayer/CustomButtonDisplayer";

import "./HomePage.scss";

import PIECE_IMAGES from "../GameboardPage/PieceImages";

export default function HomePage(): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    const [displayedPieceImages, _setDisplayedPieceImages] = useGeneratePieceImages({
        shuffle: true,
        alternateColours: true,
        displayedPieceCount: 4,
    });

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

                <div
                    id="piece-image-displayer"
                    className={[
                        (PreferenceSlice.options.alterPieceColours) && "alter-piece-colours",
                    ].toClassName()}
                >
                    <figure> {
                        displayedPieceImages.map((displayedPieceImage, i) =>
                            (PIECE_IMAGES[displayedPieceImage] as React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>)({
                                key: i,

                                className: [
                                    "piece",
                                    `piece-${displayedPieceImage.split("_")[0]}`,
                                ].toClassName(),

                                style: {
                                    "--dark-colour": PreferenceSlice.chessTheme.darkColour,
                                    "--light-colour": PreferenceSlice.chessTheme.lightColour,
                                    "--board-colour": PreferenceSlice.chessTheme.boardColour,
                                } as React.CSSProperties,
                            })
                        )
                    } </figure>

                    <CustomButtonDisplayer>
                        <CustomButton
                            link="/Learn"

                            children="Learn More"
                        />

                        <CustomButton
                            isArrowed
                            isEmphasized
                            link="/Play"
                            iconPlace="right"

                            children="Play Now"
                        />
                    </CustomButtonDisplayer>
                </div>
            </section>
        </main>
    );
}