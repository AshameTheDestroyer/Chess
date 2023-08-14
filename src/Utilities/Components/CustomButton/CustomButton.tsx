import React from "react";
import { Link } from "react-router-dom";

import EitherOrNeither from "../../Types/EitherOrNeither";
import ComponentProps, { ComponentEventProps } from "../../Types/ComponentProps";

import "./CustomButton.scss";

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
    function OnClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        props.events?.onClick?.(e);

        if (props.link == null) { return; }

        const anchorElement: HTMLAnchorElement = e.currentTarget.querySelector("a");
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