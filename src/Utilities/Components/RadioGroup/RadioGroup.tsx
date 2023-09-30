import React from "react";

import RadioButton from "../RadioButton/RadioButton";
import EitherOrNeither from "../../Types/EitherOrNeither";
import { ChildlessComponentProps } from "../../Types/ComponentProps";
import { RadioButtonValueType, SelectionButtonProps } from "../SelectionButton/SelectionButton";

import "./RadioGroup.scss";

export type HeadingType = string | {
    text: string;
    type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

type RadioGroupProps<T extends RadioButtonValueType> = {
    name?: string;
    checkedValue: T;
    heading: HeadingType;
    entries: Array<Pick<SelectionButtonProps<T>, "text"> & Required<Pick<SelectionButtonProps<T>, "value">>>;

    setCheckedValue: React.Dispatch<React.SetStateAction<T>>;
} & EitherOrNeither<{
    disabledIndices: Array<number>;
}, {
    allDisabled: boolean;
}> & ChildlessComponentProps;

export default function RadioGroup<T extends RadioButtonValueType>(props: RadioGroupProps<T>): React.ReactElement {
    return (
        <section
            id={`${props.id}-radio-group`}
            className={[
                "radio-group",

                props.className,
            ].toClassName()}
        >
            {
                (typeof props.heading == "string") ?
                    <h4>{props.heading}</h4> :
                    React.createElement(props.heading.type, undefined, props.heading.text)
            }
            <div> {
                props.entries.map((entry, i) =>
                    <RadioButton
                        key={i}
                        id={`${props.id}-${entry.value}`}

                        {...entry}
                        name={props.name ?? props.id}
                        isChecked={entry.value == props.checkedValue}
                        isDisabled={props.disabledIndices?.includes(i) || props.allDisabled}

                        setIsChecked={_previousValue => props.setCheckedValue(entry.value)}
                    />)
            } </div>
        </section>
    );
}