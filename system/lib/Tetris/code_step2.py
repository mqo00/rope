import tkinter as tk
import random

class TetrisApp:
    def __init__(self, root):
        # Board dimensions
        self.rows = 8
        self.cols = 6
        self.boardLeft = 95
        self.boardTop = 50
        self.boardWidth = 400
        self.boardHeight = 500
        self.cellBorderWidth = 2
        
        # Initialize the board as a 2D list with None values
        self.board = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        
        # Set up the canvas with refined UI
        self.canvas = tk.Canvas(root, width=self.boardWidth + self.boardLeft * 2, height=self.boardHeight + self.boardTop * 2, bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=100, pady=20)

        # Load the Tetris pieces
        self.loadTetrisPieces()

        # Load the first piece
        self.nextPieceIndex = 0
        self.loadNextPiece()

        # Bind keys
        self.root = root
        self.root.bind("<Key>", self.onKeyPress)

        # Draw the board and the first piece
        self.redrawAll()

    def onKeyPress(self, event):
        key = event.keysym
        if key.isdigit() and '0' <= key <= '6':
            self.loadPiece(int(key))

        self.redrawAll()


    def redrawAll(self):
        self.canvas.delete("all")
        
        # Draw the centered "Tetris" text
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 30 
        self.canvas.create_text(center_x, center_y, text='Tetris', font=('Helvetica', 30), fill='black', anchor="center")
  
        self.drawBoard()
        self.drawPiece()
        self.drawBoardBorder()

    def drawBoard(self):
        for row in range(self.rows):
            for col in range(self.cols):
                color = self.board[row][col]
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
                                     fill=color if color else "white", 
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

    def loadTetrisPieces(self):
        iPiece = [[True, True, True, True]]
        jPiece = [[True, False, False],
                  [True, True, True]]
        lPiece = [[False, False, True],
                  [True, True, True]]
        oPiece = [[True, True],
                  [True, True]]
        sPiece = [[False, True, True],
                  [True, True, False]]
        tPiece = [[False, True, False],
                  [True, True, True]]
        zPiece = [[True, True, False],
                  [False, True, True]]
        self.tetrisPieces = [iPiece, jPiece, lPiece, oPiece, sPiece, tPiece, zPiece]
        self.tetrisPieceColors = ['red', 'yellow', 'magenta', 'pink', 'cyan', 'green', 'orange']

    def loadNextPiece(self):
        self.loadPiece(self.nextPieceIndex)

    def loadPiece(self, pieceIndex):
        self.piece = self.tetrisPieces[pieceIndex]
        self.pieceColor = self.tetrisPieceColors[pieceIndex]
        self.pieceTopRow = 0
        pieceCols = len(self.piece[0])
        self.pieceLeftCol = (self.cols - pieceCols) // 2

    def drawPiece(self):
        pieceRows, pieceCols = len(self.piece), len(self.piece[0])
        for pieceRow in range(pieceRows):
            for pieceCol in range(pieceCols):
                if self.piece[pieceRow][pieceCol]:
                    boardRow = pieceRow + self.pieceTopRow
                    boardCol = pieceCol + self.pieceLeftCol
                    self.drawCell(boardRow, boardCol, self.pieceColor)

def main():
    root = tk.Tk()
    root.configure(bg="white")
    app = TetrisApp(root)
    root.mainloop()

main()