import { GameboardEventHandlers } from "../GameboardSlice";
import ArgumentType from "../../../../Utilities/Types/ArgumentType";

type SubscribeToEventHandlersActionType<T extends keyof GameboardEventHandlers> = {
    key: T;
    subscriber: (...args: ArgumentType<GameboardEventHandlers[T][0]>) => ReturnType<GameboardEventHandlers[T][0]>;
};

export default SubscribeToEventHandlersActionType;