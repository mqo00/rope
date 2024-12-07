### Tetris Game Requirements

#### Step 1: Creating and Drawing the Board
**Goal:** Initiate a 8x6 Tetris board and display it.

**Requirements:**
1. Render the game board (8 rows by 6 columns)
2. Render a title "Tetris" on top of the board.
3. Initialize the board with empty cells when the game starts.

#### Step 2: Creating and Drawing the Pieces
**Goal:** Initialize and display different Tetris pieces over the board.

**Requirements:**
1. Define all 7 Tetris piece shapes and their corresponding colors: red I, yellow J, magenta L, pink O, blue S, green T, and orange Z.
2. Use the number key 0 to 6 to load different Tetris pieces at the top center of the board; for example, an 'I' shape piece is red and corresponds to the number key 0.

#### Step 3: Moving the Piece
**Goal:** Allow a piece to move left, right, down, and hard drop in response to keyboard inputs.

**Requirements:**
1. Move the piece left, right, or down based on arrow keyboard inputs.
2. Hard drop the piece to the bottom when pressing the space key.
3. Ensure the new position of the piece is within the board boundaries.
4. Ensure the new position of the piece does not overlap existing pieces.

#### Step 4: Rotating the Piece
**Goal:** Allow a piece to rotate when the up arrow key is pressed.

**Requirements:**
1. Rotate the piece clockwise when the up arrow key is pressed.
2. Ensure the new position of the piece is within the board boundaries.
3. Ensure the new position of the piece does not overlap existing pieces.

#### Step 5: Dropping and Placing the Piece
**Goal:** Automatically drop the piece, stack the piece at the bottom of the board, and create a new piece.

**Requirements:**
1. Automatically move the piece down at regular intervals.
2. Put the piece on the board when it can no longer move down (overlap existing pieces or hitting board bottom boundary).
3. Spawn a new piece once the current piece is placed.
4. Spawn new pieces following a fixed order; for example, a yellow 'J' piece always occurs after a red 'I' piece.

#### Step 6: Removing Full Rows and End Game
**Goal:** Remove any fully filled rows from the board, add new empty rows at the top, and implement the end game if pieces are stacked to the top.

**Requirements:**
1. Identify and remove all fully filled rows.
2. Add new empty rows at the top to maintain the board's height.
3. End the game if new pieces cannot be placed legally due to existing pieces reaching the top.
4. Display a "Game Over" message when the game ends.
