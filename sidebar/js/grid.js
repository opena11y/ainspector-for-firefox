"use strict";
/*
*   File:   Grid.js
*
*   Desc:   Grid widget for AInspector Sidebar
*
*   Author(s): Jon Gunderson
*/

var Grid = function (domNode) {

  this.domNode = domNode;

  this.theadNode = null;
  this.tbodyNode = null;

  this.cellNavigation = true;

  this.selectedId = '';
  this.currentRowIndex = 0;
  this.firstRowIndex = -1;
  this.lastRowIndex = -1;

  this.currentColumnIndex = -1;

  this.rows = [];

};

Grid.prototype.init = function () {


  this.domNode.tabIndex = -1;

  var theadNode = this.domNode.querySelector('thead');

  if (theadNode) {
    this.theadNode = theadNode;

    var trNode = theadNode.querySelector('tr');

    if (trNode) {
      var gridRow = new GridRow(trNode, this, '', false, true);
      gridRow.init();

      var thNodes = trNode.querySelectorAll('th');

      for(let i = 0; i < thNodes.length; i++) {
        var gridCell = new GridCell(thNodes[i], gridRow, true);
        gridCell.init();
        gridRow.addGridCell(gridCell);
      }

      this.rows.push(gridRow);
    }

  }
  else {
    this.theadNode = document.createElement('thead');
    this.domNode.appendChild(this.theadNode);
  }

  var tbodyNode = this.domNode.querySelector('tbody');

  if (tbodyNode) {
    this.tbodyNode = tbodyNode;
  }
  else {
    this.tbodyNode = document.createElement('tbody');
    this.domNode.appendChild(this.tbodyNode);
  }

  this.resize();
};

Grid.prototype.resize = function () {

  var totalWidth = 400;
  var node = document.getElementById('view_options_button');
  totalWidth = node.getBoundingClientRect().right - this.domNode.getBoundingClientRect().left;
  this.domNode.style.width = totalWidth + 'px'

};

Grid.prototype.updateCellContentAndTitle = function (row, col, content, title) {

  if (this.rows[row]) {
    if (this.rows[row].cells[col]) {
      this.rows[row].cells[col].setContentAndTitle(content, title);
    }
  }

};

Grid.prototype.addRow = function (id, action, thead) {

  if (typeof action !== 'function') {
    action = false;
  }

  if (typeof thead !== 'boolean') {
    thead = false;
  }

  var node = document.createElement('tr');
  node.id = id;

  var gridRow = new GridRow(node, this, id, action, thead);
  gridRow.init();

//  alert(thead + '\n' + this.tbodyNode + '\n' + this.theadNode);

  if (thead) {
    this.theadNode.appendChild(node);
    this.rows.unshift(gridRow);
  }
  else {
    this.tbodyNode.appendChild(node);
    this.rows.push(gridRow);
  }

  for (let i = 0; i < this.rows.length; i++) {
    var row = this.rows[i];
    row.index = i;
    if ((this.firstRowIndex < 0) && !row.isThead) {
      this.firstRowIndex = i;
    }
    this.lastRowIndex = i;
  }

  return gridRow;
};

Grid.prototype.clearRows = function (header) {

  if (typeof header !== 'boolean') {
    header = false;
  }

  for (let i = (this.rows.length - 1); i > 0; i--) {
    var row = this.rows[i];
    if (!row.isThead || header) {
      row.remove();
      this.rows.pop()
    }
  }
};

Grid.prototype.setSelectedId = function (id) {
  this.selectedId = id;
};

Grid.prototype.getSelectedId = function () {
  return this.selectedId;
};

Grid.prototype.setSelectedToRowById = function (id) {
  var flag = true;

  for(let i = 0; i < this.rows.length; i++) {
    var row = this.rows[i];
    row.removeSelected();
    if (row.id === id) {
      row.setSelected();
      flag = false;
    }
  }

  if (flag) {
    this.rows[this.firstRowIndex].setSelected();
  }

}

Grid.prototype.setSelectedToRow = function (rowIndex) {

  for(let i = 0; i < this.rows.length; i++) {
    this.rows[i].removeSelected();
  }

  if (this.rows[rowIndex]) {
    this.rows[rowIndex].setSelected();
    this.currentColumnIndex = -1;
  }
  else {
    this.rows[this.firstRowIndex].setSelected();
    this.currentColumnIndex = -1;
  }

};

Grid.prototype.setSelectedToCell = function (rowIndex, columnIndex) {

  for(let i = 0; i < this.rows.length; i++) {
    this.rows[i].removeSelected();
  }

  if (this.rows[rowIndex] && this.rows[rowIndex].cells[columnIndex]) {
    this.rows[rowIndex].cells[columnIndex].setSelected();
  }
  else {
    if (this.rows[rowIndex] && this.rows[rowIndex].cells[0]) {
      this.rows[this.firstRowIndex].cells[0].setSelected();
    }
    else {
      this.rows[this.firstRowIndex].setSelected();
    }
  }
};


Grid.prototype.moveFocusToFirstRow = function () {
  if (this.grid.currentColumnIndex < 0) {
    this.setSelectedToRow(this.firstRowIndex);
  }
  else {
    this.setSelectedToCell(this.firstRowIndex, this.grid.currentColumnIndex);
  }
};

Grid.prototype.moveFocusToLastRow = function () {
  if (this.grid.currentColumnIndex < 0) {
    this.setSelectedToRow(this.lastRowIndex);
  }
  else {
    this.setSelectedToCell(this.lastRowIndex, this.grid.currentColumnIndex);
  }
};

Grid.prototype.moveFocusToPreviousRow = function () {
  if (this.currentRowIndex > this.firstRowIndex) {
    if (this.currentColumnIndex < 0) {
      this.setSelectedToRow(this.currentRowIndex-1);
    }
    else {
      this.setSelectedToCell((this.currentRowIndex-1), this.currentColumnIndex);
    }
  }
};

Grid.prototype.moveFocusToNextRow = function () {
  if (this.currentRowIndex < this.lastRowIndex) {
    if (this.currentColumnIndex < 0) {
      this.setSelectedToRow(this.currentRowIndex+1);
    }
    else {
      this.setSelectedToCell((this.currentRowIndex+1), this.currentColumnIndex);
    }
  }
};

Grid.prototype.moveFocusToFirstCell = function () {
  this.setSelectedToCell(this.currentRowIndex, 0);
};

Grid.prototype.moveFocusToPreviousCell = function () {
  if (this.currentColumnIndex > 0) {
    this.setSelectedToCell(this.currentRowIndex, (this.currentColumnIndex-1));
  }
  else {
    this.setSelectedToRow(this.currentRowIndex);
  }
};

Grid.prototype.moveFocusToNextCell = function () {
  if (this.currentColumnIndex < (this.rows[this.currentRowIndex].cells.length-1)) {
    this.setSelectedToCell(this.currentRowIndex, (this.currentColumnIndex+1));
  }
};

// =======================
//
// GridRow
//
// =======================


var GridRow = function (domNode, grid, id, action, thead) {

  if (typeof action !== 'function') {
    action = false;
  }

  if (typeof thead !== 'boolean') {
    thead = false;
  }


  this.domNode = domNode;
  this.grid    = grid;
  this.id      = id;
  this.action  = action;
  if (!thead) {
    this.rowIndex = -1;
  }

  this.isThead = thead;

  this.rowIndex = this.grid.rows.length;

  this.cells = [];

  this.keyCode = Object.freeze({
    'RETURN'   : 13,
    'SPACE'    : 32,
    'PAGE_UP'  : 33,
    'PAGE_DOWN': 34,
    'END'      : 35,
    'HOME'     : 36,
    'LEFT'     : 37,
    'UP'       : 38,
    'RIGHT'    : 39,
    'DOWN'     : 40
  });
};

GridRow.prototype.init = function () {
  if (!this.isThead) {
    this.domNode.addEventListener('keydown',  this.handleKeydown.bind(this));
    this.domNode.addEventListener('click',    this.handleClick.bind(this));
    this.domNode.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.domNode.addEventListener('focus',    this.handleFocus.bind(this));
    this.domNode.addEventListener('blur',     this.handleBlur.bind(this));
  }
};

GridRow.prototype.addCell = function (content, type, sort, header) {

  if (typeof sort !== 'number' && typeof sort !== 'string') {
    sort = false;
  }

  if (typeof header !== 'boolean') {
    header = false;
  }

  var node;

  if (this.isThead || header) {
    node = document.createElement('th');
  }
  else {
    node = document.createElement('td');
  }

  node.textContent = content;
  this.domNode.appendChild(node);
  node.className = type;

  if (sort) {
    node.setAttribute('data-sort', sort);
  }

  var gridCell = new GridCell(node, this, header);
  gridCell.init();
  this.cells.push(gridCell);

  return gridCell;

};

GridRow.prototype.addGridCell = function (gridCell) {
  this.cells.push(gridCell);
};

GridRow.prototype.remove = function () {
  this.domNode.remove();
};

GridRow.prototype.removeSelected = function () {
  this.domNode.tabIndex = -1;
  this.domNode.setAttribute('aria-selected', 'false');
  this.cells.forEach(function(cell) {
    cell.removeSelected();
  });
};

GridRow.prototype.setSelected = function () {
  this.domNode.focus();
  this.domNode.tabIndex = 0;
  this.grid.currentRowIndex = this.index;
  this.domNode.setAttribute('aria-selected', 'true');
};




/* EVENT HANDLERS */

GridRow.prototype.handleKeydown = function (event) {
  var flag = false;

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
      if (this.action) {
        this.action("activate", this.id);
      }
      flag = true;
      break;

    case this.keyCode.UP:
      this.grid.moveFocusToPreviousRow();
      flag = true;
      break;

    case this.keyCode.DOWN:
      this.grid.moveFocusToNextRow();
      flag = true;
      break;

    case this.keyCode.HOME:
      this.grid.moveFocusToFirstRow();
      flag = true;
      break;

    case this.keyCode.END:
      this.grid.moveFocusToLastRow();
      flag = true;
      break;

    case this.keyCode.RIGHT:
      this.grid.moveFocusToFirstCell();
      flag = true;
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

GridRow.prototype.handleClick = function (event) {
  this.grid.setSelectedToRowById(this.id);
  if (this.action) {
    this.action("click", this.id);
  }
};

GridRow.prototype.handleDoubleClick = function (event) {
  if (this.action) {
    this.action("doubleClick", this.id);
  }
};

GridRow.prototype.handleFocus = function (event) {
  this.domNode.classList.add('focus');
  this.grid.setSelectedId(this.id);
  if (this.action) {
    this.action("focus", this.id);
  }
};

GridRow.prototype.handleBlur = function (event) {
  this.domNode.classList.remove('focus');
  if (this.action) {
    this.action("blur", this.id);
  }
};

// =======================
//
// GridCell
//
// =======================

var GridCell = function (domNode, gridRow, header) {

  if (typeof header !== 'boolean' ) {
    header = false;
  }

  this.domNode  = domNode;
  this.gridRow  = gridRow;
  this.isHeader = header;
  this.column   = gridRow.cells.length;

  this.keyCode = Object.freeze({
    'RETURN': 13,
    'SPACE': 32,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  });
};


GridCell.prototype.init = function () {
//  this.domNode.tabIndex = -1;

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));

};

GridCell.prototype.setContentAndTitle = function (content, title) {
  this.domNode.textContent = content;
  if (title) {
    this.domNode.setAttribute('title', title);
  }
};

GridCell.prototype.setAccessibleName = function (name) {
  if (name) {
    this.domNode.setAttribute('aria-label', name + ';');
  }
};

GridCell.prototype.setDescribedBy = function (id) {
  if (id) {
    this.domNode.setAttribute('aria-describedby', id);
  }
};


GridCell.prototype.removeSelected = function () {
  this.domNode.tabIndex = -1;
  this.domNode.setAttribute('aria-selected', 'false');
};

GridCell.prototype.setSelected = function () {
  this.domNode.focus();
  this.domNode.tabIndex = 0;
  this.gridRow.grid.currentRowIndex = this.gridRow.rowIndex;
  this.gridRow.grid.currentColumnIndex = this.column;
  this.domNode.setAttribute('aria-selected', 'true');
};

/* EVENT HANDLERS */

GridCell.prototype.handleKeydown = function (event) {
  var flag = false;

  switch (event.keyCode) {

    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
      if (this.gridRow.action) {
        this.gridRow.action("activate", this.gridRow.id);
      }
      flag = true;
      break;

    case this.keyCode.UP:
      this.gridRow.grid.moveFocusToPreviousRow();
      flag = true;
      break;

    case this.keyCode.DOWN:
      this.gridRow.grid.moveFocusToNextRow();
      flag = true;
      break;

    case this.keyCode.HOME:
      this.gridRow.grid.moveFocusToFirstRow();
      flag = true;
      break;

    case this.keyCode.END:
      this.gridRow.grid.moveFocusToLastRow();
      flag = true;
      break;

    case this.keyCode.LEFT:
      this.gridRow.grid.moveFocusToPreviousCell();
      flag = true;
      break;

    case this.keyCode.RIGHT:
      this.gridRow.grid.moveFocusToNextCell();
      flag = true;
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

GridCell.prototype.handleClick = function (event) {

};

GridCell.prototype.handleFocus = function (event) {

};

GridCell.prototype.handleBlur = function (event) {

};




