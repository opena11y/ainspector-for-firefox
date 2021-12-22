/* resultElementInfojs */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <div class="result-element-info">
      <h3  id="definition-label">Definition</h3>
      <div id="definition-content"></div>

      <h3  id="action-label">Action</h3>
      <div id="action-content"></div>

      <h3  id="purpose-label">Purpose</h3>
      <div id="purpose-content"></div>

      <h3  id="techniques-label">Techniques</h3>
      <div id="techniques-content"></div>

      <h3  id="target-label">Target Elements</h3>
      <div id="target-content"></div>

      <h3  id="compliance-label">Compliance</h3>
      <div id="compliance-content"></div>

      <h3  id="sc-label">WCAG Success Criteria</h3>
      <div id="sc-content"></div>

      <h3  id="additional-label">Additional Information</h3>
      <div id="additional-content"></div>

    </div>
`;

export default class ResultElementInfo extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultElementInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize headings
    this.setHeading('#definition-label', 'ruleDefinitionLabel');
    this.setHeading('#action-label',     'ruleActionLabel');
    this.setHeading('#purpose-label',    'rulePurposeLabel');
    this.setHeading('#techniques-label', 'ruleTechniquesLabel');
    this.setHeading('#target-label',     'ruleTargetLabel');
    this.setHeading('#compliance-label', 'ruleComplianceLabel');
    this.setHeading('#sc-label',         'ruleSCLabel');
    this.setHeading('#additional-label', 'ruleAdditionalLabel');

    // Create content references
    this.resultRuleInfoDiv = this.shadowRoot.querySelector('.result-rule-info');
    this.definitionDiv = this.shadowRoot.querySelector('#definition-content');
    this.actionDiv     = this.shadowRoot.querySelector('#action-content');
    this.purposeDiv    = this.shadowRoot.querySelector('#purpose-content');
    this.techniquesDiv = this.shadowRoot.querySelector('#techniques-content');
    this.targetDiv     = this.shadowRoot.querySelector('#target-content');
    this.complianceDiv = this.shadowRoot.querySelector('#compliance-content');
    this.scDiv         = this.shadowRoot.querySelector('#sc-content');
    this.additionalDiv = this.shadowRoot.querySelector('#additional-content');
  }

  resize (size) {
    this.resultRuleInfoDiv.style.height = size + 'px';
  }

  setHeading (headingId, messageId) {
    let h = this.shadowRoot.querySelector(headingId);
    let m = getMessage(messageId)
    if (h && m) {
      h.textContent = m;
    }
  }

  // if the info is a string just use textContent
  // if the info is an array, create a list of items
  // Some items maybe an object containing a 'url' and 'title' properties
  renderContent(elem, info) {
    let i, ul, li, a, item;
    if (!info) return;
    if (typeof info === 'string') {
      elem.textContent = info;
    } else {
      if (info.length) {
        elem.innerHTML = '';
        ul = document.createElement('ul');
        for (i = 0; i < info.length; i += 1) {
          li = document.createElement('li');
          item = info[i];
          if (typeof item === 'string') {
            li.textContent = item;
          } else {
            a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            li.appendChild(a);
          }
          ul.appendChild(li);
        }
        elem.appendChild(ul);
      }
    }
  }

  update(ruleInfo) {
    this.renderContent(this.definitionDiv, ruleInfo.definition);
    this.renderContent(this.actionDiv,     ruleInfo.action);
    this.renderContent(this.purposeDiv,    ruleInfo.purpose);
    this.renderContent(this.techniquesDiv, ruleInfo.techniques);
    this.renderContent(this.targetDiv,     ruleInfo.targets);
    this.renderContent(this.complianceDiv, ruleInfo.compliance);
    this.renderContent(this.scDiv,         ruleInfo.sc);
    this.renderContent(this.additionalDiv, ruleInfo.additionalLinks);
  }

  clear () {
    let msg = getMessage('tabIsLoading');
    this.renderContent(this.definitionDiv, msg);
    this.renderContent(this.actionDiv,     msg);
    this.renderContent(this.purposeDiv,    msg);
    this.renderContent(this.techniquesDiv, msg);
    this.renderContent(this.targetDiv,     msg);
    this.renderContent(this.complianceDiv, msg);
    this.renderContent(this.scDiv,         msg);
    this.renderContent(this.additionalDiv, msg);
  }
}
