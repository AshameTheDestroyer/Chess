import React from "react";

import "./SelectionButton.scss";
import { ChildlessComponentProps } from "../../Types/ComponentProps";

export type SelectionButtonType = "toggle-button" | "radio-button";
export type RadioButtonValueType = string | number | readonly string[];

export type SelectionButtonProps<T extends RadioButtonValueType> = {
    value?: T;
    name?: string;
    text?: string;
    isChecked: boolean;
    isDisabled?: boolean;
    type: SelectionButtonType;

    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
} & ChildlessComponentProps & Required<Pick<ChildlessComponentProps, "id">>;

export default function SelectionButton<T extends RadioButtonValueType>(props: SelectionButtonProps<T>): React.ReactElement {
    return (
        <div
            id={`${props.id}-${props.type}`}
            className={[
                "selection-button",

                `${props.type}`,
                props.isChecked && `${props.type}-checked`,
                props.isChecked && `selection-button-checked`,

                props.className,
            ].toClassName()}
        >
            <input
                id={`${props.id}-field`}

                value={props.value}
                checked={props.isChecked}
                disabled={props.isDisabled}
                name={props.name ?? props.id}
                type={(props.type == "toggle-button") ? "checkbox" : "radio"}

                onChange={props.onChange}
            />

            <button
                className={[
                    props.isChecked && `button-checked`,
                ].toClassName()}

                role={(props.type == "toggle-button") ? "checkbox" : "radio"}
                disabled={props.isDisabled}

                onClick={props.onClick}
            >
                <span />
            </button>

            {(props.text != null) && <label htmlFor={`${props.id}-field`}>{props.text}</label>}
        </div>
    );
}