### Tic-Tac-Toe Game Requirements

#### Step 1: Creating and Drawing the Board
**Goal:** Initiate a 3x3 Tic-Tac-Toe board and display it.

**Requirements:**
1. Render the game board (3 rows by 3 columns).
2. Render the title "Tic-Tac-Toe" on top of the board.
3. Initialize the board with empty cells when the game starts.

#### Step 2: Handling Game Turns and Moves
**Goal:** Handle user input via mouse clicks and mouse movement to make moves.

**Requirements:**
1. Highlight the cell under the mouse cursor if it's empty.
2. Handle mouse clicks to make a move (put a red solid circle or a blue solid circle on the board) if the selected cell is empty.
3. Display the corresponding message (e.g., "Red's turn"), and start with Red's turn first.
4. Update the board with the current player's move and switch turns (Red to Blue or Blue to Red).

#### Step 3: Checking for Game Over
**Goal:** Check if the game is over by determining if there's a winner or a tie.

**Requirements:**
1. Check for a win by identifying three in a row in any direction (horizontal, vertical, or diagonal).
2. If there is a winner, display a message (e.g., "Red wins!") and draw a line through the winning cells.
3. If the board is full without a winner, display a tie game message (e.g., "Tie game!").

#### Step 4: Restarting the Game
**Goal:** Restart the game by resetting variables and redrawing the game board, cells, and messages on the canvas.

**Requirements:**
1. Display a message if the game is over, with instructions to restart (e.g., "(press r to restart)").
2. Handle key press 'r' to restart the game and reinitialize the board.
