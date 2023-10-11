import React from "react";

import Either from "../../Types/Either";
import ComponentProps from "../../Types/ComponentProps";

import "./CustomButtonDisplayer.scss";

type CustomButtonDisplayerProps = {

} & Either<{
    display?: "flex";
    flexDirection?: "row" | "column";
}, {
    display: "grid";
    columnCount?: number;
}> & ComponentProps;

export default function CustomButtonDisplayer(props: CustomButtonDisplayerProps): React.ReactElement {
    const CHILDREN_COUNT: number = props.children.toString().split(",").length;

    return (
        <div
            id={props.id}
            className={[
                "custom-button-displayer",
                props.className,
            ].toClassName()}

            data-display={props.display ?? "flex"}
            data-flex-direction={props.flexDirection ?? "row"}

            style={{
                gridTemplateColumns: `repeat(${Math.min(Math.max(1, props.columnCount ?? CHILDREN_COUNT), CHILDREN_COUNT)}, 1fr)`,
            }}

            children={props.children}
        />
    );
}