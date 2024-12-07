import tkinter as tk

class Connect4:
    def __init__(self, root):
        # Board dimensions and styling
        self.rows = 6
        self.cols = 7
        self.boardLeft = 95
        self.boardTop = 120
        self.boardWidth = 400
        self.boardHeight = 350
        self.cellBorderWidth = 2
        
        # Initialize the board as a 2D list with None values
        self.board = [[None] * self.cols for _ in range(self.rows)]
        
        # Set up the canvas with refined UI
        self.canvas = tk.Canvas(root, width=self.boardWidth + self.boardLeft * 2, 
                                height=self.boardHeight + self.boardTop * 2 + 50, 
                                bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=100, pady=20)
        
        # Draw the board
        self.redrawAll()

    def redrawAll(self):
        self.canvas.delete("all")
        
        # Draw the centered "Connect4" text
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 30 
        self.canvas.create_text(center_x, center_y, text='Connect4', 
                                font=('Helvetica', 30), fill='black', anchor="center")
  
        self.drawBoard()
        self.drawBoardBorder()

    def drawBoard(self):
        for row in range(self.rows):
            for col in range(self.cols):
                color = self.board[row][col] if self.board[row][col] else "white"
                self.drawCell(row, col, color)

    def drawBoardBorder(self):
        self.canvas.create_rectangle(self.boardLeft, self.boardTop, 
                                     self.boardLeft + self.boardWidth, 
                                     self.boardTop + self.boardHeight,
                                     outline='black', 
                                     width=2 * self.cellBorderWidth)

    def drawCell(self, row, col, color):
        cellLeft, cellTop = self.getCellLeftTop(row, col)
        cellWidth, cellHeight = self.getCellSize()
        self.canvas.create_rectangle(cellLeft, cellTop, 
                                     cellLeft + cellWidth, 
                                     cellTop + cellHeight,
                                     fill=color, 
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

if __name__ == '__main__':
    root = tk.Tk()
    root.configure(bg="white")
    game = Connect4(root)
    root.mainloop()
