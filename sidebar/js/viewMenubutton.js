/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   ViewMenuButton.js
*
*   Desc:   ViewMenuButton widget for selecting a rule results view
*/

/*
*   @constructor ViewMenuButton
*
*   @desc
*       Object that configures menu item elements by setting tabIndex
*       and registering itself to handle pertinent events.
*
*       While menuitem elements handle many keydown events, as well as
*       focus and blur events, they do not maintain any state variables,
*       delegating those responsibilities to its associated menu object.
*
*       Consequently, it is only necessary to create one instance of
*       ViewMenuButtonItem from within the menu object; its configure method
*       can then be called on each menuitem element.
*
*   @param domNode
*       The DOM element node that serves as the menu item container.
*       The menuObj menu is responsible for checking that it has
*       requisite metadata, e.g. role="menuitem".
*
*
*/

var viewMenu;

var ViewMenuButton = function (domNode) {


  this.domNode   = domNode;
  this.domNode.innerHTML = i18n('labelViews');
  this.menu = false;

  this.hasFocus = false;
  this.hasHover = false;

  this.keyCode = Object.freeze({
    'TAB': 9,
    'RETURN': 13,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  });
};

ViewMenuButton.prototype.init = function () {

  this.domNode.setAttribute('aria-haspopup', 'true');

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));
  this.domNode.addEventListener('mouseover', this.handleMouseover.bind(this));
  this.domNode.addEventListener('mouseout', this.handleMouseout.bind(this));

  // initialize pop up menus

  var menu = document.getElementById(this.domNode.getAttribute('aria-controls'));

  if (menu) {
    this.menu = new Menu(menu, this);
    this.menu.init();
    // save a reference to view menu
    viewMenu = this.menu;
  }


};

ViewMenuButton.prototype.handleKeydown = function (event) {
  var tgt = event.currentTarget,
    flag = false,
    clickEvent;

  switch (event.keyCode) {
    case this.keyCode.SPACE:
    case this.keyCode.RETURN:
    case this.keyCode.DOWN:
      if (this.menu) {
        this.menu.open();
        this.menu.setFocusToFirstItem();
      }
      flag = true;
      break;

    case this.keyCode.UP:
      if (this.menu) {
        this.menu.open();
        this.menu.setFocusToLastItem();
        flag = true;
      }
      break;

    default:
      break;
  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

ViewMenuButton.prototype.handleClick = function (event) {
  if (this.domNode.getAttribute('aria-expanded') == 'true') {
    this.menu.close(true);
  }
  else {
    this.menu.open();
    this.menu.setFocusToFirstItem();
  }
};

ViewMenuButton.prototype.handleFocus = function (event) {
  this.menu.hasFocus = true;
};

ViewMenuButton.prototype.handleBlur = function (event) {
  this.menu.hasFocus = false;
  setTimeout(this.menu.close.bind(this.menu, false), 300);

};

ViewMenuButton.prototype.handleMouseover = function (event) {
  this.hasHover = true;
  this.menu.open();
};

ViewMenuButton.prototype.handleMouseout = function (event) {
  this.hasHover = false;
  setTimeout(this.menu.close.bind(this.menu, false), 300);
};

// Initialize menu button

window.addEventListener('load', function (event) {
  var viewMenuButton = document.getElementById('view_options_button');
  var mb = new ViewMenuButton(viewMenuButton);
  mb.init();
}, false);


function updateViewMenu() {



  viewMenu.removeAllOptions();

  viewMenu.addOption('summary', 'menuitem', i18n('labelSummary'), function() {handleGetSummary();});

  viewMenu.addOption('', 'separator', ' ');

  for (let i = 0; i < (summaryPanel.rcOptions.length-1); i++) {
    viewMenu.addOption(summaryPanel.rcOptions[i].id, 'menuitem', i18n(summaryPanel.rcOptions[i].label), function() {var id = 'rc-' + summaryPanel.rcOptions[i].id; handleGetGroup(id);});
  }

  if (messageArgs.includeGuidelines) {
    viewMenu.addOption('', 'separator', ' ');

    for (let i = 0; i < (summaryPanel.glOptions.length-1); i++) {
      viewMenu.addOption(summaryPanel.glOptions[i].id, 'menuitem', i18n(summaryPanel.glOptions[i].label), function() {var id = 'gl-' + summaryPanel.glOptions[i].id; handleGetGroup(id);});
    }
  }

  viewMenu.addOption('', 'separator', ' ');

  var last = summaryPanel.rcOptions.length-1;

  viewMenu.addOption(summaryPanel.rcOptions[last].id, 'menuitem', i18n(summaryPanel.rcOptions[last].label), function() {var id = 'rc-' + summaryPanel.rcOptions[last].id; handleGetGroup(id);});

};
