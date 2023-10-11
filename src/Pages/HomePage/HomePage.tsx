import React from "react";

import LazyImage from "../../Utilities/Components/LazyImage/LazyImage";
import CustomButton from "../../Utilities/Components/CustomButton/CustomButton";
import CustomButtonDisplayer from "../../Utilities/Components/CustomButtonDisplayer/CustomButtonDisplayer";

import "./HomePage.scss";

import chess_wallpaper from "../../assets/Images/chess_wallpaper.jpg";
import chess_wallpaper_pixelated from "../../assets/Images/chess_wallpaper_pixelated.jpg";

export default function HomePage(): React.ReactElement {
    return (
        <main id="home-page">
            <LazyImage
                id="chess-wallpaper"
                originalImageSource={chess_wallpaper}
                pixelatedImageSource={chess_wallpaper_pixelated}
                alternativeText="A picture featuring a chessboard with chess pieces on it."
            />

            <section>
                <h1 className="big-header">Now Play With Passion</h1>
                <h1>What're you waiting for? Go ahead and start playing now!</h1>
                <p>
                    This website's still under development, and I'm willing to make
                    a <mark>Chess AI</mark> outta it, but that'd be, unfortunately,
                    for future potential work.
                </p>

                <CustomButtonDisplayer>
                    <CustomButton
                        link="/Learn"
                        text="Learn More"
                    />

                    <CustomButton
                        isArrowed
                        link="/Play"
                        isEmphasized
                        text="Play Now"
                        iconPlace="right"
                    />
                </CustomButtonDisplayer>
            </section>
        </main>
    );
}