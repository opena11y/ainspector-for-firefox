"use strict";
/*
*   File:   Tablist.js
*
*   Desc:   Carousel Tablist group widget that implements ARIA Authoring Practices
*
*   Author(s): Jon Gunderson, Nicholas Hoyt, and Mark McCarthy
*/

var Tablist = function (domNode) {
  this.domNode = domNode;

  this.tabs = [];

  this.firstTab = null;
  this.lastTab = null;
  this.currentDomNode = null;
  this.currentTab = null;
  this.pauseButton = null;

  this.rotate = true;
  this.enableRotation = true;
  this.hasFocus = null;
  this.timeInterval = 5000;
};

Tablist.prototype.init = function () {

  var tabs = this.domNode.querySelectorAll('[role=tab]');

  for (var i = 0; i < tabs.length; i++) {
    var tab = new Tab(tabs[i], this);

    tab.init();
    this.tabs.push(tab);

    if (!this.firstTab) {
      this.firstTab = tab;
      this.currentDomNode = tab.domNode;
    }
    this.lastTab = tab;
  }
  this.firstTab.domNode.tabIndex = 0;

  this.currentTab = this.firstTab;
};

Tablist.prototype.getSelectedTabId = function () {
  return this.currentTab.id;
};

Tablist.prototype.setSelected = function (newTab, moveFocus) {
  if (typeof moveFocus != 'boolean') {
    moveFocus = false;
  }

  for (var i = 0; i < this.tabs.length; i++) {
    var tab = this.tabs[i];

    this.currentTab.hideTabPanel();
  }

  this.currentTab = newTab;
  this.currentTab.showTabPanel();

  if (moveFocus) {
    this.currentTab.domNode.focus();
  }
};

Tablist.prototype.setSelectedToPreviousTab = function (currentTab, moveFocus) {
  if (typeof moveFocus != 'boolean') {
    moveFocus = false;
  }

  var index;

  if (typeof currentTab !== 'object') {
    currentTab = this.currentTab;
  }

  if (currentTab === this.firstTab) {
    this.setSelected(this.lastTab, moveFocus);
  }
  else {
    index = this.tabs.indexOf(currentTab);
    this.setSelected(this.tabs[index - 1], moveFocus);
  }
};

Tablist.prototype.setSelectedToNextTab = function (currentTab, moveFocus) {
  if (typeof moveFocus != 'boolean') {
    moveFocus = false;
  }

  var index;

  if (typeof currentTab !== 'object') {
    currentTab = this.currentTab;
  }

  if (currentTab === this.lastTab) {
    this.setSelected(this.firstTab, moveFocus);
  }
  else {
    index = this.tabs.indexOf(currentTab);
    this.setSelected(this.tabs[index + 1], moveFocus);
  }
};

Tablist.prototype.setSelectedById = function (tabId, moveFocus) {
  if (typeof moveFocus != 'boolean') {
    moveFocus = false;
  }

  var index;

  var currentTab = this.firstTab;

  for (let i = 0 ; i < this.tabs.length; i++) {
    if (this.tabs[i].id === tabId) {
      currentTab = this.tabs[i];
      break;
    }
  }

  this.setSelected(currentTab, moveFocus);

};


/* Initialize Tablists */

var summaryTablist;

window.addEventListener('load', function (event) {
  var Tablists = document.querySelectorAll('[role=tablist]');

  for (var i = 0; i < Tablists.length; i++) {
    var ctl = new Tablist(Tablists[i]);
    ctl.init();
    if (i === 0) {
      summaryTablist = ctl;
    }
  }
}, false);

