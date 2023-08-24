type ChessTheme = {
    name: string;
    darkColour: string;
    lightColour: string;
    boardColour: string;
};

export default ChessTheme;

export const CHESS_THEMES: Array<ChessTheme> = [{
    name: "Classic",
    darkColour: "hsl(0deg, 0%, 15%)",
    lightColour: "hsl(0deg, 0%, 100%)",
    boardColour: "hsl(0deg, 0%, 5%)",
}, {
    name: "Wooden",
    darkColour: "hsl(25deg, 75%, 35%)",
    lightColour: "hsl(25deg, 75%, 75%)",
    boardColour: "hsl(25deg, 50%, 15%)",
}, {
    name: "Modern",
    darkColour: "hsl(215deg, 75%, 50%)",
    lightColour: "hsl(215deg, 75%, 75%)",
    boardColour: "hsl(215deg, 75%, 25%)",
}, {
    name: "Crimson",
    darkColour: "hsl(0deg, 75%, 35%)",
    lightColour: "hsl(0deg, 75%, 75%)",
    boardColour: "hsl(0deg, 50%, 15%)",
}, {
    name: "Golden",
    darkColour: "hsl(46deg, 100%, 40%)",
    lightColour: "hsl(46deg, 100%, 75%)",
    boardColour: "hsl(46deg, 90%, 25%)",
}, {
    name: "Bits",
    darkColour: "hsl(145deg, 100%, 25%)",
    lightColour: "hsl(145deg, 100%, 60%)",
    boardColour: "hsl(145deg, 100%, 10%)",
}, {
    name: "Frostburn",
    darkColour: "hsl(0deg, 80%, 50%)",
    lightColour: "hsl(204deg, 80%, 40%)",
    boardColour: "hsl(0deg, 0%, 5%)",
}, {
    name: "Royal",
    darkColour: "hsl(0deg, 80%, 50%)",
    lightColour: "hsl(45deg, 100%, 50%)",
    boardColour: "hsl(25deg, 50%, 15%)",
}, {
    name: "Grass",
    darkColour: "hsl(115deg, 45%, 50%)",
    lightColour: "hsl(115deg, 100%, 90%)",
    boardColour: "hsl(115deg, 70%, 20%)",
}, {
    name: "Nightfall",
    darkColour: "hsl(270deg, 85%, 35%)",
    lightColour: "hsl(295deg, 30%, 80%)",
    boardColour: "hsl(260deg, 95%, 15%)",
}, {
    name: "Pharaonic",
    darkColour: "hsl(245deg, 85%, 30%)",
    lightColour: "hsl(45deg, 100%, 50%)",
    boardColour: "hsl(245deg, 100%, 10%)",
}, {
    name: "Aquatic",
    darkColour: "hsl(170deg, 85%, 40%)",
    lightColour: "hsl(170deg, 100%, 95%)",
    boardColour: "hsl(170deg, 100%, 25%)",
}, {
    name: "Pinky",
    darkColour: "hsl(335deg, 100%, 65%)",
    lightColour: "hsl(335deg, 100%, 90%)",
    boardColour: "hsl(335deg, 70%, 25%)",
}, {
    name: "Evil",
    darkColour: "hsl(0, 0%, 15%)",
    lightColour: "hsl(0, 85%, 50%)",
    boardColour: "hsl(0deg, 0%, 5%)",
}];