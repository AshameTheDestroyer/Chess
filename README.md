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
1. This one was simple, I created a basic homepage, with some Context Menu bug fixes, and then throwed a bunch of SASS on it.
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
   * Grass.
3. Finally, it uses Local Storage to save these changes and preferences.
4. An additional edit has been required, is that all pieces are now rendered as SVGs, not regular images, so that it can be used to change its fill and stroke colours.
