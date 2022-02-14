/* rerunEvaluationButton.js */

import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;
const msg = {};
msg.rerunEvalButtonLabel = getMessage('rerunEvalButtonLabel');
msg.rerunEvalDialogTitle = getMessage('rerunEvalDialogTitle');
msg.rerunEvalSelectLabel = getMessage('rerunEvalSelectLabel');
msg.rerunEvalPromptForDelayLabel = getMessage('rerunEvalPromptForDelayLabel');
msg.cancelButtonLabel    = getMessage('cancelButtonLabel');
msg.okButtonLabel        = getMessage('okButtonLabel');

const template = document.createElement('template');
template.innerHTML = `
    <div class="rerun-evaluation-button">
      <button id="rerun-button"
        aria-haspop="true"
        aria-controls="dialog"
        aria-live="off">
        Rerun Evaluation
      </button>
      <div role="dialog"
        tabindex="-1"
        id="dialog"
        aria-labelledby="title">
        <div id="title">Rerun Evlaution: Specify Delay</div>
        <div class="content">
          <div class="select">
            <label for="select">Rerun evaluation in </label>
            <select id="select">
              <option value="5" selected>5 sec.</option>
              <option value="10">10 sec.</option>
              <option value="20">20 sec.</option>
              <option value="40">40 sec.</option>
              <option value="60">1 min.</option>
            </select>
          </div>
          <label class="checkbox">
            <input id="prompt-for-delay" type="checkbox">
            <span id="prompt-for-delay-label">
              After this evaluation, stop prompting for delay setting.
            </span>
          </label>
        </div>
        <div class="buttons">
          <button id="cancel-button">Cancel</button>
          <button id="ok-button">OK</button>
        </div>
      </div>
    </div>
`;

export default class RerunEvaluationButton extends HTMLElement {
  constructor () {
    let label;
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'dialog.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.callback = null;
    this.promptForDelay = true;
    this.delayValue = 5;
    this.timerValue = 0;

    this.rerunButton  = this.shadowRoot.querySelector('#rerun-button');
    this.rerunButton.textContent = msg.rerunEvalButtonLabel;
    this.rerunButton.addEventListener('click', this.onRerunButtonClick.bind(this));

    this.dialogDiv = this.shadowRoot.querySelector('[role="dialog"]');
    label = this.dialogDiv.querySelector('#title');
    label.textContent = msg.rerunEvalDialogTitle;
    this.dialogDiv.addEventListener('keydown', this.onDialogKeydown.bind(this));

    this.select = this.shadowRoot.querySelector('select');
    label = this.shadowRoot.querySelector('label[for="select"]');
    label.textContent = msg.rerunEvalSelectLabel;
    this.select.addEventListener('keydown', this.onSelectKeydown.bind(this));
    this.select.addEventListener('focus', this.onFocus.bind(this));
    this.select.addEventListener('blur', this.onBlur.bind(this));

    this.checkbox = this.shadowRoot.querySelector('#prompt-for-delay');
    this.checkbox.addEventListener('focus', this.onFocus.bind(this));
    this.checkbox.addEventListener('blur', this.onBlur.bind(this));

    label = this.shadowRoot.querySelector('#prompt-for-delay-label')
    label.textContent = msg.rerunEvalPromptForDelayLabel;

    this.cancelButton = this.shadowRoot.querySelector('#cancel-button');
    this.cancelButton.textContent  = msg.cancelButtonLabel;
    this.cancelButton.addEventListener('click', this.onCancelButtonClick.bind(this));

    this.okButton = this.shadowRoot.querySelector('#ok-button');
    this.okButton.textContent  = msg.okButtonLabel;
    this.okButton.addEventListener('click', this.onOkButtonClick.bind(this));
    this.okButton.addEventListener('keydown', this.onOkButtonKeydown.bind(this));

    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      true
    );

  }

  set disabled (value) {
    this.rerunButton.disabled = value;
  }

  get disabled () {
    return this.rerunButton.disabled;
  }

  setActivationCallback (callback) {
    this.callback = callback;
  }

  isOpen() {
    return this.rerunButton.getAttribute('aria-expanded') === 'true';
  }

  openDialog () {
    this.checkbox.checked = !this.promptForDelay;
    for (let i = 0; i < this.select.options.length; i += 1) {
      let option = this.select.options[i];
      if (parseInt(option.value) === this.delayValue) {
        option.selected = true;
      }
    }
    this.dialogDiv.style.display = 'block';
    this.rerunButton.setAttribute('aria-expanded', 'true');
    this.dialogDiv.focus();
  }

  closeDialog () {
    if (this.isOpen()) {
      this.rerunButton.removeAttribute('aria-expanded');
      this.dialogDiv.style.display = 'none';
      this.rerunButton.focus();
    }
  }

  checkTimeout() {
    if (this.timerValue < 1) {
      this.rerunButton.setAttribute('aria-live', 'off');
      this.rerunButton.textContent = msg.rerunEvalButtonLabel;
      this.callback();
    } else {
      this.rerunButton.textContent = this.timerValue + ' seconds';
      this.timerValue -= 1;
      setTimeout(this.checkTimeout.bind(this), 1000);
    }
  }

  delayedRerun () {
    this.timerValue = this.delayValue;
    this.checkTimeout();
  }

  onRerunButtonClick () {
    getOptions().then( (options) => {
      if (options.rerunDelayEnabled) {
        this.rerunButton.setAttribute('aria-live', 'polite');
        if (this.promptForDelay) {
          this.openDialog();
        } else {
          this.delayedRerun();
        }
      } else {
        this.callback();
      }

    });
  }

  onCancelButtonClick () {
    this.closeDialog();
  }

  onOkButtonClick () {
    this.delayValue = parseInt(this.select.value);
    this.promptForDelay = !this.checkbox.checked;
    this.closeDialog();
    this.delayedRerun();
  }

  onSelectKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if ((event.currentTarget === event.target) &&
        (event.key === 'Tab') &&
        event.shiftKey) {
      this.okButton.focus();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onDialogKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if ((event.currentTarget === event.target) &&
        (event.key === 'Tab') &&
        event.shiftKey) {
      this.okButton.focus();
      event.stopPropagation();
      event.preventDefault();
    }

    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  onOkButtonKeydown(event) {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        this.select.focus();
        event.stopPropagation();
        event.preventDefault();
      }
  }

  onBackgroundMousedown(event) {
    if (this.isOpen()) {
      if (!this.contains(event.target)) {
        if (this.isOpen()) {
          this.closeDialog();
        }
      }
    }
  }

  onFocus (event) {
    let tgt = event.currentTarget;
    tgt.parentNode.classList.add('focus');
  }

  onBlur (event) {
    let tgt = event.currentTarget;
    tgt.parentNode.classList.remove('focus');
  }

}
