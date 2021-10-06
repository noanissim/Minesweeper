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
var gIsVictory
var gName

var gStartTime
var gDiff
var gCurrRecordLevel1 = Infinity
var gCurrRecordLevel2 = Infinity
var gCurrRecordLevel3 = Infinity
var gBestPlayerLevel1 = null
var gBestPlayerLevel2 = null
var gBestPlayerLevel3 = null
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

var allSteps
var stepIdx
var step
var gHintsLeft
var gSafeLeft
var gRandomBombsLocation
var gIsUndoClicked



//happens only once!!! in the beggining
if (Object.keys(localStorage).indexOf('gCurrRecordLevel1') === -1) {
    //checking if there was no play yet, if so- setting record for this level
    localStorage.setItem('gCurrRecordLevel1', '00:00:00')
}
if (Object.keys(localStorage).indexOf('gCurrRecordLevel2') === -1) {
    localStorage.setItem('gCurrRecordLevel2', '00:00:00')
}
if (Object.keys(localStorage).indexOf('gCurrRecordLevel3') === -1) {
    localStorage.setItem('gCurrRecordLevel3', '00:00:00')
}
if (Object.keys(localStorage).indexOf('gBestPlayerLevel1') === -1) {
    localStorage.setItem('gBestPlayerLevel1', 'null')
}
if (Object.keys(localStorage).indexOf('gBestPlayerLevel2') === -1) {
    localStorage.setItem('gBestPlayerLevel2', 'null')
}
if (Object.keys(localStorage).indexOf('gBestPlayerLevel3') === -1) {
    localStorage.setItem('gBestPlayerLevel3', 'null')
}


function init() {
    //model
    gBoard = buildBoard()
    //dom
    renderBoard(gBoard, '.board-container')

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gClicksTotal = 0
    gGame.markedCount = 0
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
    step = {}
    gHintsLeft = 3
    gSafeLeft = 3
    gRandomBombsLocation = []
    gIsUndoClicked = false



    document.querySelector('.flag span').innerText = gLevel.MINES;
    document.querySelector('h4').classList.add('hide');
    document.querySelector('.timer').innerText = `00:00:00`
    document.querySelector('.life span').innerText = gHearts;
    document.querySelector('.restart span').innerText = '😁'
    document.querySelector('.hint').innerText = '💡';
    document.querySelector('.hint').innerText = '💡';
    document.querySelector('.hint').innerText = '💡';
    document.querySelector('.safe').innerText = '🆗';
    document.querySelector('.safe').innerText = '🆗';
    document.querySelector('.safe').innerText = '🆗';
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
    elBtn.innerText = `Click to pose the ${gLevel.MINES} bombs`
}


function sevenBoom(elBtn) {
    restart()
    gIsPlayBoom = true
}

function undoStep() {
    gIsUndoClicked = true
    var lastStep = allSteps.pop() //the last step object

    //all the steps without the recent one
    gBoard = buildBoard()
    gBoard = locateBombs(gBoard)
    //all the steps are supposed to be eareased but the bombs stay
    gGame.shownCount = 0
    gGame.markedCount = 0
    setMinesNegsCount(gBoard)
    for (var x = 0; x < allSteps.length; x++) {
        if (allSteps[x].content.isMarked) {
            cellMarked(allSteps[x].coord.i, allSteps[x].coord.j)
        } else {
            cellClicked(allSteps[x].coord.i, allSteps[x].coord.j)
        }
        gHintsLeft = allSteps[x].hints
        gLife = allSteps[x].life
        gSafeLeft = allSteps[x].safe
    }
    renderBoard(gBoard, '.board-container')

    //checking if the last step was mine/safe/hint
    if (lastStep.content.isMine) gHearts = renderEmojies(gLife, '❤️')
    else if (lastStep.hints < allSteps[x - 1].hints) {
        var allHints = document.querySelectorAll('.hint')
        for (var i = 0; i < allHints.length; i++) {
            if (allHints[i].style.display = 'none') {
                allHints[i].style.display = 'inline-block'
                break
            }
        }
    }
    if (lastStep.safe < allSteps[x - 1].safe) {
        var allSafe = document.querySelectorAll('.safe')
        for (var i = 0; i < allSafe.length; i++) {
            if (allSafe[i].style.display = 'none') {
                allSafe[i].style.display = 'inline-block'
                break
            }
        }
    }


    gIsUndoClicked = false
}


function createStep(i, j) {
    step = {
        coord: {
            i: i,
            j: j
        },
        content: gBoard[i][j],
        hints: gHintsLeft,
        life: gLife,
        safe: gSafeLeft

    }
    return step
}


function createSteps(i, j) {
    stepIdx++
    allSteps.push(createStep(i, j))
}


function cellClicked(i, j) {

    if (!gIsUndoClicked) createSteps(i, j)

    if (gIsPlayManual) {
        gWasPlayManual = true
        if (countBombManualPlace === 0) {
            gBoard = buildBoard()
        }
        if (countBombManualPlace < gLevel.MINES) {
            //only when button 'play manually' is hitten
            document.querySelector('.flag span').innerText = gLevel.MINES - countBombManualPlace - 1;
            changBgcToCell(i, j, 'rgb(235, 150, 54)')
            gBoard[i][j].isMine = true
            countBombManualPlace++
            gGame.shownCount = 0
        }
        if (countBombManualPlace === gLevel.MINES) {
            changBgcToCell(i, j, 'rgb(235, 150, 54)')
            setTimeout(function () {
                setMinesNegsCount(gBoard)
                renderBoard(gBoard, '.board-container')
                startTimer()
                gIsPlayManual = false
                countBombManualPlace = 0
                document.querySelector('.flag span').innerText = gLevel.MINES
                return
            }, 200)

        }

    }
    if (gIsPlayManual) return


    if (gIsPlayBoom) {
        gWasPlayBoom = true
        if (countBombBoomPlace === 0) {
            gBoard = buildBoardBoom()
            countBombBoomPlace++
        } else {
            setMinesNegsCount(gBoard)
            renderBoard(gBoard, '.board-container')
            startTimer()
            gIsPlayBoom = false
        }
    }

    if (gBoard[i][j].isMarked && !gIsUndoClicked) return

    if (gIsHintRevealed) {
        gBoard[i][j].isShown = false
        if (gBoard[i][j].isMine) gLife++
        expandShown(gBoard, i, j) //reveal
        setTimeout(function () { //close
            closeShown(gBoard, i, j)
            gBoard[i][j].isShown = false
            gIsHintRevealed = false
        }, 1000)
    }

    gGame.shownCount++
    gBoard[i][j].isShown = true
    gClicksTotal++


    if (gGame.shownCount === 1 && gGame.markedCount === 0 && !gIsUndoClicked) {

        if (!gWasPlayManual && !gWasPlayBoom) {
            randomBombs(gBoard, gLevel.SIZE, gLevel.MINES, i, j)
            startTimer()

        }
        setMinesNegsCount(gBoard)
        renderBoard(gBoard, '.board-container')
    }

    renderBoard(gBoard, '.board-container')

    if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isShown) {
        expandShownRecursion(gBoard, i, j)
    }
    document.querySelector('.restart span').innerText = (gLife === 3) ? '😁' : '😵'

    if (gBoard[i][j].isMine && gLevel.SIZE > 5) {

        if (gLife > 1) {
            gLife--
            gHearts = renderEmojies(gLife, '❤️')
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
    cellMarked(i, j)
}


function cellMarked(i, j) {

    if (gGame.markedCount === gLevel.MINES) return

    if (gBoard[i][j].isShown && !gIsUndoClicked) return

    if (!gIsUndoClicked) createSteps(i, j)

    if (gGame.shownCount === 0 && gGame.markedCount === 1) {
        startTimer()
    }

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    }


    document.querySelector('.flag span').innerText = gLevel.MINES - gGame.markedCount;
    checkGameOver()
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

function openHelp() {
    document.querySelector('.modalHelp').style.display = 'block'

}


function closeModal() {
    document.querySelector('.showRecordsTable').style.display = 'none'
    document.querySelector('.modal, .modalHelp').style.display = 'none'
}

function showRecords() {
    document.querySelector('.showRecordsTable').style.display = 'block';

    document.querySelector('.showRecordsTable .nameLevel1').innerText = localStorage.getItem('gBestPlayerLevel1')
    document.querySelector('.showRecordsTable .recordLevel1').innerText = localStorage.getItem('gCurrRecordLevel1')

    document.querySelector('.showRecordsTable .nameLevel2').innerText = localStorage.getItem('gBestPlayerLevel2')
    document.querySelector('.showRecordsTable .recordLevel2').innerText = localStorage.getItem('gCurrRecordLevel2')

    document.querySelector('.showRecordsTable .nameLevel3').innerText = localStorage.getItem('gBestPlayerLevel3')
    document.querySelector('.showRecordsTable .recordLevel3').innerText = localStorage.getItem('gCurrRecordLevel3')
}

function openInput() {
    gName = prompt('Enter your name')
    closeModal()
}


function loseGame() {
    revealAllBombs(gBoard)
    stopTimer()
    document.querySelector('h4').classList.remove('hide');
    document.querySelector('h4').innerText = 'You Loose!';
    gGame.isOn = false
    document.querySelector('.restart span').innerText = '😭'
    openModal()
}


function hintClicked(elHint) {
    if (gGame.shownCount < 1) return
    gHintsLeft--
    gIsHintRevealed = true
    setTimeout(function () {
        elHint.style.display = 'none'
    }, 2000)
}


function safeClicked(elSafe) {
    if (gGame.shownCount < 1) return
    gSafeLeft--
    gIsSafeRevealed = true
    setTimeout(function () {
        elSafe.style.display = 'none'
    }, 2000)

    var coord = getSafePlace(gBoard)
    document.querySelector(`.cell-${coord.i}-${coord.j}`).style.backgroundColor = '#FCFFA6'

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
        }
    }
}


function changeLevel(elBtn) {
    var level = elBtn.innerText
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