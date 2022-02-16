/* highlightSelect.js */

import { getOptions, saveOptions } from '../storage.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  highlightLabel          : getMessage('highlightLabel'),
  highlightOptionNone     : getMessage('highlightOptionNone'),
  highlightOptionSelected : getMessage('highlightOptionSelected'),
  highlightOptionVW       : getMessage('highlightOptionVW'),
  highlightOptionAll      : getMessage('highlightOptionAll')
};

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

    this.onChangeEventCallback = false;

    this.init();
  }

  init () {
    function updateTextContent(elemSelector, message) {
      let elem = sr.querySelector(elemSelector);
      if (elem && message) {
        elem.textContent = message;
      }
    }

    // "sr" is used by updateTextContent
    let sr = this.shadowRoot;

    updateTextContent('label',              msg.highlightLabel);
    updateTextContent('[value="none"]',     msg.highlightOptionNone);
    updateTextContent('[value="selected"]', msg.highlightOptionSelected);
    updateTextContent('[value="vw"]',       msg.highlightOptionVW);
    updateTextContent('[value="all"]',      msg.highlightOptionAll);

    getOptions().then(this.setSelectValue.bind(this));
  }

  setChangeEventCallback (callback) {
    this.onChangeEventCallback = callback;
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
        if (this.onChangeEventCallback) {
          this.onChangeEventCallback()
        }
      });
    }
  }

}
