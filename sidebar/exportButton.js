/* rerunEvaluationButton.js */

const getMessage = browser.i18n.getMessage;

import { getOptions, saveOptions } from '../storage.js';
import validatePrefix from '../validatePrefix.js';


const template = document.createElement('template');
template.innerHTML = `
    <div class="export-button">
      <button id="export-button"
        aria-haspop="true"
        aria-controls="dialog"
        aria-live="off">
        Export
      </button>
      <div role="dialog"
        tabindex="-1"
        id="dialog"
        aria-labelledby="title">
        <div id="title">Export Evalution Options</div>
          <fieldset>
            <legend id="options-export-format-legend">Export Format</legend>
            <label class="radio">
              <input type="radio" name="export-format" id="options-export-csv" checked/>
              <span id="options-export-csv-label">CSV</span>
            </label>
            <label class="radio">
              <input type="radio" name="export-format" id="options-export-json"/>
              <span id="options-export-json-label">JSON</span>
            </label>
          </fieldset>

          <fieldset>
            <legend id="options-filename-legend">Default Filename Options</legend>

            <label id="options-export-prefix-label"
              for="options-export-prefix">
              Export File Prefix (up to 16 characters)
            </label>
            <input id="options-export-prefix" type="text" size="20" aria-describedby="option-export-prefix-desc"/>
            <div class="desc" id="options-export-prefix-desc">Can be used to customize export file names for specific projects.</div>

            <label class="checkbox">
              <input type="checkbox" checked id="options-export-date"/>
              <span id="options-export-include-date-label">Include date and time in default file name (e.g. yyyy-mm-dd-XXh-YYm-ZZs).</span>
            </label>
          </fieldset>

          <div class="no-feildset">
           <label class="checkbox">
            <input type="checkbox" id="options-export-prompt">
            <span id="options-export-prompt-for-options-label">Do not prompt me for export options.</span>
          </label>
        </div>
        <div class="buttons">
          <button id="cancel-button">Cancel</button>
          <button id="ok-button">OK</button>
        </div>
      </div>
    </div>
`;

export default class ExportButton extends HTMLElement {
  constructor () {
    let label;
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'dialog.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.callback = null;
    this.promptForDelay = true;
    this.delayValue = 5;
    this.timerValue = 0;

    this.exportButton  = this.shadowRoot.querySelector('#export-button');
    this.exportButton.textContent = getMessage('exportButtonLabel');
    this.exportButton.addEventListener('click', this.onExportButtonClick.bind(this));

    this.dialogDiv = this.shadowRoot.querySelector('[role="dialog"]');
    label = this.dialogDiv.querySelector('#title');
    label.textContent = getMessage('exportDialogTitle');
    this.dialogDiv.addEventListener('keydown', this.onDialogKeydown.bind(this));

    this.exportCSV      = this.shadowRoot.querySelector('input[id="options-export-csv"]');
    this.exportCSV.addEventListener('keydown', this.onFirstControlKeydown.bind(this));
    this.exportCSV.addEventListener('focus', this.onFocus.bind(this));
    this.exportCSV.addEventListener('blur', this.onBlur.bind(this));

    this.exportJSON     = this.shadowRoot.querySelector('input[id="options-export-json"]');
    this.exportJSON.addEventListener('keydown', this.onFirstControlKeydown.bind(this));
    this.exportJSON.addEventListener('focus', this.onFocus.bind(this));
    this.exportJSON.addEventListener('blur', this.onBlur.bind(this));

    this.exportPrefix   = this.shadowRoot.querySelector('#options-export-prefix');

    this.exportDate     = this.shadowRoot.querySelector('#options-export-date');
    this.exportDate.addEventListener('focus', this.onFocus.bind(this));
    this.exportDate.addEventListener('blur', this.onBlur.bind(this));

    this.exportPrompt   = this.shadowRoot.querySelector('#options-export-prompt');
    this.exportPrompt.addEventListener('focus', this.onFocus.bind(this));
    this.exportPrompt.addEventListener('blur', this.onBlur.bind(this));

    this.cancelButton = this.shadowRoot.querySelector('#cancel-button');
    this.cancelButton.textContent  = getMessage('cancelButtonLabel');
    this.cancelButton.addEventListener('click', this.onCancelButtonClick.bind(this));

    this.okButton = this.shadowRoot.querySelector('#ok-button');
    this.okButton.textContent  = getMessage('okButtonLabel');
    this.okButton.addEventListener('click', this.onOkButtonClick.bind(this));
    this.okButton.addEventListener('keydown', this.onOkButtonKeydown.bind(this));

    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      true
    );

    this.setDialogLabels();
    getOptions().then( (options) => {
      // Set form element values and states
      this.exportCSV.checked     = options.exportFormat === 'CSV';
      this.exportJSON.checked    = options.exportFormat === 'JSON';
      this.exportPrefix.value    = options.filenamePrefix;
      this.exportDate.checked    = options.includeDate;
      this.exportPrompt.checked  = options.promptForExportOptions;
    });
  }


  setDialogLabels () {
    const optionsExportFormatLegend    = this.shadowRoot.querySelector('#options-export-format-legend');
    optionsExportFormatLegend.textContent   = getMessage('optionsExportFormatLegend');

    const optionsExportCSVLabel        = this.shadowRoot.querySelector('#options-export-csv-label');
    optionsExportCSVLabel.textContent       = getMessage('optionsExportCSVLabel');

    const optionsExportJSONLabel       = this.shadowRoot.querySelector('#options-export-json-label');
    optionsExportJSONLabel.textContent      = getMessage('optionsExportJSONLabel');

    const optionsExportPrefixLabel     = this.shadowRoot.querySelector('#options-export-prefix-label');
    optionsExportPrefixLabel.textContent = getMessage('optionsExportPrefixLabel');

    const optionsExportPrefixDesc      = this.shadowRoot.querySelector('#options-export-prefix-desc');
    optionsExportPrefixDesc.textContent  = getMessage('optionsExportPrefixDesc');

    const optionsExportIncludeDateLabel = this.shadowRoot.querySelector('#options-export-include-date-label');
    optionsExportIncludeDateLabel.textContent  = getMessage('optionsExportIncludeDate');

    const optionsExportPromptForOptionsLabel =  this.shadowRoot.querySelector('#options-export-prompt-for-options-label');
    optionsExportPromptForOptionsLabel.textContent  = getMessage('optionsExportPromptForOptions');
  }


  set disabled (value) {
    this.exportButton.disabled = value;
  }

  get disabled () {
    return this.exportButton.disabled;
  }

  setActivationCallback (callback) {
    this.callback = callback;
  }

  tryActivationCallback () {
    if (this.callback) {
      this.callback();
    }
  }

  isOpen() {
    return this.exportButton.getAttribute('aria-expanded') === 'true';
  }

  openDialog () {
    this.dialogDiv.style.display = 'block';
    this.exportButton.setAttribute('aria-expanded', 'true');
    this.dialogDiv.focus();
  }

  closeDialog () {
    if (this.isOpen()) {
      this.exportButton.removeAttribute('aria-expanded');
      this.dialogDiv.style.display = 'none';
      this.exportButton.focus();
    }
  }


  onExportButtonClick () {
    getOptions().then( (options) => {
      if (options.promptForExportOptions) {
        this.openDialog();
      } else {
        this.tryActivationCallback();
      }
    });
  }

  onCancelButtonClick () {
    this.closeDialog();
  }

  onOkButtonClick () {
    this.closeDialog();
    const options = {
      exportFormat: (this.exportCSV.checked ? 'CSV' :    'JSON'),
      filenamePrefix: validatePrefix(this.exportPrefix.value),
      includeDate: this.exportDate.checked,
      includeTime: this.exportDate.checked,
      promptForExportOptions: this.exportPrompt.checked
    }
    saveOptions(options).then(this.tryActivationCallback());
  }

  onDialogKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if ((event.currentTarget === event.target) &&
        (event.key === 'Tab') &&
        event.shiftKey) {
      this.okButton.focus();
      event.stopPropagation();
      event.preventDefault();
    }

    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  onFirstControlKeydown(event) {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.key === 'Tab' && event.shiftKey) {
        this.okButton.focus();
        event.stopPropagation();
        event.preventDefault();
      }
  }

  onOkButtonKeydown(event) {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        if (this.exportCSV.checked) {
          this.exportCSV.focus();
        } else {
          this.exportJSON.focus();
        }
        event.stopPropagation();
        event.preventDefault();
      }
  }

  onBackgroundMousedown(event) {
    if (!this.contains(event.target)) {
      if (this.isOpen()) {
        this.closeDialog();
      }
    }
  }

  onFocus (event) {
    let tgt = event.currentTarget;
    tgt.parentNode.classList.add('focus');
  }

  onBlur (event) {
    let tgt = event.currentTarget;
    tgt.parentNode.classList.remove('focus');
  }

}
