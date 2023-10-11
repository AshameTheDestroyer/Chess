import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";

import Theme from "../../Types/Theme";
import { ConvertSystemTheme, themeMedia } from "../../Functions/GetCurrentTheme";
import { SelectPreferenceSlice } from "../../../Store/Features/PreferenceSlice/PreferenceSlice";

type ThemeContextProps = {
    root: HTMLElement;
    themes: Map<Theme, React.CSSProperties>;
};

export default function ThemeContext(props: ThemeContextProps): React.ReactElement {
    const PreferenceSlice = useSelector(SelectPreferenceSlice);
    const [theme, setTheme] = useState(ConvertSystemTheme(PreferenceSlice.handlers.theme));

    useEffect(() => {
        themeMedia.addEventListener("change", _e => (theme == Theme.System) && UpdateTheme());
    }, []);

    useEffect(() => {
        UpdateTheme();
    }, [PreferenceSlice.handlers.theme]);

    useEffect(() => {
        const cssProperties: React.CSSProperties = props.themes.get(theme);

        props.root.dataset["theme"] = theme;

        if (cssProperties == null) { return; }

        Object.entries(cssProperties).forEach(([key, value]) =>
            props.root.style.setProperty(key, value));

        return () => {
            Object.entries(cssProperties).forEach(([key, _value]) =>
                props.root.style.setProperty(key, null));
        };
    }, [theme]);

    function UpdateTheme(): void {
        setTheme(ConvertSystemTheme(PreferenceSlice.handlers.theme));
    }

    return null;
}