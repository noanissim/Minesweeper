'use strict'

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




//**********************RENDER******************************** */
var styledBgc

function renderBoard(mat, selector) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object

            var cellContent = ''
            var className = `cell cell-${i}-${j}`

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



            strHTML += `<td oncontextmenu="handleRightClick(this,${i},${j},event)" class="${className} " onclick="cellClicked(this,${i},${j},event)" style="width:${100/mat.length}px; height:${100/mat.length}px; "> ${cellContent}   </td>`
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

function revealAllBombs(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (elCell.isMine) renderCell(i, j, MINE)
        }
    }
}

function checkIfIsEmpty(mat) {
    var count = 0
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            var elCell = mat[i][j]; //object
            if (elCell.isShown) count++
        }
    }
    if (count === mat.length ** 2 - gLevel.MINES) return true
    return false
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
            if ((num1 !== num2) && (num1 !== i && num2 !== j) && (num1 !== j && num2 !== i)) {
                isValid = true
                board[num1][num2].isMine = true
                board[num2][num1].isMine = true
                //the dom in the render
            }
        }
        countBombs = countBombs + 2
    }
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

    document.querySelector('.timer').innerText = `${minutes}:${seconds}:${centi}`


}

function stopTimer() {
    if (gDiff < gCurrRecord && gIsVictory) {
        gCurrRecord = gDiff
        console.log('the best record!', gCurrRecord);

    }
    // document.querySelector('h1').innerText = 'Winner!';
    // document.querySelector('.btn-reset').classList.remove('hidden');
    // bestPlayer(gName, gCurrRecord)
    clearInterval(gInterval)
}