/* resultTablist.js */

const template = document.createElement('template');
template.innerHTML = `
    <div class="result-tablist">
      <div role="tablist">
        <div id="tab-1"
          role="tab"
          tabindex="0"
          aria-controls="tabpanel-1"
          aria-selected="true">
          <span>
            Tab 1
          </span>
        </div>
        <div id="tab-2"
          role="tab"
          tabindex="-1"
          aria-controls="tabpanel-2">
          <span>
            Tab 2
          </span>
        </div>
      </div>
      <div id="tabpanel-1"
        role="tabpanel"
        aria-labelledby="tab-1"
        class="show">
      </div>
      <div id="tabpanel-2"
        role="tabpanel"
        aria-labelledby="tab-2">
      </div>
    </div>
`;

export default class ResultTablist extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link1 = document.createElement('link');
    link1.setAttribute('rel', 'stylesheet');
    link1.setAttribute('href', './css/resultTablist.css');
    this.shadowRoot.appendChild(link1);

    const link2 = document.createElement('link');
    link2.setAttribute('rel', 'stylesheet');
    link2.setAttribute('href', './css/middleSection.css');
    this.shadowRoot.appendChild(link2);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize abbreviations and labels
    this.tabDiv1 = this.shadowRoot.querySelector('[role=tablist] [role=tab]:nth-child(1)');
    this.tabDiv2 = this.shadowRoot.querySelector('[role=tablist] [role=tab]:nth-child(2)');

    // span elements are used for keyboard focus styling
    this.tabSpan1 = this.shadowRoot.querySelector('[role=tablist] [role=tab]:nth-child(1) span');
    this.tabSpan2 = this.shadowRoot.querySelector('[role=tablist] [role=tab]:nth-child(2) span');

    this.tabpanelDiv1 = this.shadowRoot.querySelector('#tabpanel-1');
    this.tabpanelDiv2 = this.shadowRoot.querySelector('#tabpanel-2');

    // Event handlers

    this.tabDiv1.addEventListener('click', this.handleTabClick.bind(this));
    this.tabDiv2.addEventListener('click', this.handleTabClick.bind(this));

    this.tabDiv1.addEventListener('keydown', this.handleTabKeydown.bind(this));
    this.tabDiv2.addEventListener('keydown', this.handleTabKeydown.bind(this));

  }

  set tabLabel1 (label) {
    this.tabSpan1.textContent = label;
  }

  set tabLabel2 (label) {
    this.tabSpan2.textContent = label;
  }

  get tabpanel1 () {
    return this.tabpanelDiv1
  }

  get tabpanel2 () {
    return this.tabpanelDiv2
  }

  get selectedTabId () {
    if (this.tabpanelDiv1.classList.contains('show')) {
      return this.tabpanelDiv1.id;
    }
    return this.tabpanelDiv2.id;
  }

  focus () {
    if (this.selectedTabId === 'tabpanel-1') {
      this.tabDiv1.focus();
    } else {
      this.tabDiv2.focus();
    }
  }

  showTabpanel(id) {
    if (this.tabpanelDiv1.id === id) {
      this.tabpanelDiv1.classList.add('show');
      this.tabDiv1.setAttribute('aria-selected', 'true');
      this.tabDiv1.tabIndex = 0;
      this.tabDiv1.focus();

      this.tabpanelDiv2.classList.remove('show');
      this.tabDiv2.removeAttribute('aria-selected');
      this.tabDiv2.tabIndex = -1;
    } else {
      this.tabpanelDiv2.classList.add('show');
      this.tabDiv2.setAttribute('aria-selected', 'true');
      this.tabDiv2.tabIndex = 0;
      this.tabDiv2.focus();

      this.tabpanelDiv1.classList.remove('show');
      this.tabDiv1.removeAttribute('aria-selected');
      this.tabDiv1.tabIndex = -1;
    }
  }

  // Event handlers

  handleTabClick(event) {
    const tgt = event.currentTarget;
    this.showTabpanel(tgt.getAttribute('aria-controls'));
  }

  handleTabKeydown(event) {
    const tgt = event.currentTarget;
    let flag = false;

    switch(event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if ( this.tabDiv1 === tgt) {
          this.showTabpanel(this.tabpanelDiv2.id);
        } else {
          this.showTabpanel(this.tabpanelDiv1.id);
        }
        flag = true;
        break;

      case 'Home':
        this.showTabpanel(this.tabpanelDiv1.id);
        flag = true;
        break;

      case 'End':
        this.showTabpanel(this.tabpanelDiv2.id);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

}
