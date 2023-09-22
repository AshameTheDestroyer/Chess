class AudioManager {
    private static _AudioInstances = new Map<string, HTMLAudioElement>();

    private constructor() { }

    public static Play(source: string): void {
        const audioInstance: HTMLAudioElement = this._AudioInstances.get(source) ?? new Audio(source);
        if (!this._AudioInstances.has(source)) { this._AudioInstances.set(source, audioInstance); }

        audioInstance.play();
    }
}

export default AudioManager;