import tkinter as tk

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
        self.canvas = tk.Canvas(root, width=self.boardWidth + self.boardLeft * 2, height=self.boardHeight + self.boardTop * 2, bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=180, pady=20)

        # Initialize the game state
        self.resetApp()
        
        # Draw the initial board
        self.redrawAll()

    def resetApp(self):
        self.board = [[None] * self.cols for _ in range(self.rows)]

    def redrawAll(self):
        self.canvas.delete("all")
        
        # Draw the centered "Tic-Tac-Toe" text
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 50
        self.canvas.create_text(center_x, center_y, text='Tic-Tac-Toe', font=('Helvetica', 30), fill='black', anchor="center")
  
        self.drawBoard()
        self.drawBoardBorder()

    def drawBoard(self):
        for row in range(self.rows):
            for col in range(self.cols):
                self.drawCell(row, col)

    def drawBoardBorder(self):
        self.canvas.create_rectangle(self.boardLeft, self.boardTop, 
                                     self.boardLeft + self.boardWidth, 
                                     self.boardTop + self.boardHeight,
                                     outline='black', 
                                     width=2 * self.cellBorderWidth)

    def drawCell(self, row, col):
        cellLeft, cellTop = self.getCellLeftTop(row, col)
        cellWidth, cellHeight = self.getCellSize()
        self.canvas.create_rectangle(cellLeft, cellTop, 
                                     cellLeft + cellWidth, 
                                     cellTop + cellHeight,
                                     fill="white", 
                                     outline='black', 
                                     width=self.cellBorderWidth)

    def getCellLeftTop(self, row, col):
        cellWidth, cellHeight = self.getCellSize()
        cellLeft = self.boardLeft + col * cellWidth
        cellTop = self.boardTop + row * cellHeight
        return cellLeft, cellTop

    def getCellSize(self):
        cellWidth = self.boardWidth / self.cols
        cellHeight = self.boardHeight / self.rows
        return cellWidth, cellHeight

def main():
    root = tk.Tk()
    root.configure(bg="white")
    app = TicTacToeApp(root)
    root.mainloop()

main()
