/* ruleSummary.js */

const getMessage = browser.i18n.getMessage;

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
    this.violationsTh.textContent = getMessage('violationsAbbrev');
    this.violationsTh.setAttribute('aria-label', getMessage('violationsLabel'));

    this.warningsTh = this.shadowRoot.querySelector('#warnings-label');
    this.warningsTh.textContent = getMessage('warningsAbbrev');
    this.warningsTh.setAttribute('aria-label', getMessage('warningsLabel'));

    this.manualChecksTh = this.shadowRoot.querySelector('#manual-checks-label');
    this.manualChecksTh.textContent = getMessage('manualChecksAbbrev');
    this.manualChecksTh.setAttribute('aria-label', getMessage('manualChecksLabel'));

    this.passedTh = this.shadowRoot.querySelector('#passed-label');
    this.passedTh.textContent = getMessage('passedAbbrev');
    this.passedTh.setAttribute('aria-label', getMessage('passedLabel'));

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
