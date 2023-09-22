import React from "react";

import RadioButton from "../RadioButton/RadioButton";
import { ChildlessComponentProps } from "../../Types/ComponentProps";
import { RadioButtonValueType, SelectionButtonProps } from "../SelectionButton/SelectionButton";

import "./RadioGroup.scss";
import EitherOrNeither from "../../Types/EitherOrNeither";

export type HeadingType = string | {
    text: string;
    type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

type RadioGroupProps<T extends RadioButtonValueType> = {
    checkedValue: T;
    buttonIds?: string;
    heading: HeadingType;
    entries: Array<Pick<SelectionButtonProps<T>, "name" | "text"> & Required<Pick<SelectionButtonProps<T>, "value">>>;

    setCheckedValue: React.Dispatch<React.SetStateAction<T>>;
} & EitherOrNeither<{
    disabledIndices: Array<number>;
}, {
    allDisabled: boolean;
}> & ChildlessComponentProps;

export default function RadioGroup<T extends RadioButtonValueType>(props: RadioGroupProps<T>): React.ReactElement {
    return (
        <section
            id={props.id}
            className={[
                "radio-group",

                props.className,
            ].toClassName()}
        >
            {
                (typeof props.heading == "string") ?
                    <h4>{props.heading}</h4> :
                    React.createElement(props.heading.type, {}, props.heading.text)
            }
            <div> {
                props.entries.map((entry, i) =>
                    <RadioButton
                        key={i}
                        id={`${(props.buttonIds != null) ? `${props.buttonIds}-` : ""}${entry.name ?? entry.value}`}

                        {...entry}
                        isChecked={entry.value == props.checkedValue}
                        isDisabled={props.disabledIndices?.includes(i) || props.allDisabled}

                        setIsChecked={_previousValue => props.setCheckedValue(entry.value)}
                    />)
            } </div>
        </section>
    );
}