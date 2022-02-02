/* rerunEvaluationButton.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
  <div role="button" aria-label="copy" tabindex="0">
    <svg version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      height="32px" width="24px" viewBox="0 0 96 96">
      <rect class="focus" x="4" y="4" height="88" width="88" rx="8" ry="8"/>
      <rect class="back"  x="20" y="18" height="48" width="32" rx="8" ry="8"/>
      <rect class="front" x="36" y="34" height="48" width="32" rx="8" ry="8"/>
      <line class="copied" x1="48" y1="24" x2="48" y2="72"/>
      <line class="copied" x1="24" y1="48" x2="72" y2="48"/>
      <line class="failed" x1="24" y1="24" x2="72" y2="72"/>
      <line class="failed" x1="24" y1="72" x2="72" y2="24"/>
    </svg>
  </div>
`;

export default class CopyButton extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'copyButton.css');
    this.shadowRoot.appendChild(link);

    // Get constants
    this.copyLabel   = getMessage('copyLabel');
    this.copiedLabel = getMessage('copySuccessLabel');
    this.failedLabel = getMessage('copyFailedLabel');

    // Get references
    this.copyButton  = this.shadowRoot.querySelector('[role="button"]');
    this.copyButton.ariaLabel = this.copyLabel;
    this.copyButton.addEventListener('click', this.onCopyButtonClick.bind(this));
    this.copyButton.addEventListener('keydown', this.onCopyButtonClick.bind(this));
    this.getTextFunct = false;

  }

  set disabled (value) {
    this.copyButton.disabled = value;
  }

  get disabled () {
    return this.copyButton.disabled;
  }

  set title (value) {
    this.copyButton.title = value;
  }

  get title () {
    return this.copyButton.title;
  }

  set ariaLabel (value) {
    this.copyButton.setAttribute('aria-label', value);
  }

  get ariaLabel () {
    return this.copyButton.getAttribute('aria-label');
  }

  setGetTextFunct (getTextFunct) {
    this.getTextFunct = getTextFunct;
  }

  getText () {
    if (typeof this.getTextFunct === 'function') {
      return this.getTextFunct();
    }
    return '';
  }

  restoreCopyLabel () {
    this.copyButton.ariaLabel = this.copyLabel;
    this.copyButton.classList.remove('copied');
    this.copyButton.classList.remove('failed');
  }

  onCopyButtonClick (event) {
    if ((event.type === 'click') ||
        (event.type === 'keydown' &&
        ((event.key === ' ' ) || (event.key === 'Enter' )))) {
      let text = this.getText();
      if (text) {
        navigator.clipboard.writeText(text).then(
          () => {
            this.copyButton.ariaLabel = this.copiedLabel;
            this.copyButton.classList.add('copied');
          },
          () => {
            this.copyButton.ariaLabel = this.failedLabel;
            this.copyButton.classList.add('failed');
          }
        );
      }
      else {
        this.copyButton.ariaLabel = this.failedLabel;
        this.copyButton.classList.add('failed');
      }
      setTimeout(this.restoreCopyLabel.bind(this), 750);
    }
  }
}
