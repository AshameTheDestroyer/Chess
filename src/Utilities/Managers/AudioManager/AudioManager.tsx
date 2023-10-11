class AudioManager {
    private static _audioInstances: Map<string, HTMLAudioElement> = new Map();

    private constructor() { }

    public static Play(source: string): void {
        const audioInstance: HTMLAudioElement = this._audioInstances.get(source) ?? new Audio(source);

        if (!this._audioInstances.has(source)) {
            console.log(`Added: ${source}.`);
            this._audioInstances.set(source, audioInstance);
        }

        audioInstance.play();
    }

    public static Dispose(source: string): void {
        if (this._audioInstances.delete(source)) { console.log(`Disposed: ${source}.`); }
    }
}

export default AudioManager;