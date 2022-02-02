/* rerunEvaluationButton.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
  <button class="copy">
    Copy
  </button>
`;

export default class CopyButton extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get constants
    this.copyLabel   = getMessage('copyLabel');
    this.copiedLabel = getMessage('copySuccessLabel');
    this.failedLabel = getMessage('copyFailedLabel');

    // Get references
    this.copyButton  = this.shadowRoot.querySelector('button');
    this.copyButton.textContent = this.copyLabel;
    this.copyButton.addEventListener('click', this.onCopyButtonClick.bind(this));
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
    this.copyButton.textContent = this.copyLabel;
  }

  onCopyButtonClick () {
    let text = this.getText();
    if (text) {
      navigator.clipboard.writeText(text).then(
        () => {
          this.copyButton.textContent = this.copiedLabel;
        },
        () => {
          this.copyButton.textContent = this.failedLabel;
        }
      );
    }
    else {
      this.copyButton.textContent = this.failedLabel;
    }
    setTimeout(this.restoreCopyLabel.bind(this), 2000);
  }
}
