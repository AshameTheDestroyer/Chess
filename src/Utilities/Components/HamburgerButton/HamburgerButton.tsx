import React from "react";

import "./HamburgerButton.scss";

type HamburgerButtonProps = {
    isActive: boolean;

    setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HamburgerButton(props: HamburgerButtonProps): React.ReactElement {
    return (
        <button className={[
            "hamburger-button",
            props.isActive && "active",
        ].toClassName()}

            onClick={_ => props.setIsActive(previousValue => !previousValue)}
        >
            <div></div>
            <div></div>
            <div></div>
        </button>
    );
}