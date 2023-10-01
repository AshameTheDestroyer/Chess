import EventHandler from "./EventHandler";

class EventManager {
    private constructor() { }

    public static SubscribeToEvent<T = never, U = void>
        (eventHandler: EventHandler<T, U>, subscriber: (...args: T[]) => U): EventHandler<T, U> {

        return eventHandler = [...eventHandler ?? [], subscriber];
    }

    public static UnsubscribeFromEvent<T = never, U = void>
        (eventHandler: EventHandler<T, U>, subscriber: (...args: T[]) => U): EventHandler<T, U> {

        return eventHandler = eventHandler?.filter(subscriber_ => subscriber_ != subscriber) ?? undefined;
    }

    public static FireEvent<T, U>(eventHandler: EventHandler<T, U>, ...args: T[]): void {
        eventHandler.forEach(subscriber => subscriber(...args));
    }
}

export default EventManager;