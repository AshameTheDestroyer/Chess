type ArgumentType<T> = T extends (...args: infer U) => any ? U : never;

export default ArgumentType;