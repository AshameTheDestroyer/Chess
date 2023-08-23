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
    name: "Grass",
    darkColour: "hsl(115deg, 45%, 50%)",
    lightColour: "hsl(115deg, 100%, 90%)",
    boardColour: "hsl(115deg, 70%, 20%)",
}];