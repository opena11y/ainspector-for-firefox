/* ruleResultInfo.js */

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  ruleActionLabel     : getMessage('ruleActionLabel'),
  ruleAdditionalLabel : getMessage('ruleAdditionalLabel'),
  ruleComplianceLabel : getMessage('ruleComplianceLabel'),
  ruleDefinitionLabel : getMessage('ruleDefinitionLabel'),
  rulePurposeLabel    : getMessage('rulePurposeLabel'),
  ruleSCLabel         : getMessage('ruleSCLabel'),
  ruleScopeLabel      : getMessage('ruleScopeLabel'),
  ruleSelectedLabel   : getMessage('ruleSelectedLabel'),
  ruleSummaryLabel    : getMessage('ruleSummaryLabel'),
  ruleTargetLabel     : getMessage('ruleTargetLabel'),
  ruleTechniquesLabel : getMessage('ruleTechniquesLabel')
};

const template = document.createElement('template');
template.innerHTML = `
    <section class="result-rule-info" aria-label="Selected Rule">
      <div id="messages">
        <div id="message1" class="message"></div>
        <div id="message2" class="message"></div>
      </div>
      <div id="info">
        <h3  id="summary-label">Summary</h3>
        <div id="summary-content"></div>

        <h3  id="definition-label">Definition</h3>
        <div id="definition-content"></div>

        <h3  id="scope-label">Action</h3>
        <div id="scope-content"></div>

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
    </section>
`;

export default class ResultRuleInfo extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './css/resultRuleInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize headings
    this.setHeading('#summary-label',    msg.ruleSummaryLabel);
    this.setHeading('#definition-label', msg.ruleDefinitionLabel);
    this.setHeading('#scope-label',      msg.ruleScopeLabel);
    this.setHeading('#action-label',     msg.ruleActionLabel);
    this.setHeading('#purpose-label',    msg.rulePurposeLabel);
    this.setHeading('#techniques-label', msg.ruleTechniquesLabel);
    this.setHeading('#target-label',     msg.ruleTargetLabel);
    this.setHeading('#compliance-label', msg.ruleComplianceLabel);
    this.setHeading('#sc-label',         msg.ruleSCLabel);
    this.setHeading('#additional-label', msg.ruleAdditionalLabel);

    // Create content references
    this.resultRuleInfoSect = this.shadowRoot.querySelector('.result-rule-info');

    this.messagesDiv    = this.shadowRoot.querySelector('#messages');
    this.message1Div    = this.shadowRoot.querySelector('#message1');
    this.message2Div    = this.shadowRoot.querySelector('#message2');

    this.infoDiv       = this.shadowRoot.querySelector('#info');
    this.summaryDiv    = this.shadowRoot.querySelector('#summary-content');
    this.definitionDiv = this.shadowRoot.querySelector('#definition-content');
    this.scopeDiv      = this.shadowRoot.querySelector('#scope-content');
    this.actionDiv     = this.shadowRoot.querySelector('#action-content');
    this.purposeDiv    = this.shadowRoot.querySelector('#purpose-content');
    this.techniquesDiv = this.shadowRoot.querySelector('#techniques-content');
    this.targetDiv     = this.shadowRoot.querySelector('#target-content');
    this.complianceDiv = this.shadowRoot.querySelector('#compliance-content');
    this.scDiv         = this.shadowRoot.querySelector('#sc-content');
    this.additionalDiv = this.shadowRoot.querySelector('#additional-content');

    this.copyText = '';

    // Define an accessible name for the region
    this.resultRuleInfoSect.setAttribute('aria-label', msg.ruleSelectedLabel);

  }

  focus () {
    this.resultRuleInfoSect.focus();
  }

  setHeading (headingId, message) {
    let h = this.shadowRoot.querySelector(headingId);
    if (h && message) {
      h.textContent = message;
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
            if (item.url) {
              a = document.createElement('a');
              a.href = item.url;
              a.textContent = item.title;
              a.target="_ai_reference"
              li.appendChild(a);
            } else {
              li.textContent = item.title;
            }
          }
          ul.appendChild(li);
        }
        elem.appendChild(ul);
      }
    }
  }

  // if the info is a string just use textContent
  // if the info is an array, create a list of items
  // Some items maybe an object containing a 'url' and 'title' properties
  appendToCopyText(title, info, listChar) {
    if (typeof listChar !== 'string') {
      listChar = '';
    }
    if (!info) return;

    this.copyText += title + '\n';

    if (typeof info === 'string') {
      this.copyText += info + '\n';
    } else {
      if (info.length) {
        for (let i = 0; i < info.length; i += 1) {
          let item = info[i];
          if (typeof item === 'string') {
            this.copyText += listChar + item + '\n';
          } else {
            if (item.url) {
              this.copyText += listChar + item.title + ' (' + item.url+ ')\n';
            } else {
              this.copyText += listChar + item.title + '\n';
            }
          }
        }
      }
    }
    this.copyText += '\n';

  }

  update(ruleInfo) {
    let ruleId = '';
    if (typeof ruleInfo.ruleId === 'string') {
      ruleId = ruleInfo.ruleId.replace('_', ' ') + ': ';
    }

    this.messagesDiv.classList.add('hide');
    this.infoDiv.classList.remove('hide');
    this.renderContent(this.summaryDiv,    ruleInfo.summary);
    this.renderContent(this.definitionDiv, ruleInfo.definition);
    this.renderContent(this.scopeDiv,      ruleInfo.scope);
    this.renderContent(this.actionDiv,     ruleInfo.action);
    this.renderContent(this.purposeDiv,    ruleInfo.purpose);
    this.renderContent(this.techniquesDiv, ruleInfo.techniques);
    this.renderContent(this.targetDiv,     ruleInfo.targets);
    this.renderContent(this.complianceDiv, ruleInfo.compliance);
    this.renderContent(this.scDiv,         ruleInfo.sc);
    this.renderContent(this.additionalDiv, ruleInfo.additionalLinks);

    this.copyText = ruleId + ruleInfo.summary + '\n\n';
    this.appendToCopyText(msg.ruleSummaryLabel,    ruleInfo.summary);
    this.appendToCopyText(msg.ruleDefinitionLabel, ruleInfo.definition);
    this.appendToCopyText(msg.ruleScopeLabel,      ruleInfo.scope);
    this.appendToCopyText(msg.ruleActionLabel,     ruleInfo.action);
    this.appendToCopyText(msg.rulePurposeLabel,    ruleInfo.purpose);
    this.appendToCopyText(msg.ruleTechniquesLabel, ruleInfo.techniques, '* ');
    this.appendToCopyText(msg.ruleTargetLabel,     ruleInfo.targets, '* ');
    this.appendToCopyText(msg.ruleComplianceLabel, ruleInfo.compliance);
    this.appendToCopyText(msg.ruleSCLabel,         ruleInfo.sc, '* ');
    this.appendToCopyText(msg.ruleAdditionalLabel, ruleInfo.additionalLinks, '* ');

  }

  clear (message1, message2) {
    this.messagesDiv.classList.remove('hide');
    this.infoDiv.classList.add('hide');
    this.message1Div.textContent = '';
    this.message2Div.textContent = '';

    if (typeof message1 === 'string') {
      this.message1Div.textContent = message1;
    }
    if (typeof message2 === 'string') {
      this.message2Div.textContent = message2;
    }

    this.renderContent(this.summaryDiv,    '');
    this.renderContent(this.definitionDiv, '');
    this.renderContent(this.scopeDiv,      '');
    this.renderContent(this.actionDiv,     '');
    this.renderContent(this.purposeDiv,    '');
    this.renderContent(this.techniquesDiv, '');
    this.renderContent(this.targetDiv,     '');
    this.renderContent(this.complianceDiv, '');
    this.renderContent(this.scDiv,         '');
    this.renderContent(this.additionalDiv, '');

    this.copyText = '';
  }

  getText () {
    return this.copyText;
  }
}
