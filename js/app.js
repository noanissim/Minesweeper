'use strict'

var gBoard
var EMPTY = ''
var MINE = '💣'
var FLAG = '🚩'


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gClicksTotal
var gFlagsTotal


function init() {
    //model
    gBoard = buildBoard()
    console.table(gBoard)
    //dom
    renderBoard(gBoard, '.board-container')

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gClicksTotal = 0
    gFlagsTotal = 0

    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    document.querySelector('h3 span').innerText = gLevel.MINES;

}



function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    randomBombs(board, gLevel.SIZE, gLevel.MINES)
    return board;
}








function cellClicked(elCell, i, j, ev) {

    gBoard[i][j].isShown = true

    renderBoard(gBoard, '.board-container')
    //the model td content will be empty, the dom td content is filled
    // console.log(elCell);
    gClicksTotal++

    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)
    }

    if (gBoard[i][j].isMine) {

    }

    checkGameOver()

    // if (gClicksTotal === 1) {
    //     //the first cell click:
    //     //setting it as empty cell-model+dom
    //     //negs- empty/number
    //     //setting level bombs in other places

    // }

}

function handleRightClick(elCell, i, j, ev) {
    ev.preventDefault()
    cellMarked(elCell, i, j)
}

function cellMarked(elCell, i, j) {
    // gClicksTotal++
    // if()
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gFlagsTotal++
    } else {
        gBoard[i][j].isMarked = false
        gFlagsTotal--
    }
    document.querySelector('h3 span').innerText = gLevel.MINES - gFlagsTotal;
    checkGameOver()
    // console.log('gFlagsTotal', gFlagsTotal);
    renderBoard(gBoard, '.board-container')
}




function checkGameOver() {
    if (gFlagsTotal === gLevel.MINES && gClicksTotal === gLevel.SIZE ** 2 - gLevel.MINES) {
        console.log('success! game over! you win!');
        init()
    }

}


function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var countBombsNegs = countNeighbors(i, j, board)
            // console.log(i, j, countBombsNegs);
            //model
            board[i][j].minesAroundCount = countBombsNegs
            //dom
            // if (countBombsNegs > 0 || board[i][j].isMine === false) renderCell(i, j, countBombsNegs)
        }
    }
}


function changeLevel(elBtn) {

    // console.log(elBtn);
    var level = elBtn.innerText
    // console.log(level);
    if (level === 'Middle') {
        gLevel.SIZE = 8
        gLevel.MINES = 12
    } else if (level === 'Extreme') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
    } else {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    init()
}