/* viewMenuButton.js */

import { getOptions } from '../../storage.js';

import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from '../constants.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  allRulesLabel        : getMessage('allRulesLabel'),
  audioVideoLabel      : getMessage('audioVideoLabel'),
  formsLabel           : getMessage('formsLabel'),
  g1_1                 : getMessage('g1.1'),
  g1_2                 : getMessage('g1.2'),
  g1_3                 : getMessage('g1.3'),
  g1_4                 : getMessage('g1.4'),
  g2_1                 : getMessage('g2.1'),
  g2_2                 : getMessage('g2.2'),
  g2_3                 : getMessage('g2.3'),
  g2_4                 : getMessage('g2.4'),
  g3_1                 : getMessage('g3.1'),
  g3_2                 : getMessage('g3.2'),
  g3_3                 : getMessage('g3.3'),
  g4_1                 : getMessage('g4.1'),
  headingsLabel        : getMessage('headingsLabel'),
  imagesLabel          : getMessage('imagesLabel'),
  keyboardLabel        : getMessage('keyboardLabel'),
  landmarksLabel       : getMessage('landmarksLabel'),
  linksLabel           : getMessage('linksLabel'),
  siteNavigationLabel  : getMessage('siteNavigationLabel'),
  stylesContentLabel   : getMessage('stylesContentLabel'),
  tablesLabel          : getMessage('tablesLabel'),
  timingLabel          : getMessage('timingLabel'),
  widgetsScriptsLabel  : getMessage('widgetsScriptsLabel'),
  guidelinesLabel      : getMessage('guidelinesLabel'),
  ruleCategoriesLabel  : getMessage('ruleCategoriesLabel'),
  summaryLabel         : getMessage('summaryLabel'),
  viewsMenuButtonLabel : getMessage('viewsMenuButtonLabel')
};

const template = document.createElement('template');
template.innerHTML = `
    <div class="views-menu-button">
      <button id="button"
        aria-haspop="true"
        aria-controls="menu">
        <span class="label">Views</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="down" width="12" height="9" viewBox="0 0 12 9">
          <polygon points="1 0, 11 0, 6 8"/>
        </svg>
      </button>
      <div role="menu"
        id="menu"
        aria-labelledby="button">
      </div>
    </div>
`;

export default class ViewsMenuButton extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './css/viewsMenuButton.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.callback = null;

    this.button  = this.shadowRoot.querySelector('button');
    this.labelSpan = this.button.querySelector('.label');
    this.labelSpan.textContent = msg.viewsMenuButtonLabel;
    this.button.addEventListener('click', this.onButtonClick.bind(this));
    this.button.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.menuDiv = this.shadowRoot.querySelector('[role="menu"]');

    this.includeGuidelines = true;

    this.menuitems = [];
    this.firstMenuitem = false;
    this.lastMenuitem = false;
    this.firstChars = [];

    this.closePopup();
    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      true
    );

  }

  set disabled (value) {
    this.button.disabled = value;
  }

  get disabled () {
    return this.button.disabled;
  }

  setActivationCallback (callback) {
    this.callback = callback;
  }

  addGroup(node, label) {
    const groupDiv = document.createElement('div');
    groupDiv.setAttribute('role', 'group');
    groupDiv.setAttribute('aria-label', label);
    node.appendChild(groupDiv);
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = label;
    groupDiv.appendChild(div);
    return groupDiv;
  }

  addMenuitem(node, optionId, message) {
    const menuitemDiv = document.createElement('div');

    menuitemDiv.id = optionId;
    menuitemDiv.tabIndex = -1;
    menuitemDiv.setAttribute('role', 'menuitem');
    menuitemDiv.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
    menuitemDiv.textContent = message;

    node.appendChild(menuitemDiv);

    this.menuitems.push(menuitemDiv);
    if (!this.firstMenuitem) {
      this.firstMenuitem = menuitemDiv;
    }
    this.lastMenuitem = menuitemDiv;

    this.firstChars.push(menuitemDiv.textContent.trim()[0].toLowerCase());

    menuitemDiv.addEventListener(
      'keydown',
      this.onMenuitemKeydown.bind(this)
    );
    menuitemDiv.addEventListener(
      'click',
      this.onMenuitemClick.bind(this)
    );
    menuitemDiv.addEventListener(
      'mouseover',
      this.onMenuitemMouseover.bind(this)
    );
  }

  initMenu (options) {
    let i, rcId, glId, msgId;

    this.menuDiv.innerHTML = '';
    this.menuitems = [];
    this.firstMenuitem = false;
    this.lastMenuitem = false;
    this.firstChars = [];

    this.addMenuitem(this.menuDiv, 'summary', msg.summaryLabel);
    const rcGroupDiv = this.addGroup(this.menuDiv, msg.ruleCategoriesLabel);

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      rcId = ruleCategoryIds[i];
      msgId = getRuleCategoryLabelId(rcId);
      this.addMenuitem(rcGroupDiv, 'rc' + rcId, msg[msgId]);
    }

    if (options.viewsMenuIncludeGuidelines) {
      const glGroupDiv = this.addGroup(this.menuDiv, msg.guidelinesLabel);
      for (i = 0; i < guidelineIds.length; i += 1 ) {
        glId = guidelineIds[i];
        // cannot have periods in the msgId, so converted to underscrore character
        msgId = getGuidelineLabelId(glId).replaceAll('.', '_');
        this.addMenuitem(glGroupDiv, 'gl' + glId, msg[msgId]);
      }
    }
  }

  setFocusToMenuitem(newMenuitem) {
    this.menuitems.forEach(function (item) {
      if (item === newMenuitem) {
        item.tabIndex = 0;
        newMenuitem.focus();
      } else {
        item.tabIndex = -1;
      }
    });
  }

  setFocusToFirstMenuitem() {
    this.setFocusToMenuitem(this.firstMenuitem);
  }

  setFocusToLastMenuitem() {
    this.setFocusToMenuitem(this.lastMenuitem);
  }

  setFocusToPreviousMenuitem(currentMenuitem) {
    let newMenuitem, index;

    if (currentMenuitem === this.firstMenuitem) {
      newMenuitem = this.lastMenuitem;
    } else {
      index = this.menuitems.indexOf(currentMenuitem);
      newMenuitem = this.menuitems[index - 1];
    }
    this.setFocusToMenuitem(newMenuitem);
    return newMenuitem;
  }

  setFocusToNextMenuitem(currentMenuitem) {
    let newMenuitem, index;

    if (currentMenuitem === this.lastMenuitem) {
      newMenuitem = this.firstMenuitem;
    } else {
      index = this.menuitems.indexOf(currentMenuitem);
      newMenuitem = this.menuitems[index + 1];
    }
    this.setFocusToMenuitem(newMenuitem);

    return newMenuitem;
  }

  setFocusByFirstCharacter(currentMenuitem, char) {
    let start, index;

    if (char.length > 1) {
      return;
    }

    char = char.toLowerCase();

    // Get start index for search based on position of currentItem
    start = this.menuitems.indexOf(currentMenuitem) + 1;
    if (start >= this.menuitems.length) {
      start = 0;
    }

    // Check remaining slots in the menu
    index = this.firstChars.indexOf(char, start);

    // If not found in remaining slots, check from beginning
    if (index === -1) {
      index = this.firstChars.indexOf(char, 0);
    }

    // If match was found...
    if (index > -1) {
      this.setFocusToMenuitem(this.menuitems[index]);
    }
  }

  // Utilities

  getIndexFirstChars(startIndex, char) {
    for (let i = startIndex; i < this.firstChars.length; i++) {
      if (char === this.firstChars[i]) {
        return i;
      }
    }
    return -1;
  }

  // Popup menu methods

  openPopup(setFirst = true) {
    getOptions().then( (options) => {
      this.initMenu(options);
      this.menuDiv.style.display = 'block';
      this.button.setAttribute('aria-expanded', 'true');
      if (setFirst) {
        this.setFocusToFirstMenuitem();
      } else {
        this.setFocusToLastMenuitem();
      }
    });
  }

  closePopup() {
    if (this.isOpen()) {
      this.button.removeAttribute('aria-expanded');
      this.menuDiv.style.display = 'none';
    }
  }

  isOpen() {
    return this.button.getAttribute('aria-expanded') === 'true';
  }

  // Menu event onrs

  onButtonKeydown(event) {
    var key = event.key,
      flag = false;

    switch (key) {
      case ' ':
      case 'Enter':
      case 'ArrowDown':
        this.openPopup();
        flag = true;
        break;

      case 'Escape':
        this.closePopup();
        flag = true;
        break;

      case 'ArrowUp':
        this.openPopup(false);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onButtonClick(event) {
    if (this.isOpen()) {
      this.closePopup();
      this.button.focus();
    } else {
      this.openPopup();
    }

    event.stopPropagation();
    event.preventDefault();
  }

  performMenuAction(tgt) {
    const id = tgt.id;
    this.callback(id);
  }

  onMenuitemKeydown(event) {
    var tgt = event.currentTarget,
      key = event.key,
      flag = false;

    function isPrintableCharacter(str) {
      return str.length === 1 && str.match(/\S/);
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.shiftKey) {
      if (isPrintableCharacter(key)) {
        this.setFocusByFirstCharacter(tgt, key);
        flag = true;
      }

      if (event.key === 'Tab') {
        this.button.focus();
        this.closePopup();
        flag = true;
      }
    } else {
      switch (key) {
        case ' ':
        case 'Enter':
          this.closePopup();
          this.performMenuAction(tgt);
          this.button.focus();
          flag = true;
          break;

        case 'Escape':
          this.closePopup();
          this.button.focus();
          flag = true;
          break;

        case 'ArrowUp':
          this.setFocusToPreviousMenuitem(tgt);
          flag = true;
          break;

        case 'ArrowDown':
          this.setFocusToNextMenuitem(tgt);
          flag = true;
          break;

        case 'Home':
        case 'PageUp':
          this.setFocusToFirstMenuitem();
          flag = true;
          break;

        case 'End':
        case 'PageDown':
          this.setFocusToLastMenuitem();
          flag = true;
          break;

        case 'Tab':
          this.closePopup();
          break;

        default:
          if (isPrintableCharacter(key)) {
            this.setFocusByFirstCharacter(tgt, key);
            flag = true;
          }
          break;
      }
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onMenuitemClick(event) {
    var tgt = event.currentTarget;
    this.closePopup();
    this.button.focus();
    this.performMenuAction(tgt);
  }

  onMenuitemMouseover(event) {
    var tgt = event.currentTarget;
    tgt.focus();
  }

  onBackgroundMousedown(event) {
    if (!this.contains(event.target)) {
      if (this.isOpen()) {
        this.closePopup();
        this.button.focus();
      }
    }
  }
}
