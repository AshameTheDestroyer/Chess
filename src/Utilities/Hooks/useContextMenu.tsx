import { useState, useEffect } from "react";
import Coordinates from "../Types/Coordinates";

function useContextMenu(): [
    boolean,
    Coordinates,
    HTMLElement,
    React.Dispatch<React.SetStateAction<boolean>>,
    React.Dispatch<React.SetStateAction<Coordinates>>,
    React.Dispatch<React.SetStateAction<HTMLElement>>,
] {
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [contextMenuCoordinates, setContextMenuCoordinates] = useState<Coordinates>(null);
    const [contextMenuClickedElement, setContextMenuClickedElement] = useState<HTMLElement>(null);

    useEffect(() => {
        document.body.addEventListener("contextmenu", OnBodyContextMenu);
        document.body.addEventListener("click", OnBodyClick);

        return () => {
            document.body.removeEventListener("contextmenu", OnBodyContextMenu);
            document.body.removeEventListener("click", OnBodyClick);
        };
    }, []);

    function OnBodyContextMenu(e: MouseEvent): boolean {
        setIsContextMenuOpen(false);
        setTimeout(() => setIsContextMenuOpen(true));

        setContextMenuCoordinates({ x: e.x, y: e.y });
        setContextMenuClickedElement(e.target as HTMLElement);

        return false;
    }

    function OnBodyClick(e: MouseEvent): void {
        let isLeftClicked: boolean = e.button == 0;
        if (isLeftClicked) { setIsContextMenuOpen(false); }
    }

    return [
        isContextMenuOpen,
        contextMenuCoordinates,
        contextMenuClickedElement,
        setIsContextMenuOpen,
        setContextMenuCoordinates,
        setContextMenuClickedElement,
    ];
}

export default useContextMenu;