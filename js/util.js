'use strict'

//**********************RENDER******************************** */

function renderBoard(mat, selector) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object

            var cellContent = ''
            var className = `cell cell-${i}-${j}`
            var size = 360 / mat.length

            if (elCell.isShown) {
                cellContent = elCell.minesAroundCount //number/0
                if (elCell.isMine === true) {
                    cellContent = '💣' //the bomb itself
                    className += ' mine'
                } else if (elCell.minesAroundCount > 0) {
                    className += ' number'
                } else if (elCell.minesAroundCount === 0) {
                    cellContent = '' //no bombs around-empty
                    className += ' empty'
                }
            }

            if (elCell.isMarked) {
                cellContent = FLAG
            }

            strHTML += `<td oncontextmenu="handleRightClick(this,${i},${j},event)" class="${className} " onclick="cellClicked(this,${i},${j},event)" style="width:${360/mat.length}px; height:${360/mat.length}px; "> ${cellContent}   </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}



// location such as: cell-i-j
function renderCell(i, j, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    elCell.innerHTML = value;
}


function changBgcToCell(i, j, color) {
    document.querySelector(`.cell-${i}-${j}`).style.backgroundColor = color
}


//create empty mat
function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}



//********************UTILS FUNCTION MADE SPECIFICALLY FOR THIS QUESTION*********************************************** */
function revealAllBombs(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (elCell.isMine) renderCell(i, j, MINE)
        }
    }
}


function countNoMineCells(mat) {
    var count = 0
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (elCell.isShown && !elCell.isMine) count++
        }
    }
    if (count === mat.length ** 2 - gLevel.MINES) return true
    return false
}


function countMineMarkedCells(mat) {
    var count = 0
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if ((elCell.isMarked && elCell.isMine) || (elCell.isMine && gLife > 0)) {
                count++
                console.log({
                    i,
                    j
                });
            }
        }
    }
    if (count === gLevel.MINES) return true
    return false
}


function getEmptyCells(mat) {
    var empties = []
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (elCell.minesAroundCount === 0) empties.push(elCell)
        }
    }
    return empties
}


function getSafePlace(mat) {
    var empties = []
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (!elCell.isMine && !elCell.isShown) empties.push({
                i: i,
                j: j
            })
        }
    }
    var randIdx = getRandomInt(0, empties.length)

    console.log('empties[randIdx]', empties[randIdx]);
    return empties[randIdx]
}


function buildBoardBoom() {
    var board = [];
    var countCells = 0
    var countCellsStr = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            countCells++
            countCellsStr = countCells + ''
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            if ((countCells % 7 === 0) || countCellsStr.includes('7')) {
                board[i][j].isMine = true
            }
        }
    }

    return board;
}


//***********************RANDOM NUM/COLOR********************************** */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}




//*********************************NEIGHBORS****************************************** */
function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}


function randomBombs(board, size, numOfBombs, i, j) {
    var countBombs = 0
    while (countBombs < numOfBombs) {
        var isValid = false
        while (!isValid) {
            var num1 = getRandomInt(0, size)
            var num2 = getRandomInt(0, size)
            if ((num1 !== i && num2 !== j) && (num1 !== j && num2 !== i)) {
                if (!board[num1][num2].isMine) {
                    isValid = true
                    board[num1][num2].isMine = true
                    // board[num2][num1].isMine = true
                    //the dom in the render
                    countBombs++
                }
            }
        }
    }
    return countBombs
}


function expandShown(mat, elCell, cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            gBoard[i][j].isShown = true
            gGame.shownCount++
            gClicksTotal++
            renderBoard(gBoard, '.board-container')
        }
    }
    return gGame.shownCount - 1
}



//***************************RECURSION*********************************** */
function expandShownRecursion(mat, elCell, cellI, cellJ) {

    var coordI
    var coordJ

    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {

            if (i === 0 && j === 0) continue;
            coordI = cellI + i //the row before,the same,after
            coordJ = cellJ + j //the col before,the same,after
            // debugger

            if ((coordI >= 0 && coordI < mat.length) && (coordJ >= 0 && coordJ < mat[0].length)) {
                //checking im not offset
                if (mat[coordI][coordJ].isShown === false) {
                    //reveal the td-this is for the numbers around and the empties
                    mat[coordI][coordJ].isShown = true //reveal it
                    gGame.shownCount++
                    gClicksTotal++
                    renderBoard(gBoard, '.board-container')

                    if (mat[coordI][coordJ].minesAroundCount === 0) {
                        //its an empty tile-i call the recursion
                        expandShownRecursion(mat, elCell, coordI, coordJ)
                    }
                }
            }
        }
    }
}



function closeShown(mat, elCell, cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            gBoard[i][j].isShown = false
            gGame.shownCount--
            gClicksTotal--
            renderBoard(gBoard, '.board-container')
        }
    }
    // return gGame.shownCount - 1
}




//**********************TIMER************************************** */
function startTimer() {

    gStartTime = Date.now()
    // console.log('gStartTime', gStartTime);
    gInterval = setInterval(updateTime, 20)
}

function updateTime() {
    var currTime = Date.now()
    gDiff = currTime - gStartTime
    var centi = Math.floor((gDiff % 1000) / 10)
    var seconds = Math.floor((gDiff % (1000 * 60)) / 1000)
    var minutes = Math.floor((gDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (centi < 10) centi = '0' + centi
    if (seconds < 10) seconds = '0' + seconds
    if (minutes < 10) minutes = '0' + minutes

    document.querySelector('.timer').innerText = `${minutes}:${seconds}:${centi}`
}

function stopTimer() {
    // if (gDiff < gCurrRecord && gIsVictory) {
    //     gCurrRecord = gDiff
    //     console.log('the best record!', gCurrRecord);

    // }
    // document.querySelector('.btn-reset').classList.remove('hidden');
    // bestPlayer(gName, gCurrRecord)
    clearInterval(gInterval)
}


function checkRecord() {
    if (gLevel.SIZE === 4) {
        if (gDiff < gCurrRecordLevel1 && gIsVictory) {
            gCurrRecordLevel1 = gDiff
            localStorage.setItem('gCurrRecordLevel1', JSON.stringify(convertToTime(gCurrRecordLevel1)))
            document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel1');
        }

    } else if (gLevel.SIZE === 8) {
        if (gDiff < gCurrRecordLevel2 && gIsVictory) {
            gCurrRecordLevel2 = gDiff
            localStorage.setItem('gCurrRecordLevel2', JSON.stringify(convertToTime(gCurrRecordLevel2)))
            document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel2');

        }

    } else if (gLevel.SIZE === 12) {
        if (gDiff < gCurrRecordLevel3 && gIsVictory) {
            gCurrRecordLevel3 = gDiff
            localStorage.setItem('gCurrRecordLevel3', JSON.stringify(convertToTime(gCurrRecordLevel3)))
            document.querySelector('.record span').innerText = localStorage.getItem('gCurrRecordLevel3')

        }
    }
}


function convertToTime(recordTime) {
    var centi = Math.floor((recordTime % 1000) / 10)
    var seconds = Math.floor((recordTime % (1000 * 60)) / 1000)
    var minutes = Math.floor((recordTime % (1000 * 60 * 60)) / (1000 * 60))

    if (centi < 10) centi = '0' + centi
    if (seconds < 10) seconds = '0' + seconds
    if (minutes < 10) minutes = '0' + minutes

    var str = minutes + ':' + seconds + ':' + centi
    console.log(str);
    return str
}