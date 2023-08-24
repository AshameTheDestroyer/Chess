import React from "react";

import "./ToggleButton.scss";
import { ChildlessComponentProps } from "../../Types/ComponentProps";

type ToggleButtonProps = {
    name?: string;
    text?: string;
    isChecked: boolean;
    isDisabled?: boolean;

    setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
} & ChildlessComponentProps & Required<Pick<ChildlessComponentProps, "id">>;

export default function ToggleButton(props: ToggleButtonProps): React.ReactElement {
    return (
        <div
            id={`${props.id}-toggle-button`}
            className={[
                "toggle-button",
                props.isChecked && "toggle-button-checked",

                props.className,
            ].toClassName()}
        >
            <input
                id={`${props.id}-field`}

                type="checkbox"
                checked={props.isChecked}
                disabled={props.isDisabled}
                name={props.name ?? props.id}

                onChange={e => (console.log(e.currentTarget.value), props.setIsChecked(previousValue => !previousValue))}
            />

            <button
                role="checkbox"
                disabled={props.isDisabled}

                onClick={_e => props.setIsChecked(previousValue => !previousValue)}
            >
                <div />
            </button>

            {(props.text != null) && <label htmlFor={`${props.id}-field`}>{props.text}</label>}
        </div>
    );
}