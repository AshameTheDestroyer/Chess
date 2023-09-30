import { createPortal } from "react-dom";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import Either from "../../Types/Either";
import Coordinates from "../../Types/Coordinates";

import "./ContextMenu.scss";

export type ContextMenuButton = {
    name: string;
    iconURL?: string;
    condition?: boolean;
} & Either<{
    keyShortcut?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}, {
    opensTab: string;
}>;

export type ContextMenuButtonWithSelector = {
    selector?: string;
} & ContextMenuButton;

type _ContextMenuGroup = {
    tabName?: string;
};

export type ContextMenuGroup = {
    options: Array<ContextMenuButton>;
} & _ContextMenuGroup;

export type ContextMenuGroupWithSelector = {
    options: Array<ContextMenuButtonWithSelector>;
} & _ContextMenuGroup;

type ContextMenuProps = {
    isOpen: boolean;

    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & Either<{
    groups: Array<ContextMenuGroup>;
}, {
    clickedElement: HTMLElement;
    groups: Array<ContextMenuGroupWithSelector>;
}> & Coordinates;

const
    PREVIOUS_CONTEXT_MENU_GROUP_TAB_NAME: string = "#previous-tab",
    PREVIOUS_CONTEXT_MENU_BUTTON_NAME: string = "Previous";

export default function ContextMenu(props: ContextMenuProps): React.ReactElement {
    const [openTab, setOpenTab] = useState<string>(null);
    const [previousOpenTabs, setPreviousOpenTabs] = useState<Array<string>>([]);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    const
        PAGE_WIDTH: number = window.innerWidth,
        PAGE_HEIGHT: number = window.innerHeight;

    const previousContextMenuButton: ContextMenuButtonWithSelector = {
        name: PREVIOUS_CONTEXT_MENU_BUTTON_NAME,
        opensTab: previousOpenTabs.at(-1),
    };

    const previousContextMenuGroup: ContextMenuGroupWithSelector = {
        tabName: PREVIOUS_CONTEXT_MENU_GROUP_TAB_NAME,
        options: [previousContextMenuButton],
    };

    const groups: Array<ContextMenuGroupWithSelector> = [previousContextMenuGroup, ...props.groups];

    useEffect(() => {
        if (props.isOpen) { return; }

        setOpenTab(null);
        setPreviousOpenTabs([]);
    }, [props.isOpen]);

    useLayoutEffect(() => {
        if (!props.isOpen) { return; }

        SetSize(0, 0);
        RecorrectSize();
    }, [props.isOpen]);

    useLayoutEffect(() => {
        if (!props.isOpen) { return; }

        return () => { RemoveExtraContextMenuPreviousButtons(); };
    }, [openTab]);

    function RefreshWidth(): void {
        const contextMenu: HTMLDivElement = contextMenuRef.current;
        if (contextMenu == null) { return; }

        contextMenu.style.animationName = "";
        setTimeout(() => contextMenu.style.animationName = "context-menu-entrance-only-columns");
    }

    function RemoveExtraContextMenuPreviousButtons(): void {
        Array.from(document.querySelectorAll("#context-menu-previous-button"))
            .forEach((contextMenuPreviousButton, i) => (i > 0) && contextMenuPreviousButton.remove());
    }

    function RecorrectSize(): void {
        const
            TO_PERCENT: number = 100,
            PADDING_IN_PIXEL: number = 20;

        const WIDTH: number = Number.parseFloat(
            getComputedStyle(contextMenuRef.current).width.replace("px", ""))
            * TO_PERCENT + PADDING_IN_PIXEL;

        const HEIGHT: number = Number.parseFloat(
            getComputedStyle(contextMenuRef.current).height.replace("px", ""))
            * TO_PERCENT + PADDING_IN_PIXEL;

        SetSize(WIDTH, HEIGHT);
    }

    function SetSize(width: number, height: number): void {
        contextMenuRef.current.style.left = (props.x <= PAGE_WIDTH + window.scrollX - width) ? `${props.x}px` : "auto";
        contextMenuRef.current.style.top = (props.y <= PAGE_HEIGHT + window.scrollY - height) ? `${props.y}px` : "auto";
        contextMenuRef.current.style.right = (props.x > PAGE_WIDTH + window.scrollX - width) ? `${PAGE_WIDTH - props.x}px` : "auto";
        contextMenuRef.current.style.bottom = (props.y > PAGE_HEIGHT + window.scrollY - height) ? `${PAGE_HEIGHT - props.y}px` : "auto";
    }

    return props.isOpen && createPortal(
        <div
            id="context-menu"
            ref={contextMenuRef}

            onClick={_e => props.setIsOpen(false)}

            style={{
                left: (props.x <= PAGE_WIDTH + window.scrollX) ? `${props.x}px` : "auto",
                top: (props.y <= PAGE_HEIGHT + window.scrollY) ? `${props.y}px` : "auto",
                right: (props.x > PAGE_WIDTH + window.scrollX) ? `${PAGE_WIDTH - props.x}px` : "auto",
                bottom: (props.y > PAGE_HEIGHT + window.scrollY) ? `${PAGE_HEIGHT - props.y}px` : "auto",
            }}
        >
            <div id="context-menu-wrapper"> {
                groups.map((group: ContextMenuGroupWithSelector, i: number) =>
                    <ContextMenuGroupElement
                        key={i}

                        {...group}
                        groups={groups}
                        openTab={openTab}
                        previousOpenTabs={previousOpenTabs}
                        clickedElement={props.clickedElement}

                        setOpenTab={setOpenTab}
                        RefreshWidth={RefreshWidth}
                        setPreviousOpenTabs={setPreviousOpenTabs}
                    />
                )
            } </div>
        </div>, document.querySelector("#modal-container") ?? document.body);
}

type ContextMenuGroupElementProps = {
    openTab: string;
    clickedElement: HTMLElement;
    previousOpenTabs: Array<string>;
    groups: Array<ContextMenuGroupWithSelector>;

    RefreshWidth: () => void;
    setOpenTab: React.Dispatch<React.SetStateAction<string>>;
    setPreviousOpenTabs: React.Dispatch<React.SetStateAction<Array<string>>>;
} & ContextMenuGroupWithSelector;

function ContextMenuGroupElement(props: ContextMenuGroupElementProps): React.ReactElement {
    let isRootShown: boolean = props.openTab == null,
        isOnRootTab: boolean = isRootShown && props.tabName == null,
        hasNoOptions: boolean = props.options.length == 0,
        isOnCorrectTab: boolean = !isRootShown && props.tabName == props.openTab,
        isPreviousGroup: boolean = props.tabName == PREVIOUS_CONTEXT_MENU_GROUP_TAB_NAME;

    if (isPreviousGroup && isRootShown) { return null; }

    if (!isOnCorrectTab && !isPreviousGroup) {
        if (hasNoOptions) { return null; }
        if (!isOnRootTab) { return null; }
    }

    const contextMenuButtonConditions: Array<boolean> = props.options.map(contextMenuButton =>
        EvaluateContextMenuButtonConditions({
            clickedElement: props.clickedElement,
            selector: contextMenuButton.selector,
            condition: contextMenuButton.condition,
        })
    );

    if (!contextMenuButtonConditions.some(condition => condition)) { return null; }

    return (
        <div className="context-menu-group"> {
            props.options.map((contextMenuButton: ContextMenuButtonWithSelector, i: number) =>
                (contextMenuButtonConditions[i]) &&
                <ContextMenuButtonElement
                    key={i}

                    {...contextMenuButton}
                    groups={props.groups}
                    groupTabName={props.tabName}
                    setOpenTab={props.setOpenTab}
                    RefreshWidth={props.RefreshWidth}
                    isGroupPreviousGroup={isPreviousGroup}
                    setPreviousOpenTabs={props.setPreviousOpenTabs}
                />
            )
        } </div>
    );
}

type EvaluateContextMenuButtonConditionProps = {
    selector?: string;
    condition?: boolean;
    clickedElement: HTMLElement;
};

function EvaluateContextMenuButtonConditions(props: EvaluateContextMenuButtonConditionProps): boolean {
    let conditionIsMet: boolean = props.condition != null && props.condition,
        selectorIsFound: boolean = props.selector != null && props.clickedElement.closest(props.selector) != null;

    if (props.condition != null && !conditionIsMet) { return false; }
    if (props.selector != null && !selectorIsFound) { return false; }

    return true;
}

type ContextMenuButtonElementProps = {
    groupTabName?: string;
    isGroupPreviousGroup: boolean;
    groups: Array<ContextMenuGroupWithSelector>;

    RefreshWidth: () => void;
    setOpenTab: React.Dispatch<React.SetStateAction<string>>;
    setPreviousOpenTabs: React.Dispatch<React.SetStateAction<Array<string>>>;
} & ContextMenuButtonWithSelector;

function ContextMenuButtonElement(props: ContextMenuButtonElementProps): React.ReactElement {
    let opensTabThatExists: boolean = (props.opensTab != null || props.isGroupPreviousGroup) &&
        props.groups.find(group => group.tabName == props.opensTab)?.options.length > 0;

    function OnContextMenuButtonClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        e.stopPropagation();
        props.RefreshWidth();

        props.setPreviousOpenTabs(previousOpenTabs => (previousOpenTabs.at(-1) == props.opensTab) ?
            previousOpenTabs.slice(0, -1) : [...previousOpenTabs, props.groupTabName]);

        props.setOpenTab(props.opensTab);
    }

    return (
        <button
            className={(props.iconURL != null) ? "context-menu-icon-button" : undefined}
            id={(props.isGroupPreviousGroup) ? "context-menu-previous-button" : undefined}

            data-opens-tab={(opensTabThatExists) ? props.opensTab : undefined}

            onClick={(opensTabThatExists) ? OnContextMenuButtonClick : props.onClick}

            style={{
                "--icon-url": `url("${props.iconURL}")`,
            } as React.CSSProperties}
        >
            <p>{props.name}</p>
            {
                (props.keyShortcut != null) &&
                <p>{props.keyShortcut}</p>
            }
        </button>
    );
}