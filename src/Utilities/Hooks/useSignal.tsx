import { useEffect } from "react";

function useSignal(effect: React.EffectCallback, signal: [unknown]): void {

    useEffect(() => {
        if (signal[0] == null) { return; }

        return effect();
    }, signal);
}

export default useSignal;