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
var conflictGridTextColor = "red";

var gridMatrix = []; //a two dimensions array that holds Grid objects
var currentSelectedGridObj = null;

var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
}

var Grid = function(x, y) {
    this.coordinate = new Coordinate(x, y);
    this.bIsInitGrid = false;
    this.ele = null;
};

function getSugregionIndex(coordinate)
{
    return Math.floor(coordinate.y / 3) * 3 + Math.floor(coordinate.x / 3);
}
function onTdClicked(eventObj) {
    console.log(eventObj);
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
            var td = gridObj.ele;
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
                    if (otherGrid.ele.text() == td.text()) {
                        bConflictFound = true;
                        break;
                    }
                }
                // check column
                for (var k = 0; k < 9; k++) {
                    if (k == i) continue;
                    var otherGrid = gridMatrix[k][j];
                    if (otherGrid.ele.text() == td.text()) {
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
                        if (!otherGrid) {
                            console.log("shit at ", i, j, m, n);
                        }
                        if (otherGrid.ele.text() == td.text()) {
                            bConflictFound = true;
                            m = n = 9; //quit the loops
                        }
                    }
                }
                if (bConflictFound) {
                    td.css("color", conflictGridTextColor);
                    bNotFinishedYet = true;
                }
            } else {
                bNotFinishedYet = true;
            }
        }
    }
    if (!bNotFinishedYet && bCheckCompletion) {
        alert("Good Job.");
    }
};

function onKeyUp(eventObj) {
    console.log(eventObj.which);
    if (!currentSelectedGridObj || currentSelectedGridObj.bIsInitGrid) {
        return;
    }
    var strNumber;
    if (eventObj.which == 8 //backspace key
        || eventObj.which == 46 //delete key
        || eventObj.which == 48) { // '0' number key
        strNumber = "";
    } else {
        var number = eventObj.which - 48;
        if (number < 1 || number > 9) {
            return;
        }
        strNumber = "" + number;
        if (currentSelectedGridObj.ele.text() == strNumber) {
            strNumber = "";
        }
    }
    currentSelectedGridObj.ele.text(strNumber);
    refreshGrids(true);
}
// initMatrix must be a 9x9 two dimesion array containing numbers
function fillInGrids(initMatrix) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var gridObj = gridMatrix[i][j];
            var td = gridObj.ele;
            if (initMatrix[i][j] != 0) {
                gridObj.bIsInitGrid = true;
                td.text("" + initMatrix[i][j]);
                td.css("font-weight", "bold");
            } else {
                gridObj.bIsInitGrid = false;
            }
        }
    }
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
            gridObj.ele = $(td[0]);
            gridMatrix[i].push(gridObj);
            td.click(onTdClicked);
            //check if it's at the edge of a 3x3 subregion, if so, use a wider border
            if (j == 0) {
                td.css("border-left", edgeBorderStyle);
            }
            if (j == 2 || j == 5 || j == 8) {
                td.css("border-right", edgeBorderStyle);
            }
            if (i == 0) {
                td.css("border-top", edgeBorderStyle);
            }
            if (i == 2 || i == 5 || i == 8) {
                td.css("border-bottom", edgeBorderStyle);
            }
        }
    }
};

var initMatrix1 = [
    /* row 1 */ [0, 0, 8, 2, 0, 0, 9, 0, 3],
    /* row 2 */ [3, 4, 2, 0, 9, 5, 0, 0, 7],
    /* row 3 */ [1, 9, 7, 0, 0, 0, 0, 0, 4],
    /* row 4 */ [0, 0, 5, 3, 1, 2, 4, 7, 9],
    /* row 5 */ [0, 0, 0, 0, 0, 0, 0, 0, 0],
    /* row 6 */ [2, 0, 0, 0, 7, 4, 5, 0, 0],
    /* row 7 */ [0, 2, 0, 0, 0, 1, 0, 0, 5],
    /* row 8 */ [0, 7, 0, 0, 0, 6, 8, 9, 1],
    /* row 9 */ [8, 0, 0, 4, 3, 0, 7, 0, 6],
];

var initMatrix = [
    /* row 1 */ [5, 6, 8, 2, 4, 7, 9, 1, 3],
    /* row 2 */ [3, 4, 2, 1, 9, 5, 0, 0, 7],
    /* row 3 */ [1, 9, 7, 8, 6, 3, 2, 5, 4],
    /* row 4 */ [6, 8, 5, 3, 1, 2, 4, 7, 9],
    /* row 5 */ [7, 3, 4, 9, 5, 8, 1, 6, 2],
    /* row 6 */ [2, 1, 9, 6, 7, 4, 5, 3, 8],
    /* row 7 */ [9, 2, 6, 7, 8, 1, 3, 4, 5],
    /* row 8 */ [4, 7, 3, 5, 2, 6, 8, 9, 1],
    /* row 9 */ [8, 5, 1, 4, 3, 9, 7, 2, 6],
];

$(document).ready(function() {
    createGrids();
    fillInGrids(initMatrix);
    refreshGrids(false);
    $(document).keyup(onKeyUp);
});
