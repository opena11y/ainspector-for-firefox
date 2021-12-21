/* highlightSelect.js */

const getMessage = browser.i18n.getMessage;

import { getOptions } from '../storage.js';

import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

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
    link.setAttribute('href', 'viewsMenuButton.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.callback = null;

    this.button  = this.shadowRoot.querySelector('button');
    this.labelSpan = this.button.querySelector('.label');
    this.labelSpan.textContent = getMessage('viewsMenuButtonLabel');
    this.button.addEventListener('click', this.onButtonClick.bind(this));

    this.menuDiv = this.shadowRoot.querySelector('[role="menu"]');

    this.includeGuidelines = true;

    this.menuitems = [];
    this.firstMenuitem = false;
    this.lastMenuitem = false;
    this.firstChars = [];

    this.initMenu();
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

  addSeparator() {
    const separatorDiv = document.createElement('div');
    separatorDiv.setAttribute('role', 'separator');
    this.menuDiv.appendChild(separatorDiv);
  }

  addMenuitem(optionId, messageId) {
    const menuitemDiv = document.createElement('div');

    menuitemDiv.id = optionId;
    menuitemDiv.tabIndex = -1;
    menuitemDiv.setAttribute('role', 'menuitem');
    menuitemDiv.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
    menuitemDiv.textContent = getMessage(messageId);

    this.menuDiv.appendChild(menuitemDiv);

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

  initMenu () {
    let i, rcId, glId, msgId;

    this.menuDiv.innerHTML = '';

    this.addMenuitem('summary', 'summaryLabel');
    this.addSeparator();

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      rcId = ruleCategoryIds[i];
      msgId = getRuleCategoryLabelId(rcId);
      this.addMenuitem('rc' + rcId, msgId);
    }

    getOptions().then( (options) => {
      if (options.viewsMenuIncludeGuidelines) {
        this.addSeparator();
        for (i = 0; i < guidelineIds.length; i += 1 ) {
          glId = guidelineIds[i];
          msgId = getGuidelineLabelId(glId);
          this.addMenuitem('gl' + glId, msgId);
        }
      }
      this.addSeparator();
      this.addMenuitem('all-rules', 'allRulesLabel');
    })

    this.closePopup();

    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      true
    );

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

  openPopup() {
    this.menuDiv.style.display = 'block';
    this.button.setAttribute('aria-expanded', 'true');
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
      case 'Down':
        this.openPopup();
        this.setFocusToFirstMenuitem();
        flag = true;
        break;

      case 'Esc':
      case 'Escape':
        this.closePopup();
        flag = true;
        break;

      case 'Up':
      case 'ArrowUp':
        this.openPopup();
        this.setFocusToLastMenuitem();
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
      this.setFocusToFirstMenuitem();
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
