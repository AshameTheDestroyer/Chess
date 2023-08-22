import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import ChessTheme, { CHESS_THEMES } from "../../Types/ChessTheme";
import useGeneratePieceImages from "../../Hooks/useGeneratePieceImages";
import CustomButton from "../../Utilities/Components/CustomButton/CustomButton";
import { SelectPreferenceSlice, SetChessTheme } from "../../Store/Features/PreferenceSlice/PreferenceSlice";

import "./ChessThemePickerDisplayer.scss";

import PIECE_IMAGES from "../../Pages/GameboardPage/PieceImages";

export default function ChessThemePickerDisplayer(): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);

    return (
        <section id="chess-theme-picker-section">
            <h1>Chess Theme</h1>

            <div id="chess-theme-picker-displayer"> {
                CHESS_THEMES.map((chessTheme, i) =>
                    <ChessThemePicker
                        key={i}

                        {...chessTheme}
                        isEquipped={chessTheme.name == PreferenceSlice.chessTheme.name}
                    />
                )
            } </div>
        </section>
    );
}

type ChessThemePickerProps = {
    isEquipped?: boolean;
} & ChessTheme;

function ChessThemePicker(props: ChessThemePickerProps): React.ReactElement {
    const Dispatch = useDispatch();

    const displayedPieceImages: Array<string> = useGeneratePieceImages({
        displayedPieceCount: 4,
        alternateColours: true,
    });

    useEffect(() => {
        [displayedPieceImages[0], displayedPieceImages[1]] = [displayedPieceImages[1], displayedPieceImages[0]];
    }, []);

    return (
        <div
            className={[
                "chess-theme-picker",

                props.isEquipped && "chess-theme-picker-equipped",
            ].toClassName()}

            style={{
                "--dark-colour": props.darkColour,
                "--light-colour": props.lightColour,
                "--board-colour": props.boardColour,
            } as React.CSSProperties}
        >
            <h3>{props.name}</h3>

            <figure> {
                displayedPieceImages.map((displayedPieceImage, i) =>
                    <div key={i} className="cell">
                        {
                            (PIECE_IMAGES[displayedPieceImage] as React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>)({
                                className: [
                                    "piece",
                                    `piece-${displayedPieceImage.split("_")[0]}`,
                                ].toClassName(),
                            })
                        }
                    </div>
                )
            } </figure>

            <CustomButton
                isPressed={props.isEquipped}
                isEmphasized={props.isEquipped}

                events={{ onClick: _e => Dispatch(SetChessTheme(props)) }}
            >
                {(props.isEquipped) ? "Equipped" : "Equip"}
            </CustomButton>
        </div>
    );
}