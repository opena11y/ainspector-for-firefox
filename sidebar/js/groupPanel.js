"use strict";

var groupPanel = {

  ruleResults: [],

  init: function () {

    this.groupGrid = new Grid(document.getElementById('group_grid'));
    this.groupGrid.init();

    this.detailsButton = document.getElementById('details_rule');
    this.detailsButton.innerHTML = i18n('labelDetails');
    this.detailsButton.addEventListener('click', this.handleDetails);

    window.addEventListener('resize', function() {
      groupPanel.groupGrid.resize();
    });

    this.clear();

  },

  hide: function () {
    hide('group_panel');
  },

  show: function () {
    show('group_panel');
    this.groupGrid.resize();
    backButton.disabled = false;
  },

  handleDetails: function (event) {

    var id = groupPanel.groupGrid.getSelectedId();

    if (id) {
      handleGetRule(id);
    }
  },

  handleAction: function (type, ruleId) {

    switch (type) {
      case 'activate':
        handleGetRule(ruleId)
        break;

      case 'click':
      case 'focus':
        groupPanel.detailsButton.disabled = false;
        messageArgs.ruleId    = ruleId;
        updateDetailsAction('rr', groupPanel.getDetailsAction(ruleId));
        break;

      case 'doubleClick':
        handleGetRule(ruleId)
        break;

      default:
        break;

    }
  },

  addRuleResultRow: function (rule_id, summary, result, wcag, level, required) {
    var row = this.groupGrid.addRow(rule_id, this.handleAction);

    row.addCell(summary, 'text rule', '', true);
    row.addCell(result,  'value result ' + result.toLowerCase(), result);
    row.addCell(level,    'value sc', level);
    row.addCell(level,   'value level', level);
    row.addCell((required ? 'Y' : ''), 'value required', (required ? 'Y' : ''));
  },

  clear: function () {

    // update Rule Summary
    document.getElementById("group_violations").innerHTML      = '-';
    document.getElementById("group_warnings").innerHTML        = '-';
    document.getElementById("group_manual_checks").innerHTML   = '-';
    document.getElementById("group_passed").innerHTML          = '-';

    // Update Group Results

    var cells = document.querySelectorAll('tbody#rule_results td');

    for (let i = 0; i < cells.length; i++) {
      cells[i].innerHTML = '-';
    }

  },

  update: function (evaluationResult) {

    // update Rule Summary
    document.getElementById("group_violations").innerHTML      = evaluationResult.violations;
    document.getElementById("group_warnings").innerHTML        = evaluationResult.warnings;
    document.getElementById("group_manual_checks").innerHTML   = evaluationResult.manual_checks;
    document.getElementById("group_passed").innerHTML          = evaluationResult.passed;

    // Update Group Results

    this.ruleResults = evaluationResult.ruleResults;

    var displayResults = [];

    for (let i = 0; i < this.ruleResults.length; i++) {
      var rr = this.ruleResults[i];
      if (messageArgs.includePassAndNotApplicable ||
        (rr.resultValue > 2)) {
        displayResults.push(rr);
      }
    }

    displayResults.sort(function (a, b) {
      return b.resultValue - a.resultValue;
    });

    this.groupGrid.clearRows();

    if (displayResults.length) {
      for (let i = 0; i < displayResults.length; i++) {
        var rr = displayResults[i];
        this.addRuleResultRow(rr.ruleId, rr.summary, rr.result, rr.wcag, rr.level, rr.required);
      }
    }
    else {
      this.addRuleResultRow('noResults', i18n('noGroupResults'), '-', '-', '-', false);
    }
  },

  getDetailsAction: function (ruleId) {

    var da = this.ruleResults[0].detailsAction;

    for (let i = 0; i < this.ruleResults.length; i++) {
      if (this.ruleResults[i].ruleId === ruleId) {
        da = this.ruleResults[i].detailsAction;
        return da;
      }
    }

    return da;
  },

  setFocus: function () {
    this.groupGrid.setSelectedToRowById(messageArgs.ruleId);
  }

}

