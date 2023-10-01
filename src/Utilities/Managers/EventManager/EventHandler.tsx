type EventHandler<T = never, U = void> = Array<(...args: T[]) => U>;

export default EventHandler;