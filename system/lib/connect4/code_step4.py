import tkinter as tk
from tkinter import messagebox
import math

class Connect4:
    def __init__(self, root):
        self.root = root
        self.rows = 6
        self.cols = 7
        self.boardLeft = 95
        self.boardTop = 120
        self.boardWidth = 400
        self.boardHeight = 350
        self.cellBorderWidth = 2
        self.resetApp()

        # Set up the canvas with refined UI
        self.canvas = tk.Canvas(root, width=self.boardWidth + self.boardLeft * 2, 
                                height=self.boardHeight + self.boardTop * 2 + 50, 
                                bg="white", highlightthickness=0)
        self.canvas.pack(side=tk.LEFT, padx=100, pady=20)
        self.canvas.bind("<Button-1>", self.onMousePress)
        self.canvas.bind("<Motion>", self.onMouseMove)
        self.root.bind("<Key>", self.onKeyPress)

        self.redrawAll()

    def resetApp(self):
        self.selection = None
        self.board = [[None] * self.cols for _ in range(self.rows)]
        self.turn = 'X'
        self.message = "X's turn"
        self.turnCount = 0
        self.gameOver = False
        self.winningCells = None

    def onKeyPress(self, event):
        if self.gameOver and event.char == 'r':
            self.resetApp()
            self.redrawAll()

    def onMousePress(self, event):
        self.selection = None
        if not self.gameOver:
            cell = self.getCell(event.x, event.y)
            if cell is not None:
                row, col = cell
                if self.board[0][col] is None:
                    self.makeMove(col)
                    self.redrawAll()

    def onMouseMove(self, event):
        selectedCell = self.getCell(event.x, event.y)
        if selectedCell is None:
            self.selection = None
        else:
            row, col = selectedCell
            if self.board[0][col] is None:
                self.selection = selectedCell
            else:
                self.selection = None
        self.redrawAll()

    def makeMove(self, col):
        row = self.findLowestEmptyRow(col)
        self.board[row][col] = self.turn
        self.turnCount += 1
        self.checkForGameOver()
        if not self.gameOver:
            self.changeTurns()
        self.redrawAll()

    def findLowestEmptyRow(self, col):
        row = self.rows - 1
        while self.board[row][col] is not None:
            row -= 1
        return row

    def checkForGameOver(self):
        directions = [
            (0, 1),  # right
            (1, 0),  # down
            (1, 1),  # right-down diagonal
            (1, -1)  # right-up diagonal
        ]
        for startRow in range(self.rows):
            for startCol in range(self.cols):
                for dRow, dCol in directions:
                    winner = self.checkForWin(startRow, startCol, dRow, dCol)
                    if winner is not None:
                        self.gameOver = True
                        self.message = f'{winner} wins!'
                        self.winningCells = [(startRow + i * dRow, startCol + i * dCol) for i in range(4)]
                        return
        if self.turnCount == self.rows * self.cols:
            self.gameOver = True
            self.message = 'Tie game!'

    def checkForWin(self, startRow, startCol, dRow, dCol):
        player = self.board[startRow][startCol]
        if player is None:
            return None
        winLength = 4
        winningCells = []
        for i in range(winLength):
            row = startRow + i * dRow
            col = startCol + i * dCol
            if row < 0 or row >= self.rows or col < 0 or col >= self.cols:
                return None
            if self.board[row][col] != player:
                return None
            winningCells.append((row, col))
        self.winningCells = winningCells
        return player

    def changeTurns(self):
        self.turn = 'O' if self.turn == 'X' else 'X'
        self.message = f"{self.turn}'s turn"

    def redrawAll(self):
        self.canvas.delete("all")
        self.drawTitle()
        self.drawAppMessage()
        self.drawBoard()
        self.drawBoardBorder()
        self.drawWinningLine()

    def drawTitle(self):
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 40  # Adjust to keep title above the board
        self.canvas.create_text(center_x, center_y, text='Connect4', 
                                font=('Helvetica', 30), fill='black', anchor="center")

    def drawAppMessage(self):
        center_x = self.boardLeft + self.boardWidth / 2
        center_y = self.boardTop - 10
        color = 'red' if self.gameOver else 'black'
        message = self.message + ' (press r to restart)' if self.gameOver else self.message
        self.canvas.create_text(center_x, center_y, text=message, 
                                font=('Arial', 14), fill=color, anchor="center")

    def drawBoard(self):
        for row in range(self.rows):
            for col in range(self.cols):
                self.drawCell(row, col)

    def drawBoardBorder(self):
        self.canvas.create_rectangle(
            self.boardLeft, self.boardTop,
            self.boardLeft + self.boardWidth, self.boardTop + self.boardHeight,
            outline='black', width=2*self.cellBorderWidth
        )

    def drawCell(self, row, col):
        cellLeft, cellTop = self.getCellLeftTop(row, col)
        cellWidth, cellHeight = self.getCellSize()
        selectedCol = None if self.selection is None else self.selection[1]
        color = 'cyan' if col == selectedCol else 'white'
        self.canvas.create_rectangle(
            cellLeft, cellTop, cellLeft + cellWidth, cellTop + cellHeight,
            fill=color, outline='black', width=self.cellBorderWidth
        )
        label = self.board[row][col]
        if label is not None:
            cx = cellLeft + cellWidth / 2
            cy = cellTop + cellHeight / 2
            self.canvas.create_text(cx, cy, text=label, font=('Arial', 24, 'bold'))

    def drawWinningLine(self):
        if self.winningCells is not None:
            cx0, cy0 = self.getCellCenter(self.winningCells[0])
            cx1, cy1 = self.getCellCenter(self.winningCells[-1])
            self.canvas.create_line(cx0, cy0, cx1, cy1, fill='red', width=2)

    def getCell(self, x, y):
        dx = x - self.boardLeft
        dy = y - self.boardTop
        cellWidth, cellHeight = self.getCellSize()
        row = math.floor(dy / cellHeight)
        col = math.floor(dx / cellWidth)
        if 0 <= row < self.rows and 0 <= col < self.cols:
            return (row, col)
        else:
            return None

    def getCellLeftTop(self, row, col):
        cellWidth, cellHeight = self.getCellSize()
        cellLeft = self.boardLeft + col * cellWidth
        cellTop = self.boardTop + row * cellHeight
        return (cellLeft, cellTop)

    def getCellCenter(self, cell):
        row, col = cell
        cellLeft, cellTop = self.getCellLeftTop(row, col)
        cellWidth, cellHeight = self.getCellSize()
        cx = cellLeft + cellWidth / 2
        cy = cellTop + cellHeight / 2
        return cx, cy

    def getCellSize(self):
        cellWidth = self.boardWidth / self.cols
        cellHeight = self.boardHeight / self.rows
        return (cellWidth, cellHeight)

if __name__ == '__main__':
    root = tk.Tk()
    root.configure(bg="white")
    game = Connect4(root)
    root.mainloop()
