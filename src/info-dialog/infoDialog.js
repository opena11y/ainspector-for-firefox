/* infoDialog.js */

const template = document.createElement('template');
template.innerHTML = `
  <button id="open-button"
          aria-label="none"
          title="none"
          aria-haspop="dialog">
    <svg role="none"
         height="15px"
         width="15px"
         version="1.1"
         viewBox="0 0 85 85"
         xml:space="preserve"
         xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink" >
      <path d="M42.5,0.003C19.028,0.003,0,19.031,0,42.503s19.028,42.5,42.5,42.5S85,65.976,85,42.503S65.972,0.003,42.5,0.003z   M42.288,66.27c0,0-1.972,1.311-3.32,1.305c-0.12,0.055-0.191,0.087-0.191,0.087l0.003-0.087c-0.283-0.013-0.568-0.053-0.855-0.125  l-0.426-0.105c-2.354-0.584-3.6-2.918-3.014-5.271l3.277-13.211l1.479-5.967c1.376-5.54-4.363,1.178-5.54-1.374  c-0.777-1.687,4.464-5.227,8.293-7.896c0,0,1.97-1.309,3.319-1.304c0.121-0.056,0.192-0.087,0.192-0.087l-0.005,0.087  c0.285,0.013,0.57,0.053,0.857,0.124l0.426,0.106c2.354,0.584,3.788,2.965,3.204,5.318l-3.276,13.212l-1.482,5.967  c-1.374,5.54,4.27-1.204,5.446,1.351C51.452,60.085,46.116,63.601,42.288,66.27z M50.594,24.976  c-0.818,3.295-4.152,5.304-7.446,4.486c-3.296-0.818-5.305-4.151-4.487-7.447c0.818-3.296,4.152-5.304,7.446-4.486  C49.403,18.346,51.411,21.68,50.594,24.976z"/>
    </svg>
  </button>

  <dialog id="info-dialog">
    <div class="header">
      <h2 id=>Ruleset Options Information</h2>
      <button id="close-button-1" aria-label="close" tabindex="-1">✕</button>
    </div>

    <div class="content">
      <slot name="content"></slot>
    </div>

    <div class="buttons">
      <button id="more-info-button">More Information</button>
      <button id="close-button-2">Close</button>
    </div>
  </dialog>
`;

export default class InfoDialog extends HTMLElement {
  constructor () {

    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './info-dialog/infoDialog.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    const openButtonLabel = this.getAttribute('data-open-button-label');
    const moreButtonLabel = this.getAttribute('data-more-button-label');
    this.moreInfoURL = this.getAttribute('data-more-info-url');

    this.infoDialog  = this.shadowRoot.querySelector('#info-dialog');

    this.openButton  = this.shadowRoot.querySelector('#open-button');
    this.openButton.addEventListener('click', this.onOpenButtonClick.bind(this));
    if (openButtonLabel) {
      this.openButton.setAttribute('aria-label', openButtonLabel);
      this.openButton.title = openButtonLabel;
    }

    this.closeButton1  = this.shadowRoot.querySelector('#close-button-1');
    this.closeButton1.addEventListener('click', this.onCloseButtonClick.bind(this));

    this.closeButton2  = this.shadowRoot.querySelector('#close-button-2');
    this.closeButton2.addEventListener('click', this.onCloseButtonClick.bind(this));

    this.moreInfoButton  = this.shadowRoot.querySelector('#more-info-button');
    if (moreButtonLabel) {
      this.moreInfoButton.textContent = moreButtonLabel;
    }
    this.moreInfoButton.addEventListener('click', this.onMoreInfoClick.bind(this));

  }

  onCloseButtonClick () {
    this.infoDialog.close();
  }

  onOpenButtonClick () {
    this.infoDialog.showModal();
    this.closeButton2.focus();
  }

  onMoreInfoClick () {
    const moreInfotton = this.moreinfoButton;

    function onCreated(tab) {
      moreInfoButton.disabled = true;
      moreInfoButton.title = msg.moreButtonDisabled;
      console.log(`Created new tab: ${tab.id}`)
    }

    function onError(error) {
      console.log(`Error: ${error}`);
    }

    let newTab = browser.tabs.create({
      url: this.moreInfoURL
    });

    newTab.then(onCreated, onError);
  }

}

