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
    darkColour: "hsl(46, 100%, 50%)",
    lightColour: "hsl(31, 88%, 91%)",
    boardColour: "hsl(44, 74%, 39%)",
}, {
    name: "Bits",
    darkColour: "hsl(145deg, 100%, 25%)",
    lightColour: "hsl(145deg, 100%, 60%)",
    boardColour: "hsl(145deg, 100%, 10%)",
}, {
    name: "Grass",
    darkColour: "hsl(115, 44%, 49%)",
    lightColour: "hsl(115, 100%, 89%)",
    boardColour: "hsl(114, 71%, 21%)",
}];