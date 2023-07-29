import React from "react";
import { Link } from "react-router-dom";

import { ChildlessComponentProps } from "../../Utilities/Types/ComponentProps";

import "./NavigationBar.scss";

type NavigationBarProps = ChildlessComponentProps & {
    isOpen: boolean;
    anchors: Array<string>;
};

export default function NavigationBar(props: NavigationBarProps): React.ReactElement {
    return (
        <nav
            id={props.id}
            className={[
                "navigation-bar",
                props.className,

                props.isOpen && "open",
            ].toClassName()}
        >
            {
                props.anchors.map((anchor, i) =>
                    <Link key={i} to={`/${anchor}`}>{anchor}</Link>
                )
            }
        </nav>
    );
}