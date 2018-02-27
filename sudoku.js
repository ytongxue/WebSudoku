/*
 * convention:
 * 1. A small cell containing one number is called a "grid"
 * 2. 3x3 grids make up a "subregion"
 *
 * reference: https://en.wikipedia.org/wiki/Sudoku
 */

// some color definition
var oddSubregionColor = "rgb(232, 247, 232)";
var evenSubregionColor = "rgb(216, 229, 216)";
var selectedGridColor = "RGB(142,204,236)";
var selectedRowColor = "RGB(231, 242, 158)";
var selectedColumnColor = "RGB(231, 242, 158)";
var initGridTextColor = "black";
var inputGridTextColor = "blue";
var conflictInputGridTextColor = "red";
var conflictInitGridTextColor = "RGB(178,47,47)";
var currentMode = "easy";
var modeArray = [ "easy" ];
var matricesCountForEachMode = {
    "easy" : 3,
};

var gridMatrix = []; //a two dimensions array that holds Grid objects
var currentSelectedGridObj = null;
var prevInitMatrixIndex = null;
var histories = []; //array of Operation objects

var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
}

var Grid = function(x, y) {
    this.coordinate = new Coordinate(x, y);
    this.bIsInitGrid = false;
    this.tdElement = null; //jQuery object of <td> element
};

var Operation = function() {
    this.gridObj = null;
    this.originalValue = "";
    this.newValue = "";
    this.time = null;
}

function getSugregionIndex(coordinate)
{
    return Math.floor(coordinate.y / 3) * 3 + Math.floor(coordinate.x / 3);
}
function onTdClicked(eventObj) {
    //console.log(eventObj);
    currentSelectedGridObj = eventObj.target.gridObj;
    refreshGrids(false);
}

function refreshGrids(bCheckCompletion) {
    var currentSelectedCoordinate;
    if (currentSelectedGridObj) {
        currentSelectedCoordinate = currentSelectedGridObj.coordinate;
    } else {
        currentSelectedCoordinate = new Coordinate(-1, -1);
    }
    var bNotFinishedYet = false;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var gridObj = gridMatrix[i][j];
            var td = gridObj.tdElement;
            if (gridObj.bIsInitGrid) {
                td.css("color", initGridTextColor);
            } else {
                td.css("color", inputGridTextColor);
            }
            var subregionIndex = getSugregionIndex(gridObj.coordinate);
            if (j == currentSelectedCoordinate.x
                && i == currentSelectedCoordinate.y) {
                td.css("background-color", selectedGridColor);
            } else if (j == currentSelectedCoordinate.x) {
                td.css("background-color", selectedColumnColor);
            } else if (i == currentSelectedCoordinate.y) {
                td.css("background-color", selectedRowColor);
            } else if (subregionIndex % 2 == 0) {
                td.css("background-color", oddSubregionColor);
            } else {
                td.css("background-color", evenSubregionColor);
            }
            if (td.text().length == 1) {
                //check conflict
                //check row
                var bConflictFound = false;
                for (var k = 0; k < 9; k++) {
                    if (k == j) continue;
                    var otherGrid = gridMatrix[i][k];
                    if (otherGrid.tdElement.text() == td.text()) {
                        bConflictFound = true;
                        break;
                    }
                }
                // check column
                for (var k = 0; k < 9; k++) {
                    if (k == i) continue;
                    var otherGrid = gridMatrix[k][j];
                    if (otherGrid.tdElement.text() == td.text()) {
                        bConflictFound = true;
                        break;
                    }
                }
                //check 3x3 subregion
                var rowStart = Math.floor(i / 3) * 3;
                var columnStart = Math.floor(j / 3) * 3;
                for (var m = rowStart; m < rowStart + 3; m++) {
                    for (var n = columnStart; n < columnStart + 3; n++) {
                        if (m == i && n == j) {
                            continue;
                        }
                        var otherGrid = gridMatrix[m][n];
                        if (otherGrid.tdElement.text() == td.text()) {
                            bConflictFound = true;
                            m = n = 9; //quit the loops
                        }
                    }
                }
                if (bConflictFound) {
                    if (gridObj.bIsInitGrid) {
                        td.css("color", conflictInitGridTextColor);
                    } else {
                        td.css("color", conflictInputGridTextColor);
                    }
                    bNotFinishedYet = true;
                }
            } else {
                bNotFinishedYet = true;
            }
        }
    }
    if (!bNotFinishedYet && bCheckCompletion) {
        alert("Good Job.");
        nextSudoku();
    }
};

function onKeyUp(eventObj) {
    //console.log(eventObj.which);
    if (!currentSelectedGridObj || currentSelectedGridObj.bIsInitGrid) {
        return;
    }
    var strNumber;
    var operation = new Operation();
    operation.gridObj = currentSelectedGridObj;
    operation.time = new Date();
    operation.originalValue = currentSelectedGridObj.tdElement.text();
    if (eventObj.which == 8 //backspace key
        || eventObj.which == 46 //delete key
        || eventObj.which == 48) { // '0' number key
        strNumber = "";
    } else if (eventObj.which >= 49 && eventObj.which <= 57) {//'1'~'9'
        var number = eventObj.which - 48;
        if (number < 1 || number > 9) {
            return;
        }
        strNumber = "" + number;
        if (currentSelectedGridObj.tdElement.text() == strNumber) {
            strNumber = "";
        }
    } else {
        return;
    }
    operation.newValue = strNumber;
    if (operation.originalValue != operation.newValue) {
        histories.push(operation);
    }
    currentSelectedGridObj.tdElement.text(strNumber);
    refreshGrids(true);
}
// initMatrix must be a 9x9 two dimesion array containing numbers
function fillInGrids(initMatrix) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var gridObj = gridMatrix[i][j];
            var td = gridObj.tdElement;
            if (initMatrix[i][j] != 0) {
                gridObj.bIsInitGrid = true;
                td.text("" + initMatrix[i][j]);
                td.css("font-weight", "bold");
            } else {
                gridObj.bIsInitGrid = false;
                td.text("");
            }
        }
    }
    histories = [];
}

function createGrids() {
    var edgeBorderStyle = "3px solid black";
    var table = $("#sudoku table");
    for (var i = 0; i < 9; i++) {
        gridMatrix.push([]);
        var tr = $("<tr>");
        table.append(tr);
        for (var j = 0; j < 9; j++) {
            var td = $("<td>");
            tr.append(td);
            var gridObj = new Grid(j, i);
            td[0].gridObj = gridObj;
            gridObj.tdElement = $(td[0]);
            gridMatrix[i].push(gridObj);
            td.click(onTdClicked);
        }
    }
};
// return value range: [1, size]
function randomPick(size, prevIndex) {
    if (size == 1) return 1;
    while (true) {
        var index = Math.floor(Math.random() * size) + 1;
        if (index != prevIndex) {
            return index;
        }
    }
}

function undo() {
    if (histories.length == 0) return;
    var oper = histories.pop();
    //console.log(oper);
    oper.gridObj.tdElement.text(oper.originalValue);
    oper.gridObj.tdElement.click();
}

function clear() {
    if (!currentSelectedGridObj) return;
    var eventObj = {
        which : 8, //backspace key
        target : currentSelectedGridObj.tdElement,
    };
    onKeyUp(eventObj);
}

function nextSudoku() {
    prevInitMatrixIndex = matrixIndex = randomPick(matricesCountForEachMode[currentMode], prevInitMatrixIndex);
    var url = "/initMatrices/easy/" + matrixIndex + ".json"
    $.getJSON(url, null, function(data) {
        fillInGrids(data.values);
        refreshGrids(false);
    });
}

$(document).ready(function() {
    createGrids();
    nextSudoku();
});

$(document).keyup(onKeyUp);
$("input#undoButton").click(undo);
$("input#clearButton").click(clear);
$("input#undoButton").click(undo);
$("input#nextButton").click(nextSudoku);
