"use strict";

var ruleLabels = ['Rule 1 ....', 'Rule 2 ....', 'Rule 3 ....', 'Rule 4 ....', 'Rule 5 ....', 'Rule 6 ....'];

function hideGroupPanel() {
  hide('group_panel');
}

function showGroupPanel() {
  show('group_panel');
}

function addRuleResultRow(rule_id, summary, result, wcag, level, required) {
  var row = groupGrid.addRow(rule_id, handleGroupGridAction);

  row.addCell(summary, 'text rule', '', true);
  row.addCell(result,  'value result ' + result.toLowerCase(), result);
  row.addCell(level,    'value sc', level);
  row.addCell(level,   'value level', level);
  row.addCell((required ? 'Y' : ''), 'value required', (required ? 'Y' : ''));

}

function clearGroupPanel() {

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

}

var ruleResults = [];

function updateGroupPanel(evaluationResult) {

  // update Rule Summary
  document.getElementById("group_violations").innerHTML      = evaluationResult.violations;
  document.getElementById("group_warnings").innerHTML        = evaluationResult.warnings;
  document.getElementById("group_manual_checks").innerHTML   = evaluationResult.manual_checks;
  document.getElementById("group_passed").innerHTML          = evaluationResult.passed;

  // Update Group Results

  ruleResults = evaluationResult.ruleResults;

  ruleResults.sort(function (a, b) {
    return b.resultValue - a.resultValue;
  });

  groupGrid.clearRows();

  for (let i = 0; i < ruleResults.length; i++) {
    var rr = ruleResults[i];
    addRuleResultRow(rr.ruleId, rr.summary, rr.result, rr.wcag, rr.level, rr.required);
  }

}


function getDetailsAction(ruleResults, ruleId) {

  var da = ruleResults[0].detailsAction;

  for (let i = 0; i < ruleResults.length; i++) {
    if (ruleResults[i].ruleId === ruleId) {
      da = ruleResults[i].detailsAction;
      return da;
    }
  }

  return da;
}

function handleGroupGridAction(type, ruleId) {

  var da;

  switch (type) {
    case 'activate':
      handleGetRule(ruleId)
      break;

    case 'click':
      messageArgs.ruleId    = ruleId;
      updateDetailsAction('rr', getDetailsAction(ruleResults, ruleId));
      break;

    case 'doubleClick':
      handleGetRule(ruleId)
      break;

    case 'focus':
      detailsRuleButton.disabled = false;
      messageArgs.ruleId    = ruleId;
      da = getDetailsAction(ruleResults, ruleId);
      updateDetailsAction('rr', da);
      break;

  }
};

function setGroupPanelFocus() {
  groupGrid.setSelectedToRowById(messageArgs.ruleId);
};

// Details Rule Button

function handleDetailsRule(event) {

  var id = groupGrid.getSelectedId();

  if (id) {
    handleGetRule(id);
  }
};

var detailsRuleButton = document.getElementById('details_rule');
detailsRuleButton.addEventListener('click', handleDetailsRule);
