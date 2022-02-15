/* ruleSummary.js */

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {};
msg.violationsAbbrev   = getMessage('violationsAbbrev');
msg.violationsLabel    = getMessage('violationsLabel');
msg.warningsAbbrev     = getMessage('warningsAbbrev');
msg.warningsLabel      = getMessage('warningsLabel');
msg.manualChecksAbbrev = getMessage('manualChecksAbbrev');
msg.manualChecksLabel  = getMessage('manualChecksLabel');
msg.passedAbbrev       = getMessage('passedAbbrev');
msg.passedLabel        = getMessage('passedLabel');


const template = document.createElement('template');
template.innerHTML = `
    <table aria-label="Summary of rule results">
      <thead>
        <tr>
          <th id="violations-label" aria-label="Violaions">V</th>
          <th id="warnings-label" aria-label="Warnings">W</th>
          <th id="manual-checks-label" aria-label="Manual Checks">MC</th>
          <th id="passed-label" aria-label="Passed">P</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="violations-value">-</td>
          <td id="warnings-value">-</td>
          <td id="manual-checks-value">-</td>
          <td id="passed-value">-</td>
        </tr>
      </tbody>
    </table>
`;

export default class ResultSummary extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'summary.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize abbreviations and labels
    this.violationsTh = this.shadowRoot.querySelector('#violations-label');
    this.violationsTh.textContent = msg.violationsAbbrev;
    this.violationsTh.setAttribute('aria-label', msg.violationsLabel);

    this.warningsTh = this.shadowRoot.querySelector('#warnings-label');
    this.warningsTh.textContent = msg.warningsAbbrev;
    this.warningsTh.setAttribute('aria-label', msg.warningsLabel);

    this.manualChecksTh = this.shadowRoot.querySelector('#manual-checks-label');
    this.manualChecksTh.textContent = msg.manualChecksAbbrev;
    this.manualChecksTh.setAttribute('aria-label', msg.manualChecksLabel);

    this.passedTh = this.shadowRoot.querySelector('#passed-label');
    this.passedTh.textContent = msg.passedAbbrev;
    this.passedTh.setAttribute('aria-label', msg.passedLabel);

    // Initialize references
    this.violationsTd   = this.shadowRoot.querySelector('#violations-value');
    this.warningsTd     = this.shadowRoot.querySelector('#warnings-value');
    this.manualChecksTd = this.shadowRoot.querySelector('#manual-checks-value');
    this.passedTd       = this.shadowRoot.querySelector('#passed-value');
  }

  set violations (value) {
    this.violationsTd.textContent = value;
  }

  set warnings (value) {
    this.warningsTd.textContent = value;
  }

  set manualChecks (value) {
    this.manualChecksTd.textContent = value;
  }

  set passed (value) {
    this.passedTd.textContent = value;
  }

  get violations () {
    return this.violationsTd.textContent;
  }

  get warnings () {
    return this.warningsTd.textContent;
  }

  get manual_checks () {
    return this.manualChecksTd.textContent;
  }

  get passed () {
    return this.passedTd.textContent;
  }

  clear () {
    this.violationsTd.textContent   = '-';
    this.warningsTd.textContent     = '-';
    this.manualChecksTd.textContent = '-';
    this.passedTd.textContent       = '-';
  }
}
