/* highlightSelect.js */

const getMessage = browser.i18n.getMessage;

import { getOptions, saveOptions } from '../storage.js';

const template = document.createElement('template');
template.innerHTML = `
    <div class="highlight-select">
      <label for="select">Highlight</label>
      <select id="select">
        <option value="none" selected>None</none>
        <option value="selected">Selected</none>
        <option value="vw">V/W</none>
        <option value="all">All</none>
      </select>
    </div>
`;

export default class HighlightSelect extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'highlightSelect.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.select = this.shadowRoot.querySelector('#select');
    this.select.addEventListener('change', this.onSelectChange.bind(this));

    this.init();
  }

  init () {
    function updateTextContent(elemSelector, messageId) {
      let elem = sr.querySelector(elemSelector);
      let msg = getMessage(messageId);
      if (elem && msg) {
        elem.textContent = msg;
      }
    }

    // "sr" is used by updateTextContent
    let sr = this.shadowRoot;

    updateTextContent('label',              'highlightLabel');
    updateTextContent('[value="none"]',     'highlightOptionNone');
    updateTextContent('[value="selected"]', 'highlightOptionSelected');
    updateTextContent('[value="vw"]',       'highlightOptionVW');
    updateTextContent('[value="all"]',      'highlightOptionAll');

    getOptions().then(this.setSelectValue.bind(this));
  }

  setSelectValue (options) {
    const value = options.highlight;
    for (let i = 0; i < this.select.options.length; i += 1) {
      if (this.select.options[i].value === value) {
        this.select.options[i].selected = true;
      }
    }
  }

  onSelectChange () {
    let value = this.select.value;

    if (value) {
      getOptions().then( (options) => {
        options.highlight = value;
        saveOptions(options);
      });
    }
  }

}
