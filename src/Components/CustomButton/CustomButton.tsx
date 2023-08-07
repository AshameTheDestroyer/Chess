import React, { useRef } from "react";

import EitherOrNeither from "../../Utilities/Types/EitherOrNeither";
import ComponentProps, { ComponentEventProps } from "../../Utilities/Types/ComponentProps";

import "./CustomButton.scss";
import { Link } from "react-router-dom";

export type IconPlace = "left" | "right";

type CustomButtonProps = {
    link?: string;
    role?: React.AriaRole;
    isEmphasized?: boolean;

    events?: ComponentEventProps<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>;
} & EitherOrNeither<{
    iconURL: string;
    iconPlace: IconPlace;
}, {
    isArrowed: boolean;
    iconPlace: IconPlace;
}> & ComponentProps;

export default function CustomButton(props: CustomButtonProps): React.ReactElement {
    const customButtonElementRef = useRef<HTMLButtonElement>();

    function OnClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        props.events?.onClick?.(e);

        if (props.link == null) { return; }

        const anchorElement: HTMLAnchorElement = customButtonElementRef.current?.querySelector("a");
        anchorElement.click();
    }

    return (
        <button
            id={props.id}
            className={[
                "custom-button",
                props.isArrowed && "custom-button-arrowed",
                props.isEmphasized && "custom-button-emphasized",
                props.iconURL != null && "custom-button-iconified",

                props.className,
            ].toClassName()}
            ref={customButtonElementRef}

            role={props.role ?? "button"}
            data-icon-place={props.iconPlace}

            {...props.events}
            onClick={OnClick}

            style={{
                "--icon-url": props.iconURL != null ? `url("${props.iconURL}")` : undefined,
            } as React.CSSProperties}
        >
            {
                props.link == null ? props.children :
                    <Link to={props.link}>{props.children}</Link>
            }
        </button>
    );
}