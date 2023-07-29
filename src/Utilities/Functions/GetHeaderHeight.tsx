export default function GetHeaderHeight(): number {
    const HEADER: HTMLElement = document.querySelector("#main-header");

    if (HEADER == null) { return null; }

    const
        HEADER_COMPUTED_STYLE: CSSStyleDeclaration = window.getComputedStyle(HEADER),
        HEADER_HEIGHT: number = Number(HEADER_COMPUTED_STYLE.height.replace("px", "")),
        HEADER_PADDING: number = Number(HEADER_COMPUTED_STYLE.padding.replace("px", ""));

    return HEADER_HEIGHT + HEADER_PADDING * 2;
}