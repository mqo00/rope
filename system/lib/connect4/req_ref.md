### Connect4 Game Requirements

#### Step 1: Creating and Drawing the Board
**Goal:** Initiate a 6x7 Connect4 board and display it.

**Requirements:**
1. Render the game board (6 rows by 7 columns).
2. Render the title "Connect4" on top of the board.
3. Initialize the board with empty cells when the game starts.

#### Step 2: Handling Game Turns and Moves
**Goal:** Handle user input via mouse clicks and mouse movement to make moves.

**Requirements:**
1. Highlight the column under the mouse cursor if it's not full.
2. Handle mouse clicks to make a move (drop an "X" or "O" symbol in the column) if the selected column is not full.
3. Display the corresponding message (e.g., "X's turn"), and start with X's turn first.
4. Update the board with the current player's move and switch turns (X to O or O to X).

#### Step 3: Checking for Game Over
**Goal:** Check if the game is over by determining if there's a winner or a tie.

**Requirements:**
1. Check for a win by identifying four in a row in any direction (horizontal, vertical, or diagonal).
2. If there is a winner, display a message (e.g., "X wins!") and draw a line through the winning cells.
3. If the board is full without a winner, display a tie game message (e.g., "Tie game!").

#### Step 4: Restarting the Game
**Goal:** Restart the game by resetting variables and redrawing the game board, cells, and messages on the canvas.

**Requirements:**
1. Display a message if the game is over, with instructions to restart (e.g., "(press r to restart)").
2. Handle key press 'r' to restart the game and reinitialize the board.
