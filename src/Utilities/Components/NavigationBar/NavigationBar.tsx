import React from "react";
import { Link, useLocation } from "react-router-dom";

import { ChildlessComponentProps } from "../../Types/ComponentProps";

import "./NavigationBar.scss";

type Anchor = [string, string];

type NavigationBarProps = ChildlessComponentProps & {
    isOpen: boolean;
    anchors: Array<string | Anchor>;

    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavigationBar(props: NavigationBarProps): React.ReactElement {
    const Location = useLocation();

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
                    <Link
                        key={i}
                        className={[
                            (Location.pathname.split("/")[1]
                                == ((typeof anchor == "string") ? anchor : anchor[0])) && "selected",
                        ].toClassName()}

                        to={(typeof anchor == "string") ? `/${anchor}` : `/${anchor[1]}`}

                        onClick={_e => props.setIsOpen(false)}

                        children={(typeof anchor == "string") ? anchor : anchor[0]}
                    />
                )
            }
        </nav>
    );
}