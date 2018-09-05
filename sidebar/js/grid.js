"use strict";
/*
*   File:   Grid.js
*
*   Desc:   Grid widget for AInspector Sidebar
*
*   Author(s): Jon Gunderson
*/

var Grid = function (domNode, allowHeaderNavigation) {

  if (typeof allowHeaderNavigation !== 'boolean') {
    allowHeaderNavigation = false;
  }

  this.domNode = domNode;

  this.theadNode = null;
  this.tbodyNode = null;

  this.allowHeaderNavigation = allowHeaderNavigation;
  this.cellNavigation = true;

  this.selectedId = '';
  this.currentIndex = 0;
  this.firstRowIndex = -1;
  this.lastRowIndex = -1;

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
        var gridCell = new GridCell(thNodes[i], true);
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

//  alert('[gridRow.cells]: ' + gridRow.cells.length);

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
    if ((this.firstRowIndex < 0) &&
        ((row.isThead && this.allowHeaderNavigation) ||
          !row.isThead)) {
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

Grid.prototype.setSelectedToRow = function (index) {

  for(let i = 0; i < this.rows.length; i++) {
    this.rows[i].removeSelected();
  }

  if (this.rows[index]) {
    this.rows[index].setSelected();
  }
  else {
    this.rows[this.firstRowIndex].setSelected();
  }

};

Grid.prototype.moveFocusToFirstRow = function () {
  this.setSelectedToRow(this.firstRowIndex);
};

Grid.prototype.moveFocusToLastRow = function () {
  this.setSelectedToRow(this.lastRowIndex);
};

Grid.prototype.moveFocusToPreviousRow = function () {
  if (this.currentIndex > 1) {
    var newRow = this.rows[this.currentIndex-1];
    if ((newRow.isThead && this.allowHeaderNavigation) ||
      !newRow.isThead) {
      this.setSelectedToRow(this.currentIndex-1);
    }
  }
};

Grid.prototype.moveFocusToNextRow = function () {
  if (this.currentIndex < this.lastRowIndex) {
    this.setSelectedToRow(this.currentIndex+1);
  }
};

Grid.prototype.moveFocusToFirstCell = function () {
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
  this.index = -1;

  this.isThead = thead;

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
  if (this.isThead && !this.grid.allowHeaderNavigation) {
    this.domNode.tabindex = '';
  }

  this.domNode.addEventListener('keydown',  this.handleKeydown.bind(this));
  this.domNode.addEventListener('click',    this.handleClick.bind(this));
  this.domNode.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  this.domNode.addEventListener('focus',    this.handleFocus.bind(this));
  this.domNode.addEventListener('blur',     this.handleBlur.bind(this));
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

  node.innerHTML = content;
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
};

GridRow.prototype.setSelected = function () {
  this.domNode.focus();
  this.domNode.tabIndex = 0;
  this.grid.currentIndex = this.index;
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

  this.domNode = domNode;
  this.gridRow = gridRow;
  this.isHeader = header;


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



/* EVENT HANDLERS */

GridCell.prototype.handleKeydown = function (event) {
  var flag = false;

  switch (event.keyCode) {
    case this.keyCode.UP:
      flag = true;
      break;
    case this.keyCode.DOWN:
      flag = true;
      break;
    case this.keyCode.LEFT:
      flag = true;
      break;
    case this.keyCode.RIGHT:
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

var rcGrid = new Grid(document.getElementById('rc_grid'));
rcGrid.init();

var glGrid = new Grid(document.getElementById('gl_grid'));
glGrid.init();

var groupGrid = new Grid(document.getElementById('group_grid'));
groupGrid.init();

var ruleGrid = new Grid(document.getElementById('rule_grid'));
ruleGrid.init();

// alert(rcGrid + '\n' + glGrid + '\n' + glGrid + '\n' + ruleGrid);
