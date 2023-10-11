import Theme from "../Types/Theme";

const THEME_STYLES = new Map<Theme, React.CSSProperties>([
    [Theme.Light, {
        "--background-colour": "#BBB",
        "--background-darker-colour": "#EEE",
        "--fore-colour": "#000",
        "--fore-darker-colour": "#333",
    } as React.CSSProperties],
]);

export default THEME_STYLES;