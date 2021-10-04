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
var gIsVictory

var gStartTime
var gDiff
var gCurrRecord = Infinity
var gInterval
var gLife
var gHearts

function init() {
    //model
    gBoard = buildBoard()
    // console.table(gBoard)
    //dom
    renderBoard(gBoard, '.board-container')

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gClicksTotal = 0
    gFlagsTotal = 0
    gIsVictory = false
    gLife = 3
    gHearts = '❤❤❤'


    document.querySelector('.flag span').innerText = gLevel.MINES;
    document.querySelector('h4').classList.add('hide');
    document.querySelector('.timer').innerText = `00:00:00`
    // document.querySelector('.restart').classList.add('hide');
    document.querySelector('.life span').innerText = gHearts;
    document.querySelector('.restart span').innerText = '😁'



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

    return board;
}



function cellClicked(elCell, i, j, ev) {

    if (gBoard[i][j].isMarked) {
        return
    }


    gGame.shownCount++
    // console.log(gGame.shownCount);
    if (gGame.shownCount === 1 && gGame.markedCount === 0) {
        console.log('first click');
        randomBombs(gBoard, gLevel.SIZE, gLevel.MINES, i, j)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard, '.board-container')
        startTimer()

    }
    gBoard[i][j].isShown = true


    renderBoard(gBoard, '.board-container')
    //the model td content will be empty, the dom td content is filled
    // console.log(elCell);
    gClicksTotal++

    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)
    }

    if (gBoard[i][j].isMine && gLevel.SIZE > 5) {
        if (gLife === 3) {
            gLife--
            gHearts = '❤❤'
        } else if (gLife === 2) {
            gLife--
            gHearts = '❤'
        } else if (gLife === 1) {
            gLife--
            gHearts = ''
            gIsVictory = false
            loseGame()
        }

    } else if (gBoard[i][j].isMine) {
        gIsVictory = false
        loseGame()
    }
    document.querySelector('.life span').innerText = gHearts;

    checkGameOver()
}


function handleRightClick(elCell, i, j, ev) {
    ev.preventDefault()
    cellMarked(elCell, i, j)
}


function cellMarked(elCell, i, j) {

    if (gFlagsTotal === gLevel.MINES) return

    gGame.markedCount++
    if (gGame.shownCount === 0 && gGame.markedCount === 1) {
        console.log('first right click');
        startTimer()
    }

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gFlagsTotal++
    } else {
        gBoard[i][j].isMarked = false
        gFlagsTotal--
    }
    document.querySelector('.flag span').innerText = gLevel.MINES - gFlagsTotal;
    checkGameOver()
    // console.log('gFlagsTotal', gFlagsTotal);
    renderBoard(gBoard, '.board-container')
}


function restart() {
    stopTimer()
    init()
}

function checkGameOver() {
    if (gFlagsTotal === gLevel.MINES && checkIfIsEmpty(gBoard)) {
        gIsVictory = true
        winGame()
    }

}

function winGame() {
    stopTimer()
    console.log('success! game over! you win!');
    document.querySelector('h4').classList.remove('hide');
    document.querySelector('h4').innerText = 'You Win!';
    gGame.isOn = false
    document.querySelector('.restart span').innerText = '😎'

}

function loseGame() {
    revealAllBombs(gBoard)
    stopTimer()
    console.log('You loose!!!');
    document.querySelector('h4').classList.remove('hide');
    document.querySelector('h4').innerText = 'You Loose!';
    gGame.isOn = false
    document.querySelector('.restart span').innerText = '😭'
    // document.querySelector('.restart').classList.remove('hide');

}



function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var countBombsNegs = countNeighbors(i, j, board)
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