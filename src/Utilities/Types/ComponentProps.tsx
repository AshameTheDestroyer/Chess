import React from "react";

type ComponentProps = {
    id?: string;
    className?: string;
    children?: React.ReactNode;
};

export default ComponentProps;

export type ChildlessComponentProps = Omit<ComponentProps, "children">;

export type ComponentEventProps<T1 extends HTMLElement, T2 extends React.HTMLAttributes<T1>> = {
    [HTMLKey in keyof T2 as HTMLKey extends `on${string}` ? HTMLKey : never]?: T2[HTMLKey];
};