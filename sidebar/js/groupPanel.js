"use strict";

var groupPanel = {

  ruleResults: [],

  init: function () {

    this.groupGrid = new Grid(document.getElementById('group_grid'));
    this.groupGrid.init();

    this.detailsButton = document.getElementById('details_rule');
    this.detailsButton.textContent = i18n('labelDetails');
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

    function getAccNameResult(result) {
      var accName = '';

      switch (result) {
        case 'V':
          accName = i18n('labelViolation');
          break;

        case 'W':
          accName = i18n('labelWarning');
          break;

        case 'MC':
          accName = i18n('labelManualCheck');
          break;

        case 'P':
          accName = i18n('labelPassed');
          break;

        default:
          break;

      }

      return accName;
    }

    var row = this.groupGrid.addRow(rule_id, this.handleAction);

    var cell = row.addCell(summary, 'text rule', '', '', true);

    cell = row.addCell(result,  'value result ' + result.toLowerCase(), getAccNameResult(result), result);
    cell.setAccessibleName(getAccNameResult(result));

    cell = row.addCell(wcag,   'value sc', '', wcag);
    cell.setContentAndTitle(wcag, i18n('sc' + wcag))

    cell = row.addCell(level,   'value level', '',level);
    cell.setAccessibleName(i18n('labelLevel' + level));

    cell = row.addCell((required ? 'Y' : ''), 'value required', '', (required ? 'Y' : ''));
    cell.setAccessibleName(required ? i18n('labelRequired') : i18n('labelRecommended'));
  },

  clear: function () {

    // update Rule Summary
    document.getElementById("group_violations").textContent      = '-';
    document.getElementById("group_warnings").textContent        = '-';
    document.getElementById("group_manual_checks").textContent   = '-';
    document.getElementById("group_passed").textContent          = '-';

    // Update Group Results

    var cells = document.querySelectorAll('tbody#rule_results td');

    for (let i = 0; i < cells.length; i++) {
      cells[i].textContent = '-';
    }

  },

  update: function (evaluationResult) {

    // update Rule Summary
    document.getElementById("group_violations").textContent    = evaluationResult.violations;
    document.getElementById("group_warnings").textContent      = evaluationResult.warnings;
    document.getElementById("group_manual_checks").textContent = evaluationResult.manual_checks;
    document.getElementById("group_passed").textContent        = evaluationResult.passed;

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

