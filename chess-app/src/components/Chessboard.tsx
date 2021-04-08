import React from 'react';
import './Chessboard.css';

const verticalAxis = [1, 2, 3, 4, 5, 6, 7, 8]
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"]

export default function Chessboard() {
    let board = []

    for (let i = horizontalAxis.length - 1; i >= 0; i--) {
        for (let j = 0; j < verticalAxis.length; j++) {
            if ((i + j) % 2 == 0) {
                board.push(
                    <div className="tile black-tile"></div>
                )
            }
            else {
                board.push(
                    <div className="tile white-tile"></div>
                )
            }

        }
    }

    return <div id="chessboard">{board}</div>
}