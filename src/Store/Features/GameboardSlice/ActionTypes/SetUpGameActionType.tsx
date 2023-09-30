import { PlaySliceType } from "../../PlaySlice/PlaySlice";

type SetUpGameActionType = {
    FENCode: string;
} & PlaySliceType;

export default SetUpGameActionType;