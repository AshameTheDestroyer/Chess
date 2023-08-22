const UNIQUE_KEY: string = "chess-engine";

export default UNIQUE_KEY;

export function GetFromLocalStorage<T>(key: string): T {
    return JSON.parse(localStorage.getItem(`${UNIQUE_KEY}-${key}`)) as T;
}

export function SetInLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(`${UNIQUE_KEY}-${key}`, JSON.stringify(value));
}

export function DeepCopy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object)) as T;
}