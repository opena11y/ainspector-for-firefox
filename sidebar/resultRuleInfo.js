/* ruleSummary.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <div class="result-rule-info">
      Rule Information
    </div>
`;

export default class ResultRuleInfo extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultRuleInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.ruleInfoDiv = this.shadowRoot.querySelector('d.result-rule-info');

  }

  update(ruleInfo) {

  }

  clear () {
    this.ruleInfoDiv.innerHTML = '';
  }
}
