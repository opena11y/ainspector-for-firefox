/* summaryInfo.js */

/* Imports */
import { getOptions }  from '../storage.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  manualChecksAbbrev   : getMessage('manualChecksAbbrev'),
  manualChecksLabel    : getMessage('manualChecksLabel'),
  manualChecksDescRule : getMessage('manualChecksDescRule'),
  manualChecksDescElem : getMessage('manualChecksDescElem'),

  passedAbbrev   : getMessage('passedAbbrev'),
  passedLabel    : getMessage('passedLabel'),
  passedDescRule : getMessage('passedDescRule'),
  passedDescElem : getMessage('passedDescElem'),

  violationsAbbrev   : getMessage('violationsAbbrev'),
  violationsLabel    : getMessage('violationsLabel'),
  violationsDescRule : getMessage('violationsDescRule'),
  violationsDescElem : getMessage('violationsDescElem'),

  warningsAbbrev   : getMessage('warningsAbbrev'),
  warningsLabel    : getMessage('warningsLabel'),
  warningsDescRule : getMessage('warningsDescRule'),
  warningsDescElem : getMessage('warningsDescElem'),

  notApplicableAbbrev   : getMessage('notApplicableAbbrev'),
  notApplicableLabel    : getMessage('notApplicableLabel'),
  notApplicableDescRule : getMessage('notApplicableDescRule'),

  hiddenAbbrev   : getMessage('hiddenAbbrev'),
  hiddenLabel    : getMessage('hiddenLabel'),
  hiddenDescElem : getMessage('hiddenDescElem'),

  elementInfoTitle   : getMessage('elementInfoTitle'),
  ruleInfoTitle      : getMessage('ruleInfoTitle'),

  summaryInfoButtonLabel: getMessage('summaryInfoButtonLabel'),

  closeButtonLabel   : getMessage('closeButtonLabel'),
  moreButtonLabel    : getMessage('moreButtonLabel'),

  moreButtonDisabled : getMessage('moreButtonDisabled')

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
        tabindex="-1"
        id="dialog"
        aria-labelledby="title">
        <div id="title"></div>
        <div class="content">
          <table class="info">
            <thead>
              <tr>
                <th class="symbol">Symbol</th>
                <th class="label">Result</th>
                <th class="desc">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr class="violations">
                <td class="symbol"><code class="abbrev"></code></td>
                <td class="label"></td>
                <td class="desc"></td>
              </tr>
              <tr class="warnings">
                <td class="symbol"><code class="abbrev"></code></td>
                <td class="label"></td>
                <td class="desc"></td>
              </tr>
              <tr class="manual-checks">
                <td class="symbol"><code class="abbrev"></code></td>
                <td class="label"></td>
                <td class="desc"></td>
              </tr>
              <tr class="passed">
                <td class="symbol"><code class="abbrev"></code></td>
                <td class="label"></td>
                <td class="desc"></td>
              </tr>
              <tr class="last">
                <td class="symbol"><code class="abbrev"></code></td>
                <td class="label"></td>
                <td class="desc"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="buttons">
          <button id="more-button"></button>
          <button id="close-button"></button>
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

    function setTableCellLabel (infoTable, rowClass, cellClass, label) {
      const cell = infoTable.querySelector (`.${rowClass} .${cellClass}`);
      if (cell) {
        cell.textContent = label;
      }
    }

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'summaryInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Check for data-info attribute

    const showElementInfo = this.hasAttribute('data-info') ?
                            this.getAttribute('data-info') === 'element' :
                            false;

    // Get references

    this.summaryInfoButton  = this.shadowRoot.querySelector('#summary-info-button');
    this.summaryInfoButton.title  = msg.summaryInfoButtonLabel;
    this.summaryInfoButton.addEventListener('click', this.onSummaryInfoButtonClick.bind(this));

    label = this.shadowRoot.querySelector('#title');
    label.textContent = showElementInfo ?
                        msg.elementInfoTitle :
                        msg.ruleInfoTitle;

    this.dialogDiv = this.shadowRoot.querySelector('[role="dialog"]');
    this.dialogDiv.addEventListener('keydown', this.onDialogKeydown.bind(this));

    const infoTable = this.shadowRoot.querySelector('table.info');

    setTableCellLabel(infoTable, 'violations', 'abbrev', msg.violationsAbbrev);
    setTableCellLabel(infoTable, 'violations', 'label',  msg.violationsLabel);

    setTableCellLabel(infoTable, 'warnings', 'abbrev', msg.warningsAbbrev);
    setTableCellLabel(infoTable, 'warnings', 'label',  msg.warningsLabel);

    setTableCellLabel(infoTable, 'manual-checks', 'abbrev', msg.manualChecksAbbrev);
    setTableCellLabel(infoTable, 'manual-checks', 'label',  msg.manualChecksLabel);

    setTableCellLabel(infoTable, 'passed', 'abbrev', msg.passedAbbrev);
    setTableCellLabel(infoTable, 'passed', 'label',  msg.passedLabel);

    if (showElementInfo) {

      setTableCellLabel(infoTable, 'violations',    'desc', msg.violationsDescElem);
      setTableCellLabel(infoTable, 'warnings',      'desc', msg.warningsDescElem);
      setTableCellLabel(infoTable, 'manual-checks', 'desc', msg.manualChecksDescElem);
      setTableCellLabel(infoTable, 'passed',        'desc', msg.passedDescElem);

      setTableCellLabel(infoTable, 'last', 'abbrev', msg.hiddenAbbrev);
      setTableCellLabel(infoTable, 'last', 'label',  msg.hiddenLabel);
      setTableCellLabel(infoTable, 'last', 'desc',   msg.hiddenDescElem);
    }
    else {
      setTableCellLabel(this.shadowRoot, 'violations',    'desc', msg.violationsDescRule);
      setTableCellLabel(this.shadowRoot, 'warnings',      'desc', msg.warningsDescRule);
      setTableCellLabel(this.shadowRoot, 'manual-checks', 'desc', msg.manualChecksDescRule);
      setTableCellLabel(this.shadowRoot, 'passed',        'desc', msg.passedDescRule);

      setTableCellLabel(this.shadowRoot, 'last', 'abbrev', msg.notApplicableAbbrev);
      setTableCellLabel(this.shadowRoot, 'last', 'label',  msg.notApplicableLabel);
      setTableCellLabel(this.shadowRoot, 'last', 'desc',   msg.notApplicableDescRule);
    }

    this.moreButton = this.shadowRoot.querySelector('#more-button');
    this.moreButton.textContent  = msg.moreButtonLabel;
    this.moreButton.addEventListener('click', this.onMoreButtonClick.bind(this));
    this.moreButton.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.closeButton = this.shadowRoot.querySelector('#close-button');
    this.closeButton.textContent  = msg.closeButtonLabel;
    this.closeButton.addEventListener('click', this.onCloseButtonClick.bind(this));
    this.closeButton.addEventListener('keydown', this.onButtonKeydown.bind(this));

    this.isMouseDownInDialog = false;

    this.dialogDiv.addEventListener(
      'mousedown',
      this.onDialogMousedown.bind(this),
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
    this.openDialog();
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
      if (event.currentTarget === this.closeButton) {
        this.moreButton.focus();
      }
      else {
        this.closeButton.focus();
      }
      event.stopPropagation();
      event.preventDefault();
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

  onDialogMousedown(event) {
    if (this.dialogDiv.contains(event.target)) {
      this.isMouseDownInDialog = true;
    }
  }

  onBackgroundMousedown(event) {
    if (this.isOpen()) {
      if (!this.isMouseDownInDialog) {
        this.closeDialog();
      }
    }
    this.isMouseDownInDialog = false;
  }

}

