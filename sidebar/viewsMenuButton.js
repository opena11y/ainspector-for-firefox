/* highlightSelect.js */

const getMessage = browser.i18n.getMessage;

import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

const template = document.createElement('template');
template.innerHTML = `
    <div class="view-menu-button">
      <button id="button"
        aria-haspop="true"
        aria-controls="menu"
        aria-expanded="false">
        Views
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

    this.button  = this.shadowRoot.querySelector('button');
    this.button.textContent = getMessage('viewsMenuButtonLabel');
    this.button.addEventListener('click', this.handleButtonClick.bind(this));

    this.menuDiv = this.shadowRoot.querySelector('[role="menu"]');

    this.includeGuidelines = true;

    this.initMenu();
  }

  addMenuitem(optionId, messageId) {
    const menuitemDiv = document.createElement('div');
    console.log('[addMenuItem]: ' + typeof menuitemDiv + ' ' + optionId + ' ' + messageId);

    menuitemDiv.id = optionId;
    menuitemDiv.tabIndex = -1;
    menuitemDiv.setAttribute('role', 'menuitem');
    menuitemDiv.addEventListener('keydown', this.handleMenuitemKeydown.bind(this));
    menuitemDiv.textContent = getMessage(messageId);

    this.menuDiv.appendChild(menuitemDiv);
  }

  initMenu () {
    let i, rcId, glId, msgId;

    this.menuDiv.innerHTML = '';

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      rcId = ruleCategoryIds[i];
      msgId = getRuleCategoryLabelId(rcId);
      this.addMenuitem(rcId, msgId);
    }

    if (this.includeGuidelines) {
      for (i = 0; i < guidelineIds.length; i += 1 ) {
        glId = guidelineIds[i];
        msgId = getGuidelineLabelId(glId);
        this.addMenuitem(glId, msgId);
      }
    }

  }

  handleButtonClick(event) {
    let tgt = event.currentTarget;

    if (tgt.getAttribute('aria-expanded') === 'true') {
      tgt.setAttribute('aria-expanded', 'false');
      this.menuDiv.classList.remove('show');
    } else {
      tgt.setAttribute('aria-expanded', 'true');
      this.menuDiv.classList.add('show');
    }
  }

  handleMenuitemKeydown(event) {
    let tgt = event.currentTarget;
    this.menuDiv.classList.remove('show');
  }

}
