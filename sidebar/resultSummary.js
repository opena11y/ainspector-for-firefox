/* ruleSummary.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <table aria-label="Summary of rule results">
      <thead>
        <tr>
          <th id="violationsLabel" aria-label="Violaions">V</th>
          <th id="warningsLabel" aria-label="Warnings">W</th>
          <th id="manualChecksLabel" aria-label="Manual Checks">MC</th>
          <th id="passedLabel" aria-label="Passed">P</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="violationsValue">-</td>
          <td id="warningsValue">-</td>
          <td id="manualChecksValue">-</td>
          <td id="passedValue">-</td>
        </tr>
      </tbody>
    </table>
`;

export default class ResultSummary extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    console.log('Created[A]');

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultSummary.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize abbreviations and labels
    this.violationsTh = this.shadowRoot.querySelector('#violationsLabel');
    this.violationsTh.textContent = getMessage('violationsAbbrev');
    this.violationsTh.setAttribute('aria-label', getMessage('violationsLabel'));

    this.warningsTh = this.shadowRoot.querySelector('#warningsLabel');
    this.warningsTh.textContent = getMessage('warningsAbbrev');
    this.warningsTh.setAttribute('aria-label', getMessage('warningsLabel'));

    this.manualChecksTh = this.shadowRoot.querySelector('#manualChecksLabel');
    this.manualChecksTh.textContent = getMessage('manualChecksAbbrev');
    this.manualChecksTh.setAttribute('aria-label', getMessage('manualChecksLabel'));

    this.passedTh = this.shadowRoot.querySelector('#passedLabel');
    this.passedTh.textContent = getMessage('passedAbbrev');
    this.passedTh.setAttribute('aria-label', getMessage('passedLabel'));

    // Initialize references
    this.violationsTd   = this.shadowRoot.querySelector('#violationsValue');
    this.warningsTd     = this.shadowRoot.querySelector('#warningsValue');
    this.manualChecksTd = this.shadowRoot.querySelector('#manualChecksValue');
    this.passedTd       = this.shadowRoot.querySelector('#passedValue');

    console.log('Created[B]');
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

  clear () {
    this.violationsTd.textContent   = '-';
    this.warningsTd.textContent     = '-';
    this.manualChecksTd.textContent = '-';
    this.passedTd.textContent       = '-';
  }
}
