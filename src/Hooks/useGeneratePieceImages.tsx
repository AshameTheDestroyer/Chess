import { useEffect, useState } from "react";

import "../Utilities/Extensions/Shuffle";
import { Piece, PieceColour } from "../Types/Piece";

type useGeneratePieceImagesProps = {
    shuffle?: boolean;
    alternateColours?: boolean;
    displayedPieceCount: number;
};

function useGeneratePieceImages(props: useGeneratePieceImagesProps): Array<`${PieceColour}_${Piece}`> {
    const [displayedPieceImages, setDisplayedPieceImages] = useState<Array<`${PieceColour}_${Piece}`>>([]);

    const
        PIECES: Array<string> = Object.keys(Piece),
        PIECE_COLOURS: Array<string> = Object.keys(PieceColour);

    useEffect(() => {
        setDisplayedPieceImages((_previousValue) => {
            const ARRAY = new Array(props.displayedPieceCount).fill(null)
                .map((_item, i) =>
                    `${(props.alternateColours) ? PIECE_COLOURS[i % PIECE_COLOURS.length] : PIECE_COLOURS.chooseRandomly()}_` +
                    `${PIECES.chooseRandomly()}` as `${PieceColour}_${Piece}`
                );

            return (props.shuffle) ? ARRAY.shuffle() : ARRAY;
        });
    }, []);

    return displayedPieceImages;
}

export default useGeneratePieceImages;