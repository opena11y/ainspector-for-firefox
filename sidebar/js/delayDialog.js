/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   delayDialog.js
*
*   Desc:   Dialog box to select a delay time
*/

var delayDialog = {

  dialogNode: null,

  selectDelayNode: null,

  onlyOnceNode: null,

  cancelNode: null,

  okNode: null,

  keyCode: Object.freeze({
    'RETURN': 13,
    'SPACE': 32,
    'TAB': 9,
    'ESC': 27
  }),

  init: function () {

    this.dialogNode      = document.getElementById('delay_dialog');
    this.selectDelayNode = document.getElementById('delay_dialog_select_delay');
    this.onlyOnceNode    = document.getElementById('delay_dialog_only_once');
    this.cancelNode      = document.getElementById('delay_dialog_cancel');
    this.okNode          = document.getElementById('delay_dialog_ok');
    this.backDropNode    = document.getElementById('dialog_backdrop');

    this.selectDelayNode.addEventListener('keydown', this.handleSelectDelayKeyDown.bind(this));

    this.okNode.addEventListener('click', this.handleOkClick.bind(this));
    this.okNode.addEventListener('keydown', this.handleOkKeyDown.bind(this));

    this.cancelNode.addEventListener('click', this.handleCancelClick.bind(this));

    this.dialogNode.addEventListener('keydown', this.handleDialogKeyDown.bind(this));

  },

  open: function () {
    show('delay_dialog');
    this.selectDelayNode.focus();
    this.backDropNode.classList.add('active');
    this.backDropNode.addEventListener('click', this.handleBackDropClick.bind(this));

    this.dialogNode.style.top = (parseInt(evaluateButton.getBoundingClientRect().top) - parseInt(this.dialogNode.getBoundingClientRect().height) - 20) + 'px';
  },

  close: function () {
    hide('delay_dialog');
    this.backDropNode.removeEventListener('click', this.handleBackDropClick.bind(this));
    this.backDropNode.classList.remove('active');
  },

  handleCancelClick: function () {
    this.close();
    messageArgs.promptForDelay = !this.onlyOnceNode.checked;
    handleUpdateEvaluation();
  },

  handleOkClick: function () {
    this.close();
    messageArgs.delay = parseInt(this.selectDelayNode.value);
    if (typeof messageArgs.delay !== 'number') {
      messageArgs.delay = 5;
    }

    if (this.onlyOnceNode.checked) {
      messageArgs.promptForDelay = false;
      setAInspectorPreferences();
    }

    messageArgs.delayCount = messageArgs.delay
    evaluateButton.textContent = messageArgs.delayCount + ' secs';
    evaluateButton.disabled = true;
    setTimeout(this.delayEvaluation.bind(this), 1000);
  },

  handleOkKeyDown: function (event) {
    if (event.keyCode === this.keyCode.TAB && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.selectDelayNode.focus();
    }
  },

  handleDialogKeyDown: function (event) {
    if (event.keyCode === this.keyCode.ESC) {
      event.stopPropagation();
      event.preventDefault();
      this.close();
      handleUpdateEvaluation();
    }
  },

  handleSelectDelayKeyDown: function (event) {

    if (event.keyCode === this.keyCode.TAB && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.okNode.focus();
    }
  },

  handleBackDropClick: function (event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectDelayNode.focus();
  },

  delayEvaluation: function  () {

    messageArgs.delayCount = messageArgs.delayCount - 1;
    evaluateButton.textContent = messageArgs.delayCount + ' secs';
    if (messageArgs.delayCount === 0) {
      handleUpdateEvaluation();
      evaluateButton.textContent = i18n('labelRerunEvaluate');
      evaluateButton.disabled = false;
    }
    else {
      setTimeout(this.delayEvaluation.bind(this), 1000);
    }
  }

};

delayDialog.init();
