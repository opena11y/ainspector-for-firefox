"use strict";
/*
*   File:   Tab.js
*
*   Desc:   Tab widget that implements ARIA Authoring Practices
*
*   Author(s): Jon Gunderson, Nicholas Hoyt, and Mark McCarthy
*/

var Tab = function (domNode, groupObj) {
  this.domNode = domNode;
  this.tablist = groupObj;
  this.id = this.domNode.id;

  this.tabpanelDomNode = null;

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

Tab.prototype.init = function () {
  this.domNode.tabIndex = -1;
  if (!this.domNode.hasAttribute('aria-selected')) {
    this.domNode.setAttribute('aria-selected', 'false');
  }
  this.tabpanelDomNode = document.getElementById(this.domNode.getAttribute('aria-controls'));

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));
};

Tab.prototype.hideTabPanel = function () {
  this.tabpanelDomNode.style.display = 'none';
  this.domNode.setAttribute('aria-selected', 'false');
  this.domNode.tabIndex = -1;
  this.domNode.classList.remove('focus');
};

Tab.prototype.showTabPanel = function () {
  this.tabpanelDomNode.style.display = 'block';
  this.domNode.setAttribute('aria-selected', 'true');
  this.domNode.tabIndex = 0;
  this.domNode.classList.add('focus');
};

/* EVENT HANDLERS */

Tab.prototype.handleKeydown = function (event) {
  var flag = false;

  switch (event.keyCode) {
    case this.keyCode.UP:
      this.tablist.setSelectedToPreviousTab(this, true);
      flag = true;
      break;
    case this.keyCode.DOWN:
      this.tablist.setSelectedToNextTab(this, true);
      flag = true;
      break;
    case this.keyCode.LEFT:
      this.tablist.setSelectedToPreviousTab(this, true);
      flag = true;
      break;
    case this.keyCode.RIGHT:
      this.tablist.setSelectedToNextTab(this, true);
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

Tab.prototype.handleClick = function (event) {
  this.tablist.setSelected(this);
  console.log('pause status is ' + this.tablist.rotate);
};

Tab.prototype.handleFocus = function (event) {
  this.domNode.classList.add('focus');
  this.tablist.hasFocus = true;
  this.tablist.stopRotation();
};

Tab.prototype.handleBlur = function (event) {
  this.domNode.classList.remove('focus');
  this.tablist.startRotation();
};
