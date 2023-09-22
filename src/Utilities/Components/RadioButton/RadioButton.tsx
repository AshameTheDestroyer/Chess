import React from "react";

import SelectionButton, { RadioButtonValueType, SelectionButtonProps } from "../SelectionButton/SelectionButton";

import "./RadioButton.scss";

type RadioButtonProps<T extends RadioButtonValueType> =
    Omit<SelectionButtonProps<T>, "type" | "onClick" | "onChange"> &
    Required<Pick<SelectionButtonProps<T>, "value">>;

export default function RadioButton<T extends RadioButtonValueType>(props: RadioButtonProps<T>): React.ReactElement {
    return (
        <SelectionButton
            {...props} type="radio-button"

            onClick={_e => props.setIsChecked(_previousValue => true)}
            onChange={_e => props.setIsChecked(_previousValue => true)}
        />
    );
}