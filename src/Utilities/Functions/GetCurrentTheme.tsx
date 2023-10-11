import Theme from "../Types/Theme";

export const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

export default function GetCurrentTheme(): Theme {
    return (themeMedia.matches) ? Theme.Dark : Theme.Light;
}

export function ConvertSystemTheme(theme: Theme): Theme {
    return (theme == Theme.System) ? GetCurrentTheme() : theme;
}