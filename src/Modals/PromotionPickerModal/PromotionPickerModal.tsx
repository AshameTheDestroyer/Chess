import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Cell from "../../Types/Cell";
import { IsPiecePromotableTo, Piece } from "../../Types/Piece";
import { SetPiece } from "../../Store/Features/GameboardSlice/GameboardSlice";
import Modal, { ModalComponentProps } from "../../Utilities/Components/Modal/Modal";
import { SelectPreferenceSlice } from "../../Store/Features/PreferenceSlice/PreferenceSlice";

import "./PromotionPickerModal.scss";

import PIECE_IMAGES from "../../Constants/PieceImages";

type PromotionPickerModalProps = {
    readyToPromoteCell: Cell;
} & ModalComponentProps;

export default function PromotionPickerModal(props: PromotionPickerModalProps): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);
    const Dispatch = useDispatch();

    function OnButtonClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        const pieceName: string = (e.currentTarget as HTMLButtonElement).dataset["piece"];

        Dispatch(SetPiece({
            isPromoting: true,
            x: props.readyToPromoteCell.x,
            y: props.readyToPromoteCell.y,
            colouredPiece: {
                piece: (Piece[pieceName] as Piece),
                colour: props.readyToPromoteCell.colouredPiece.colour,
            },
        }));

        props.setIsOpen(false);
    }

    return (
        <Modal
            id="promotion-picker-modal"
            backgroundProps={{ id: "promotion-picker-modal-background" }}
            className={[
                (PreferenceSlice.options.alterPieceColours) && "alter-piece-colours",
            ].toClassName()}

            isPopup
            preventOutsideClosing

            {...props}
        >
            {
                Object.values(Piece)
                    .filter(piece => IsPiecePromotableTo(piece))
                    .map((piece, i) =>
                        <button
                            key={i}

                            data-piece={piece}

                            onClick={OnButtonClick}
                        >
                            {
                                (props.readyToPromoteCell?.colouredPiece != null) &&
                                PIECE_IMAGES[`${props.readyToPromoteCell.colouredPiece.colour}_${piece}`]({
                                    className: [
                                        "piece",
                                        `piece-${props.readyToPromoteCell.colouredPiece.colour}`,
                                    ].toClassName(),
                                })
                            }
                        </button>
                    )
            }
        </Modal>
    );
}