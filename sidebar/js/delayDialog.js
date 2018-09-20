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
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40,
    'TAB': 9
  }),

  init: function () {

    this.dialogNode      = document.getElementById('delay_dialog');
    this.selectDelayNode = document.getElementById('delay_dialog_select_delay');
    this.cancelNode      = document.getElementById('delay_dialog_cancel');
    this.okNode          = document.getElementById('delay_dialog_ok');

    this.selectDelayNode.addEventListener('keydown', this.handleSelectDelayKeyDown.bind(this));

    this.okNode.addEventListener('click', this.handleOkClick.bind(this));
    this.okNode.addEventListener('keydown', this.handleOkKeyDown.bind(this));

    this.cancelNode.addEventListener('click', this.handleCancelClick.bind(this));

  },

  open: function () {
    show('delay_dialog');
    this.dialogNode.focus();
  },

  close: function () {
    hide('delay_dialog');
  },

  handleCancelClick: function () {
    this.close();
    handleUpdateEvaluation();
  },

  handleOkClick: function () {
    this.close();
    messageArgs.delay = parseInt(this.selectDelayNode.value);
    if (typeof messageArgs.delay !== 'number') {
      messageArgs.delay = 5;
    }
    messageArgs.promptForDelay = !this.onlyOnceNode.checked;
    messageArgs.delayCount = messageArgs.delay
    evaluateButton.innerHTML = messageArgs.delayCount + ' secs';
    evaluateButton.disabled = true;
    setTimeout(delayEvaluation, 1000);
  },

  handleOkKeyDown: function (event) {

    if (event.keyCode === this.keyCode.TAB && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.selectDelayNode.focus();
    }
  },

  handleSelectDelayKeyDown: function (event) {

    if (event.keyCode === this.keyCode.TAB && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.okNode.focus();
    }
  },

  handleBodyClick: function (event) {
  }

};

delayDialog.init();
