import React, { useEffect } from "react";
import { createPortal } from "react-dom";

import Coordinates from "../../Types/Coordinates";
import EitherOrNeither from "../../Types/EitherOrNeither";
import AudioManager from "../../Managers/AudioManager/AudioManager";
import ComponentProps, { ChildlessComponentProps, ComponentEventProps } from "../../Types/ComponentProps";

import "./Modal.scss";

import notification_audio from "../../../assets/Audios/notification.mp3";

type FormMethods = "GET" | "POST" | "UPDATE" | "DELETE";

export type ModalComponentProps = {
    isOpen: boolean;

    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ModalProps = {
    doesntPlayAudio?: boolean;
    preventOutsideClosing?: boolean;
    backgroundProps?: ChildlessComponentProps;
    backgroundIsAbsolutelyPositioned?: boolean;
} & EitherOrNeither<{ isForm: false }, {
    isForm: true;
    action?: string;
    method: FormMethods;

    events?: ComponentEventProps<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>;
}> & EitherOrNeither<{ isPopup: false }, {
    isPopup: true;
    coordinates?: Coordinates;
}> & ModalComponentProps & ComponentProps;

const MODAL_CONTAINER: HTMLElement | null = document.querySelector("#modal-container");

export default function Modal(props: ModalProps): React.ReactElement {
    const INNER_ELEMENT_PROPS = {
        id: props.id,
        className: [
            "modal",
            (props.isPopup) && "pop-up-modal",
            props.className,
        ].toClassName(),
        children: props.children,

        style: null,
    };

    if (props.coordinates != null) {
        INNER_ELEMENT_PROPS.style = {
            left: (props.coordinates.x <= window.innerWidth * 3 / 4) ? `${props.coordinates.x}px` : "auto",
            top: (props.coordinates.y <= window.innerHeight * 3 / 4) ? `${props.coordinates.y}px` : "auto",
            right: (props.coordinates.x > window.innerWidth * 3 / 4) ? `${window.innerWidth - props.coordinates.x}px` : "auto",
            bottom: (props.coordinates.y > window.innerHeight * 3 / 4) ? `${window.innerHeight - props.coordinates.y}px` : "auto",
        }
    }

    useEffect(() => {
        if (!props.isOpen || props.doesntPlayAudio) { return; }

        AudioManager.Play(notification_audio);
    }, [props.isOpen]);

    function OnOutsideClick(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (!props.preventOutsideClosing && e.currentTarget == e.target) { props.setIsOpen(false); }
    }

    function OnOutsideKeydown(e: React.KeyboardEvent<HTMLElement>): void {
        if (e.key == "Escape") { props.setIsOpen(false); }
    }

    const OUTPUT: React.ReactElement = (
        <>
            <section
                id={props.backgroundProps?.id}
                className={[
                    "modal-background",
                    props.backgroundProps?.className,

                    (props.isPopup) && "pop-up-modal-background",
                ].toClassName()}

                style={{
                    position: (props.backgroundIsAbsolutelyPositioned) ? "absolute" : null,
                }}

                onClick={OnOutsideClick}
                onKeyDown={OnOutsideKeydown}
            />
            {
                (props.isForm) ?
                    <form {...INNER_ELEMENT_PROPS} method={props.method} action={props.action} {...props.events} /> :
                    <article {...INNER_ELEMENT_PROPS} />
            }
        </>
    );

    return (!props.isOpen) ? null :
        (props.isPopup && props.coordinates == null) ? OUTPUT :
            createPortal(OUTPUT, MODAL_CONTAINER ?? document.body);
}