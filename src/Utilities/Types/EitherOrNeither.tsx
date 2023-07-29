import Either from "./Either";

type EitherOrNeither<T1, T2> = Either<T1, T2>
    | ({ [Key1 in keyof T1]?: never } & { [Key2 in keyof T2]?: never });

export default EitherOrNeither;