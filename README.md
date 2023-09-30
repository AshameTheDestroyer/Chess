# Chess-Engine

Today we're not making any tedious Chess Game, no baby today we're making A WHOLE FUCKING CHESS ENGINE, and I'm serious about it, it will be my best project so far, and even for future projects it may top most of them…

### First Commit, Piece Movements:
1. Simple page navigation on the header.
2. Gameboard Page, where the board is presented to be played on.
3. Pieces can move via three main ways:
   * Via Mouse Clicking.
   * Via Keyboard.
   * Via Drag & Drop.
4. And some highlights for the following cell states:
   * Selected: which means the cell's selected via the keyboard.
   * Ready: which means the cell's piece's ready to be moved to another cell, if it exists.
   * Played-From: indicates the last played piece's previous cell.
   * Played-To: indicates the last played piece's new cell.

### Context Menu:
1. As the name suggests, I've added a context menu, with dummy buttons for now, and it's built separately from the project, to work in every other project, and it contains the following features:
   * Groups: the ability to group certain buttons together to appear separately.
   * Tab Groups: the ability to hide certain groups in other tabs, to be accessible by tab buttons.
   * Selector Buttons: buttons that the context menu has to be clicked on an element that matches a certain CSS selector, for instance a Select Piece button can only appear when the context menu is clicked on a Piece element.
   * Conditioned Buttons: buttons that a certain condition must be met before the buttons appear.
2. Cell states are now grouped in an Enum in a better way for future development, with nice API to deal with.
3. Minor bug fixes.

### Home Page:
1. This one was simple, I created a basic homepage, with some Context Menu bug fixes, and then threw a bunch of SASS on it.
2. I've made a Custom Button component, as well as a Custom Button Displayer, and I've given them a poppy cartoony-ish style, which in my opinion, looks amazing.
3. Custom Buttons implement:
   * Normal: boring.
   * Emphasized: which means the button will stand out with the primary colour of the page.
   * Arrowed: which gives the button a pointing arrow, either to left or right.
   * Iconified: which's the same as the aforementioned, but with a custom icon.
   * Linking: which allows the button to act as an anchor element.
 4. Custom Button Displayer is just a wrapper that allows for the following displays:
    * Flexified: displays buttons in Flex Mode.
    * Gridding: displays buttons in Grid Mode.

### Piece Movement System:
1. Now, pieces can no longer move freely, and instead are tied to a system that ensures regular chess piece movements.
2. All of the following moves were added, (which are BTW also cell states):
   * Move: a literal move, nothing more.
   * Attack: a move that targets a foe's piece.
   * Castle: defending the king with one of his rooks.
   * Promote: whenever a pawn reaches the last of the board.
   * Sneak: (yes IK that's not its name), when a foe's pawn jumps two cells and sit next to your pawn, you can attack it indirectly and diagonally.
3. Promotion Picker Modal, which's a modal that appears whenever a pawn's boutta promote, and it has a perfect visual effect to it.

### Theme Picker:
1. Simply put: now there's a Preference Page, that you can navigate to throughout the navigation bar within the page-shared header.
2. The Preference Page only contains Chess Theme to pick from at the meantime, which contains the following themes:
   * Classic.
   * Wooden.
   * Modern.
   * Crimson.
   * Golden.
   * Bits.
   * Frostburn.
   * Royal.
   * Grass.
   * Nightfall.
   * Pharaonic.
   * Aquatic.
   * Pinky.
   * Evil.
3. Finally, it uses Local Storage to save these changes and preferences.
4. An additional edit has been required, is that all pieces are now rendered as SVGs, not regular images, so that it can be used to change its fill and stroke colours.
5. Options menu added too to the Preference Page, which currently only contains one button, that can either enable or disable the movements shown whenever a piece is selected/moved.

### Checkmating:
1. As the name simply suggests, we can now, check, checkmate, or draw, our opponents, and it was so damn hard to implement.
2. Kings now check for threatening foe pieces, whenever a piece is moved, then be checked if they're actually at the fire line.
3. A piece can no longer move when a check occurrence exists, unless they can benefit their king.
4. Also a piece can no longer move, if it's pinned by a foe piece, such that its movement can throw the king in danger.
5. Kings can no longer move unless it was a safe spot.
6. Also kings cannot interfere with any cell that's been territorialized by anyone else than them, thus no king can stick to another king's back.
7. Currently a checkmate or a draw only triggers an alert, but that'll be implemented later on.
8. Renamed the Sneak Movement into an En Passant Movement.

### Stalemating:
1. Finally, the game's literally complete, but not as much can be said to the whole website, nor engine.
2. All of kind of draws are now possible and fully functional.
3. Whenever a player runs outta available movements, a stalemate is thrown.
4. If a player started playing dumb, now they'll have only a certain amount of movements, obeying the Fifty Movement Rule.
5. Whenever players are fooling one another and repeatedly playing same movements, a certain amount of repetition is allowed now, obeying the Repetition Rule.
6. A table of all recorded played movements is now available, that shows all player's movements, from and to where they've played it, its number, and how it turned out, (it's not as general as intended yet).
7. A form to register all the playing states before actually start playing.