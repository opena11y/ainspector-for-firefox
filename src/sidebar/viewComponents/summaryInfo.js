/* summaryInfo.js */

/* Imports */
import { getOptions }  from '../../storage.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  manualCheckAbbrev   : getMessage('manualChecksAbbrev'),
  manualCheckLabel    : getMessage('manualCheckLabel'),

  passedAbbrev   : getMessage('passedAbbrev'),
  passedLabel    : getMessage('passedLabel'),

  violationAbbrev   : getMessage('violationsAbbrev'),
  violationLabel    : getMessage('violationLabel'),

  warningAbbrev   : getMessage('warningsAbbrev'),
  warningLabel    : getMessage('warningLabel'),

  notApplicableAbbrev   : getMessage('notApplicableAbbrev'),
  notApplicableLabel    : getMessage('notApplicableLabel'),

  hiddenAbbrev   : getMessage('hiddenAbbrev'),
  hiddenLabel    : getMessage('hiddenLabel'),

  infoDialogTitle: getMessage('infoDialogTitle'),

  ruleResultTypesLabel    : getMessage('ruleResultTypesLabel'),
  elementResultTypesLabel : getMessage('elementResultTypesLabel'),
  numericalResultsLabel   : getMessage('numericalResultsLabel'),

  ruleNumberDesc    : getMessage('ruleNumberDesc'),
  elementNumberDesc : getMessage('elementNumberDesc'),

  summaryInfoButtonLabel  : getMessage('summaryInfoButtonLabel'),
  numericalResultsLabel   : getMessage('numericalResultsLabel'),

  closeButtonLabel   : getMessage('closeButtonLabel'),
  moreButtonLabel    : getMessage('moreButtonLabel'),
  moreButtonDisabled : getMessage('moreButtonDisabled'),
};

const template = document.createElement('template');
template.innerHTML = `
  <div class="summary-info">
    <button id="summary-info-button">
      <svg role="none"
           height="20px"
           width="20px"
           version="1.1"
           viewBox="0 0 85 85"
           xml:space="preserve"
           xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink" >
        <path d="M42.5,0.003C19.028,0.003,0,19.031,0,42.503s19.028,42.5,42.5,42.5S85,65.976,85,42.503S65.972,0.003,42.5,0.003z   M42.288,66.27c0,0-1.972,1.311-3.32,1.305c-0.12,0.055-0.191,0.087-0.191,0.087l0.003-0.087c-0.283-0.013-0.568-0.053-0.855-0.125  l-0.426-0.105c-2.354-0.584-3.6-2.918-3.014-5.271l3.277-13.211l1.479-5.967c1.376-5.54-4.363,1.178-5.54-1.374  c-0.777-1.687,4.464-5.227,8.293-7.896c0,0,1.97-1.309,3.319-1.304c0.121-0.056,0.192-0.087,0.192-0.087l-0.005,0.087  c0.285,0.013,0.57,0.053,0.857,0.124l0.426,0.106c2.354,0.584,3.788,2.965,3.204,5.318l-3.276,13.212l-1.482,5.967  c-1.374,5.54,4.27-1.204,5.446,1.351C51.452,60.085,46.116,63.601,42.288,66.27z M50.594,24.976  c-0.818,3.295-4.152,5.304-7.446,4.486c-3.296-0.818-5.305-4.151-4.487-7.447c0.818-3.296,4.152-5.304,7.446-4.486  C49.403,18.346,51.411,21.68,50.594,24.976z"/>
      </svg>
    </button>
    <div class="dialog-container">
      <div role="dialog"
        class="info"
        tabindex="-1"
        id="dialog"
        aria-labelledby="title">
        <div class="header">
          <div id="title"></div>
          <button id="close-button-1" aria-label="close" tabindex="-1">✕</button>
        </div>
        <div class="content">

          <h2 id="h2-result-types"></h2>
          <table class="info result-types" aria-labelledby="h2-result-types">
            <tbody>
              <tr class="violation">
                <th scope="row" class="symbol"><span class="abbrev"></span></th>
                <td class="label"></td>
              </tr>
              <tr class="warning">
                <th scope="row" class="symbol"><span class="abbrev"></span></th>
                <td class="label"></td>
              </tr>
              <tr class="manual-check">
                <th scope="row" class="symbol"><span class="abbrev"></span></th>
                <td class="label"></td>
              </tr>
              <tr class="passed">
                <th scope="row" class="symbol"><span class="abbrev"></span></th>
                <td class="label"></td>
              </tr>
              <tr class="not-applicable hidden">
                <th scope="row" class="symbol"><span class="abbrev"></span></th>
                <td class="label"></td>
              </tr>
            </body>
          </table>

          <h2 id="h2-numerical-results"></h2>
          <div id="numerical-desc"></div>
        </div>
        <div class="buttons">
          <button id="more-button"></button>
          <button id="close-button-2"></button>
        </div>
      </div>
    </div>
  </div>
`;

export default class summaryInfo extends HTMLElement {
  constructor () {
    let label;

    super();
    this.attachShadow({ mode: 'open' });

    function setTableCellLabel (resultTypesTable, rowClass, cellClass, label) {
      const cell = resultTypesTable.querySelector (`.${rowClass} .${cellClass}`);
      if (cell) {
        cell.textContent = label;
      }
    }

    // Use external CSS stylesheet
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './css/dialog.css');
    this.shadowRoot.appendChild(link);

    link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './css/summaryInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Check for data-info attribute

    const dataInfoAttr = this.getAttribute('data-info');

    // Get references

    this.summaryInfoDiv  = this.shadowRoot.querySelector('.summary-info');

    this.summaryInfoButton  = this.shadowRoot.querySelector('#summary-info-button');
    this.summaryInfoButton.addEventListener('click', this.onSummaryInfoButtonClick.bind(this));

    this.dialogDiv = this.shadowRoot.querySelector('[role="dialog"]');
    this.dialogDiv.addEventListener('keydown', this.onDialogKeydown.bind(this));

    const titleDiv = this.shadowRoot.querySelector('#title');
    titleDiv.textContent = msg.infoDialogTitle;

    const resultTypesTable      = this.shadowRoot.querySelector('table.result-types');

    setTableCellLabel(resultTypesTable, 'violation', 'abbrev', msg.violationAbbrev);
    setTableCellLabel(resultTypesTable, 'violation', 'label',  msg.violationLabel);

    setTableCellLabel(resultTypesTable, 'warning', 'abbrev', msg.warningAbbrev);
    setTableCellLabel(resultTypesTable, 'warning', 'label',  msg.warningLabel);

    setTableCellLabel(resultTypesTable, 'manual-check', 'abbrev', msg.manualCheckAbbrev);
    setTableCellLabel(resultTypesTable, 'manual-check', 'label',  msg.manualCheckLabel);

    setTableCellLabel(resultTypesTable, 'passed', 'abbrev', msg.passedAbbrev);
    setTableCellLabel(resultTypesTable, 'passed', 'label',  msg.passedLabel);

    if (dataInfoAttr === 'element-info') {
      this.shadowRoot.querySelector('#h2-result-types').textContent = msg.elementResultTypesLabel;

      setTableCellLabel(resultTypesTable, 'hidden', 'abbrev', msg.hiddenAbbrev);
      setTableCellLabel(resultTypesTable, 'hidden', 'label',  msg.hiddenLabel);

      this.shadowRoot.querySelector('#h2-numerical-results').textContent = msg.numericalResultsLabel;
      this.shadowRoot.querySelector('#numerical-desc').textContent = msg.elementNumberDesc;
    }
    else {
      this.shadowRoot.querySelector('#h2-result-types').textContent = msg.ruleResultTypesLabel;

      setTableCellLabel(this.shadowRoot, 'not-applicable', 'abbrev', msg.notApplicableAbbrev);
      setTableCellLabel(this.shadowRoot, 'not-applicable', 'label',  msg.notApplicableLabel);

      this.shadowRoot.querySelector('#h2-numerical-results').textContent = msg.numericalResultsLabel;
      this.shadowRoot.querySelector('#numerical-desc').textContent = msg.ruleNumberDesc;
    }

    this.moreButton = this.shadowRoot.querySelector('#more-button');
    this.moreButton.textContent  = msg.moreButtonLabel;
    this.moreButton.addEventListener('click', this.onMoreButtonClick.bind(this));
    this.moreButton.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.closeButton1 = this.shadowRoot.querySelector('#close-button-1');
    this.closeButton1.setAttribute('aria-label', msg.closeButtonLabel);
    this.closeButton1.addEventListener('click', this.onCloseButtonClick.bind(this));
    this.closeButton1.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.closeButton2 = this.shadowRoot.querySelector('#close-button-2');
    this.closeButton2.textContent  = msg.closeButtonLabel;
    this.closeButton2.addEventListener('click', this.onCloseButtonClick.bind(this));
    this.closeButton2.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.isMouseDownInSummaryInfo = false;

    this.summaryInfoDiv.addEventListener(
      'mousedown',
      this.onSummaryInfoMousedown.bind(this),
      true
    );

    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      false
    );

  }

  isOpen() {
    return this.summaryInfoButton.getAttribute('aria-expanded') === 'true';
  }

  openDialog () {
    this.moreButton.disabled = false;
    this.moreButton.title = '';
    this.dialogDiv.style.display = 'block';
    this.summaryInfoButton.setAttribute('aria-expanded', 'true');
    this.dialogDiv.focus();
  }

  closeDialog () {
    if (this.isOpen()) {
      this.summaryInfoButton.removeAttribute('aria-expanded');
      this.dialogDiv.style.display = 'none';
      this.summaryInfoButton.focus();
    }
  }

  onSummaryInfoButtonClick () {
    if (this.isOpen()) {
      this.closeDialog();
    }
    else {
      this.openDialog();
    }
  }

  onMoreButtonClick () {
    const moreButton = this.moreButton;

    function onCreated(tab) {
      moreButton.disabled = true;
      moreButton.title = msg.moreButtonDisabled;
      console.log(`Created new tab: ${tab.id}`)
    }

    function onError(error) {
      console.log(`Error: ${error}`);
    }

    getOptions().then( (options) => {
      let newTab = browser.tabs.create({
        url:`${options.documentationURL}`
      });

      newTab.then(onCreated, onError);
    });

  }

  onCloseButtonClick () {
    this.closeDialog();
  }

  onButtonKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.key === 'Tab') {
      if (!event.shiftKey && (event.currentTarget === this.closeButton2)) {
        this.moreButton.focus();
        event.stopPropagation();
        event.preventDefault();
      }
      else {
        if (event.shiftKey && (event.currentTarget === this.moreButton)) {
          this.closeButton2.focus();
          event.stopPropagation();
          event.preventDefault();
        }
      }
    }
  }

  onDialogKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if ((event.currentTarget === event.target) &&
        (event.key === 'Tab')) {
      this.moreButton.focus();
      event.stopPropagation();
      event.preventDefault();
    }

    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  onSummaryInfoMousedown(event) {
    if (this.summaryInfoDiv.contains(event.target)) {
      this.isMouseDownInSummaryInfo = true;
    }
  }

  onBackgroundMousedown(event) {
    if (this.isOpen()) {
      if (!this.isMouseDownInSummaryInfo) {
        this.closeDialog();
      }
    }
    this.isMouseDownInSummaryInfo = false;
  }

}

