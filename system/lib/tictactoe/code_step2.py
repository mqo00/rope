import tkinter as tk
import math

class TicTacToeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Tic-Tac-Toe")
        
        # Board dimensions
        self.rows = 3
        self.cols = 3
        self.boardLeft = 50
        self.boardTop = 100
        self.boardWidth = 400
        self.boardHeight = 400
        self.cellBorderWidth = 2

        # Set up the canvas with refined UI
        self.canvas = tk.Canvas(self.root, width=self.boardWidth + self.boardLeft * 2, height=self.boardHeight + self.boardTop * 2, bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=180, pady=20)
        self.canvas.bind("<Button-1>", self.onMousePress)
        self.canvas.bind("<Motion>", self.onMouseMove)

        # Initialize the game state
        self.resetApp()

        # Draw the initial board
        self.redrawAll()

    def resetApp(self):
        self.selection = None
        self.board = [[None] * self.cols for _ in range(self.rows)]
        self.turn = 'Red'
        self.message = "Red's turn"

    def onMousePress(self, event):
        self.selection = None
        cell = self.getCell(event.x, event.y)
        if cell is not None:
            row, col = cell
            if self.board[row][col] is None:
                self.makeMove(row, col)
                self.redrawAll()

    def onMouseMove(self, event):
        selectedCell = self.getCell(event.x, event.y)
        if selectedCell is None:
            self.selection = None
        else:
            row, col = selectedCell
            if self.board[row][col] is None:
                self.selection = selectedCell
            else:
                self.selection = None
        self.redrawAll()

    def makeMove(self, row, col):
        self.board[row][col] = self.turn
        self.changeTurns()

    def changeTurns(self):
        self.turn = 'Blue' if (self.turn == 'Red') else 'Red'
        self.message = f"{self.turn}'s turn"

    def redrawAll(self):
        self.canvas.delete("all")
        
        # Draw the centered "Tic-Tac-Toe" text
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 50
        self.canvas.create_text(center_x, center_y, text='Tic-Tac-Toe', font=('Helvetica', 30), fill='black', anchor="center")
        
        # Draw the message
        self.drawAppMessage()
        
        # Draw the board
        self.drawBoard()
        self.drawBoardBorder()

    def drawAppMessage(self):
        message = self.message
        color = 'black'
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 20
        self.canvas.create_text(center_x, center_y, text=message, font="Helvetica 16", fill=color, anchor="center")

    def drawBoard(self):
        for row in range(self.rows):
            for col in range(self.cols):
                self.drawCell(row, col)

    def drawBoardBorder(self):
        self.canvas.create_rectangle(self.boardLeft, self.boardTop, 
                                     self.boardLeft + self.boardWidth, self.boardTop + self.boardHeight,
                                     outline='black', width=2 * self.cellBorderWidth)

    def drawCell(self, row, col):
        cellLeft, cellTop = self.getCellLeftTop(row, col)
        cellWidth, cellHeight = self.getCellSize()
        color = 'yellow' if (row, col) == self.selection else None  # yellow highlight for selected cells
        self.canvas.create_rectangle(cellLeft, cellTop, 
                                     cellLeft + cellWidth, cellTop + cellHeight,
                                     fill=color, outline='black', width=self.cellBorderWidth)
        label = self.board[row][col]
        if label is not None:
            cx = cellLeft + cellWidth / 2
            cy = cellTop + cellHeight / 2
            fill_color = 'red' if label == 'Red' else 'blue'
            self.canvas.create_oval(cx - 50, cy - 50, cx + 50, cy + 50, fill=fill_color, outline='')

    def getCell(self, x, y):
        dx = x - self.boardLeft
        dy = y - self.boardTop
        cellWidth, cellHeight = self.getCellSize()
        row = math.floor(dy / cellHeight)
        col = math.floor(dx / cellWidth)
        if (0 <= row < self.rows) and (0 <= col < self.cols):
            return (row, col)
        else:
            return None

    def getCellLeftTop(self, row, col):
        cellWidth, cellHeight = self.getCellSize()
        cellLeft = self.boardLeft + col * cellWidth
        cellTop = self.boardTop + row * cellHeight
        return (cellLeft, cellTop)

    def getCellSize(self):
        cellWidth = self.boardWidth / self.cols
        cellHeight = self.boardHeight / self.rows
        return (cellWidth, cellHeight)

def main():
    root = tk.Tk()
    app = TicTacToeApp(root)
    root.configure(bg="white")
    root.mainloop()

main()
