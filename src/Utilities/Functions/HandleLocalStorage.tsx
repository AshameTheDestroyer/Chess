const UNIQUE_KEY: string = "chess";

export default UNIQUE_KEY;

export function GetFromLocalStorage<T>(key: string): T {
    try {
        return JSON.parse(localStorage.getItem(`${UNIQUE_KEY}-${key}`)) as T;
    } catch {
        return undefined;
    }
}

export function SetInLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(`${UNIQUE_KEY}-${key}`, JSON.stringify(value));
}

export function DeepCopy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object)) as T;
}
