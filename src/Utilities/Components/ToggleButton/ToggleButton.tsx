import React from "react";

import SelectionButton, { SelectionButtonProps } from "../SelectionButton/SelectionButton";

import "./ToggleButton.scss";

type ToggleButtonProps = Omit<SelectionButtonProps<any>, "type" | "value" | "onClick" | "onChange">;

export default function ToggleButton(props: ToggleButtonProps): React.ReactElement {
    return (
        <SelectionButton
            {...props}

            type="toggle-button"

            onClick={_e => props.setIsChecked(previousValue => !previousValue)}
            onChange={_e => props.setIsChecked(previousValue => !previousValue)}
        />
    );
}