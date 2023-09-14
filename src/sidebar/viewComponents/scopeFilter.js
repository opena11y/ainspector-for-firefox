/* scopeFilter.js */

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  ruleScopeLabel         : getMessage("ruleScopeLabel"),
  scopeAllRulesLabel     : getMessage("scopeAllRulesLabel"),
  scopePageRulesLabel    : getMessage("scopePageRulesLabel"),
  scopeWebsiteRulesLabel : getMessage("scopeWebsiteRulesLabel")
};

const template = document.createElement('template');
template.innerHTML = `
  <div id="scope-filter">
    <div class="container">
      <button>Scope Filter</button>
    </div>
  </div>
`;

export default class ScopeFilter extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './css/scopeFilter.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize scope filter
    this.scopeFilterDiv    = this.shadowRoot.querySelector('#scope-filter');
    this.scopeFilterButton = this.shadowRoot.querySelector('#scope-filter button');

    this.scopeFilterButton.addEventListener('click', this.onClick.bind(this));
    this.callBackFunction = false;
  }

  set value (value) {
    switch (value) {
      case 'PAGE':
         this.scopeFilterDiv.style.display = 'block';
         this.scopeFilterButton.textContent = '✕  ' + msg.ruleScopeLabel + ': ' + msg.scopePageRulesLabel;
         break;

      case 'WEBSITE':
         this.scopeFilterDiv.style.display = 'block';
         this.scopeFilterButton.textContent = '✕  ' + msg.ruleScopeLabel + ': ' + msg.scopeWebsiteRulesLabel;
         break;

      default:
         this.clear();
         break;
    }
  }

  setCallBack (callBackFunction) {
    this.callBackFunction = callBackFunction;
  }

  clear () {
     this.scopeFilterDiv.style.display = 'none';
     this.scopeFilterButton.textContent = '';
  }

  onClick (event) {
    console.log(`[scopeFilter][onclick]: ${typeof this.callBackFunction}`);
    if (this.callBackFunction) {
      this.callBackFunction(event);
    }
  }
}
