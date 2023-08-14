import React from "react";

import Either from "../../Types/Either";
import ComponentProps from "../../Types/ComponentProps";

import "./CustomButtonDisplayer.scss";

type CustomButtonDisplayerProps = {

} & Either<{
    displayType?: "flex";
    flexDirection?: "row" | "column";
}, {
    displayType: "grid";
    columnCount: number;
}> & ComponentProps;

export default function CustomButtonDisplayer(props: CustomButtonDisplayerProps): React.ReactElement {
    return (
        <div
            id={props.id}
            className={[
                "custom-button-displayer",
                props.className,
            ].toClassName()}

            style={{
                display: props.displayType ?? "flex",
                flexDirection: props.flexDirection ?? "row",
                gridTemplateColumns: `repeat(${Math.max(props.columnCount, 1)}, 1fr)`,
            }}
        >
            {props.children}
        </div>
    );
}