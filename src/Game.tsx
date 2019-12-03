import React from 'react';
import './Game.css';

const CELL_SIZE = 10;
const WIDTH = 800;
const HEIGHT = 600;

export class Cell extends React.Component<{ x: number, y: number}> {
    render() {
        const { x, y } = this.props;
        return (
            <div className="Cell"
                style={{
                    left: `${CELL_SIZE * x + 1}px`,
                    top: `${CELL_SIZE * y + 1}px`,
                    width: `${CELL_SIZE - 1}px`,
                    height: `${CELL_SIZE - 1}px`,
                }}
            />
        );
    };
}


class Game extends React.Component {
    rows = HEIGHT / CELL_SIZE;
    cols = WIDTH / CELL_SIZE;
    board = this.makeEmptyBoard();
    boardRef: any;
    timeoutHandler: any;

    state = {
        cells: [] as {x: number, y: number, key: string}[],
        interval: 100,
        isRunning: false
    }

    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stopGame = () => {
        this.setState( { isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value })
    }

    calculateNeighbors(board: boolean[][], x: number, y: number): number {
        let neighbors = 0;
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1])
                neighbors++;
        }
        return neighbors;
    }

    runIteration() {
        console.log("running iteration");
        let newBoard = this.makeEmptyBoard();
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    newBoard[y][x] = (neighbors === 2 || neighbors === 3);
                } else if (!this.board[y][x] && neighbors === 3) {
                    newBoard[y][x] = true;
                }
            }
        }
        this.board = newBoard;
        this.setState({ cells: this.makeCells() });
        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    makeEmptyBoard() {
        let board: boolean[][] = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }
        return board;
    }

    clearBoard() {
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
    }

    makeCells() {
        let cells: {x: number, y: number}[] = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop
        };
    }

    handleClick = (event: { clientX: number; clientY: number; }) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({ cells: this.makeCells() });
    }

    render() {
        const { cells } = this.state;
        return (
            <div>
                <div className="Board"
                    style= {{
                        width: WIDTH, 
                        height: HEIGHT,
                        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                        marginTop: 20
                    }} onClick={this.handleClick}
                    ref={(n) => { this.boardRef = n; }}>
                        {cells.map(cell => (
                            <Cell x={cell.x} y={cell.y}
                            key={`${cell.x},${cell.y}`}/>
                        ))}
                </div>

                <div className="controls">
                    Update every <input value={this.state.interval}
                        onChange={this.handleIntervalChange} /> msec
                    {this.state.isRunning ?
                        <button className="button"
                        onClick={this.stopGame}>Stop</button> : 
                        <button className="button"
                        onClick={this.runGame}>Run</button>
                    }
                    <button className="button"
                    onClick={() => this.clearBoard()}>Clear</button>
                </div>
            </div>
        );
    }
}

export default Game;
