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
var gCurrRecordLevel1 = Infinity
var gCurrRecordLevel2 = Infinity
var gCurrRecordLevel3 = Infinity
var gInterval
var gLife
var gHearts
var gIsHintRevealed
var gIsSafeRevealed
var gIsPlayManual
var gWasPlayManual
var gIsPlayBoom
var gWasPlayBoom
var countBombManualPlace = 0
var countBombBoomPlace = 0

var allSteps = []
var stepIdx = -1;
var step = {
    coord: {
        i: 0,
        j: 0
    },
    content: '',
    isMine: false,

}



//happens only once!!! in the beggining
if (Object.keys(localStorage).indexOf('gCurrRecordLevel1') === -1) {
    //checking if there was no play yet, if so- setting record for this level
    // localStorage.setItem('gCurrRecordLevel1', JSON.stringify(convertToTime(gCurrRecordLevel1)))
    localStorage.setItem('gCurrRecordLevel1', '00:00:00')
}
if (Object.keys(localStorage).indexOf('gCurrRecordLevel2') === -1) {
    localStorage.setItem('gCurrRecordLevel2', '00:00:00')
}
if (Object.keys(localStorage).indexOf('gCurrRecordLevel3') === -1) {
    localStorage.setItem('gCurrRecordLevel3', '00:00:00')
}


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
    gHearts = '❤️❤️❤️'
    gIsHintRevealed = false
    gIsSafeRevealed = false
    gIsPlayManual = false
    gWasPlayManual = false
    gIsPlayBoom = false
    gWasPlayBoom = false

    allSteps = []
    stepIdx = -1;
    step = {
        coord: {
            i: 0,
            j: 0
        },
        content: '',
        isMine: false,

    }


    document.querySelector('.flag span').innerText = gLevel.MINES;
    document.querySelector('h4').classList.add('hide');
    document.querySelector('.timer').innerText = `00:00:00`
    document.querySelector('.life span').innerText = gHearts;
    document.querySelector('.restart span').innerText = '😁'
    document.querySelector('.hint .hint1').innerText = '💡';
    document.querySelector('.hint .hint2').innerText = '💡';
    document.querySelector('.hint .hint3').innerText = '💡';
    document.querySelector('.safe .safe1').innerText = '🆗';
    document.querySelector('.safe .safe2').innerText = '🆗';
    document.querySelector('.safe .safe3').innerText = '🆗';
    document.querySelector('.modal').style.display = 'none'
    document.querySelector('.manual').innerText = 'Play Manually';
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


function playManual(elBtn) {
    restart()
    gIsPlayManual = true
    elBtn.innerText = `LC to pose the ${gLevel.MINES} bombs`
}


function sevenBoom(elBtn) {
    restart()
    gIsPlayBoom = true
}


function cellClicked(elCell, i, j, ev) {

    // console.log(elCell);

    if (gIsPlayManual) {
        gWasPlayManual = true
        if (countBombManualPlace === 0) {
            gBoard = buildBoard()
            console.log(gBoard);
        }
        if (countBombManualPlace < gLevel.MINES) {
            // debugger
            //only when button 'play manually' is hitten
            gBoard[i][j].isMine = true
            countBombManualPlace++
            console.log(countBombManualPlace);
            gGame.shownCount = 0
        }
        if (countBombManualPlace === gLevel.MINES) {
            setMinesNegsCount(gBoard)
            renderBoard(gBoard, '.board-container')
            startTimer()
            gIsPlayManual = false
            countBombManualPlace = 0
            return
        }

    }
    if (gIsPlayManual) return


    if (gIsPlayBoom) {
        gWasPlayBoom = true
        if (countBombBoomPlace === 0) {
            gBoard = buildBoardBoom()
            console.log(gBoard);
            countBombBoomPlace++
        } else {
            setMinesNegsCount(gBoard)
            renderBoard(gBoard, '.board-container')
            startTimer()
            gIsPlayBoom = false

        }

    }

    if (gBoard[i][j].isMarked) {
        return
    }

    if (gIsHintRevealed) {
        gBoard[i][j].isMarked = false
        if (gBoard[i][j].isMine) gLife++

        //reveal
        expandShown(gBoard, elCell, i, j)

        setTimeout(function () {
            //close
            closeShown(gBoard, elCell, i, j)
            gBoard[i][j].isShown = false
            gIsHintRevealed = false
        }, 1000)
    }

    gGame.shownCount++
    gBoard[i][j].isShown = true
    gClicksTotal++


    if (gGame.shownCount === 1 && gGame.markedCount === 0) {
        console.log('first click');

        if (!gWasPlayManual && !gWasPlayBoom) {
            randomBombs(gBoard, gLevel.SIZE, gLevel.MINES, i, j)
            startTimer()

        }
        setMinesNegsCount(gBoard)
        renderBoard(gBoard, '.board-container')
    }

    renderBoard(gBoard, '.board-container')
    //the model td content will be empty, the dom td content is filled


    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isShown) {
        expandShownRecursion(gBoard, elCell, i, j)
    }

    if (gBoard[i][j].isMine && gLevel.SIZE > 5) {
        if (gLife === 3) {
            gLife--
            gHearts = '❤️❤️'
        } else if (gLife === 2) {
            gLife--
            gHearts = '❤️'
        } else if (gLife === 1) {
            gLife--
            gHearts = ''
            gIsVictory = false
            loseGame()
        }

    } else if (gBoard[i][j].isMine && !gIsHintRevealed && !gIsPlayManual) {
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
    if (countNoMineCells(gBoard) && countMineMarkedCells(gBoard)) {
        gIsVictory = true
        winGame()
    }
}


function winGame() {
    stopTimer()
    checkRecord()
    console.log('success! game over! you win!');
    document.querySelector('h4').classList.remove('hide');
    document.querySelector('h4').innerText = 'You Win!';
    gGame.isOn = false
    document.querySelector('.restart span').innerText = '😎'
    openModal()
}


function openModal() {
    document.querySelector('.modal').style.display = 'block'
    document.querySelector('.modal-content .time span').innerText = document.querySelector('.timer').innerText;
    document.querySelector('.modal-content .status span').innerText = document.querySelector('h4').innerText;
}


function closeModal() {
    document.querySelector('.modal').style.display = 'none'
}


function loseGame() {
    revealAllBombs(gBoard)
    stopTimer()
    console.log('You loose!!!');
    document.querySelector('h4').classList.remove('hide');
    document.querySelector('h4').innerText = 'You Loose!';
    gGame.isOn = false
    document.querySelector('.restart span').innerText = '😭'
    openModal()
    // document.querySelector('.restart').classList.remove('hide');
}


function hintClicked(elHint) {
    gIsHintRevealed = true
    console.log(elHint);
    // elHint.innerText = ''
    elHint.innerText = '✨'
    setTimeout(function () {
        elHint.innerText = ''
    }, 5000)
}


function safeClicked(elSafe) {
    gIsSafeRevealed = true
    console.log(elSafe);
    elSafe.innerText = '✨'
    setTimeout(function () {
        elSafe.innerText = ''
    }, 2000)

    var coord = getSafePlace(gBoard)
    document.querySelector(`.cell-${coord.i}-${coord.j}`).style.backgroundColor = '#FCFFA6'
    console.log(document.querySelector(`.cell-${coord.i}-${coord.j}`));

    setTimeout(function () {
        //unmark the cell
        document.querySelector(`.cell-${coord.i}-${coord.j}`).style.backgroundColor = '#e3b1b2'
    }, 1000)
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
        document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel2');

    } else if (level === 'Extreme') {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel3');

    } else {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel1');

    }
    restart()
}









// for (var i = cellI - 2; i < cellI + 2; i++) {
//     if (i < 0 || i >= mat.length) continue;
//     for (var j = cellJ - 1; j < cellJ + 2; j++) {
//         if (j < 0 || j >= mat[i].length) continue;
//         // if (i === cellI && j === cellJ) continue;
//         // debugger
//         if (!mat[i][j].isShown) {
//             mat[i][j].isShown = true
//             gGame.shownCount++
//             gClicksTotal++
//             renderBoard(gBoard, '.board-container')

//             if (mat[i][j].minesAroundCount === 0) {
//                 return expandShownRecursion(mat, elCell, i, j)

//             }

//         }

//     }
// }



// var emptyCells = getEmptyCells(board)
// var num1 = getRandomInt(0, size)
// var num2 = getRandomInt(0, size)
// if (emptyCells[num1][num2] && (num1 !== i && num2 !== j) && (num1 !== j && num2 !== i)) {
//     board[num1][num2].isMine = true
//     countBombs++
// } else continue