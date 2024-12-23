import tkinter as tk
import random

class TetrisApp:
    def __init__(self, root):
        self.rows = 8
        self.cols = 6
        self.boardLeft = 95
        self.boardTop = 40
        self.boardWidth = 400
        self.boardHeight = 500
        self.cellBorderWidth = 2
        self.board = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        self.piece = None
        self.loadTetrisPieces()
        self.nextPieceIndex = 0
        self.loadNextPiece()
        self.isGameOver = False

        # Set up the canvas
        self.canvas = tk.Canvas(root, width=600, height=600, bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=100, pady=20)

        # Bind keys
        self.root = root
        self.root.bind("<Key>", self.onKeyPress)
        
        # Set the dropping speed
        self.stepsPerSecond = 1
        self.root.after(1000 // self.stepsPerSecond, self.onStep)
        
        self.redrawAll()

    def onStep(self):
        if self.isGameOver:
            return
        if not self.movePiece(+1, 0):
            self.placePieceOnBoard()
            self.removeFullRows()
            self.loadNextPiece()
        self.redrawAll()
        self.root.after(1000 // self.stepsPerSecond, self.onStep)

    def onKeyPress(self, event):
        key = event.keysym
        if self.isGameOver:
            return
        elif key.isdigit() and '0' <= key <= '6':
            self.loadPiece(int(key))
        elif key == 'Left':
            self.movePiece(0, -1)
        elif key == 'Right':
            self.movePiece(0, +1)
        elif key == 'Down':
            self.movePiece(+1, 0)
        elif key == 'Up':
            self.rotatePieceClockwise()
        elif key == 'space':
            self.hardDropPiece()
        self.redrawAll()

    def removeFullRows(self):
        row = 0
        fullRowCount = 0
        while row < len(self.board):
            if None not in self.board[row]:
                self.board.pop(row)
                fullRowCount += 1
            else:
                row += 1
        for _ in range(fullRowCount):
            self.board.insert(0, [None]*self.cols)

    def rotatePieceClockwise(self):
        oldPiece = self.piece
        oldTopRow = self.pieceTopRow
        oldLeftCol = self.pieceLeftCol
        self.piece = self.rotate2dListClockwise(self.piece)
        oldRows, oldCols = len(oldPiece), len(oldPiece[0])
        newRows, newCols = oldCols, oldRows
        centerRow = oldTopRow + oldRows // 2
        centerCol = oldLeftCol + oldCols // 2
        self.pieceTopRow = centerRow - newRows // 2
        self.pieceLeftCol = centerCol - newCols // 2
        if not self.pieceIsLegal():
            self.piece = oldPiece
            self.pieceTopRow = oldTopRow
            self.pieceLeftCol = oldLeftCol

    def rotate2dListClockwise(self, L):
        oldRows, oldCols = len(L), len(L[0])
        newRows, newCols = oldCols, oldRows
        M = [[None] * newCols for _ in range(newRows)]
        for oldRow in range(oldRows):
            for oldCol in range(oldCols):
                newRow = oldCol
                newCol = (newCols - 1) - oldRow
                M[newRow][newCol] = L[oldRow][oldCol]
        return M

    def hardDropPiece(self):
        while self.movePiece(+1, 0):
            pass

    def movePiece(self, drow, dcol):
        self.pieceTopRow += drow
        self.pieceLeftCol += dcol
        if self.pieceIsLegal():
            return True
        else:
            self.pieceTopRow -= drow
            self.pieceLeftCol -= dcol
            return False

    def pieceIsLegal(self):
        pieceRows, pieceCols = len(self.piece), len(self.piece[0])
        for pieceRow in range(pieceRows):
            for pieceCol in range(pieceCols):
                if self.piece[pieceRow][pieceCol]:
                    boardRow = pieceRow + self.pieceTopRow
                    boardCol = pieceCol + self.pieceLeftCol
                    if ((boardRow < 0) or (boardRow >= self.rows) or
                        (boardCol < 0) or (boardCol >= self.cols)):
                        return False
                    if self.board[boardRow][boardCol] is not None:
                        return False
        return True

    def placePieceOnBoard(self):
        pieceRows, pieceCols = len(self.piece), len(self.piece[0])
        for pieceRow in range(pieceRows):
            for pieceCol in range(pieceCols):
                if self.piece[pieceRow][pieceCol]:
                    boardRow = pieceRow + self.pieceTopRow
                    boardCol = pieceCol + self.pieceLeftCol
                    self.board[boardRow][boardCol] = self.pieceColor

    def loadNextPiece(self):
        self.loadPiece(self.nextPieceIndex)
        if not self.pieceIsLegal():
            self.isGameOver = True
        self.nextPieceIndex = (self.nextPieceIndex + 1) % len(self.tetrisPieces)

    def redrawAll(self):
        self.canvas.delete("all")
        
        # Draw the centered "Tetris" text
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 30 
        self.canvas.create_text(center_x, center_y, text='Tetris', font=('Helvetica', 20), fill='black', anchor="center")
    
        self.drawBoard()
        self.drawPiece()
        self.drawBoardBorder()

        if self.isGameOver:
            self.canvas.create_text(center_x, self.boardTop + self.boardHeight + 30, text='Game Over', font=('Helvetica', 30), fill='red', anchor="center")

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