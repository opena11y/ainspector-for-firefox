"use strict";

function hideRulePanel() {
  hide('rule_panel');
}

function showRulePanel() {
  show('rule_panel');
}

function addElementResultRow(element, result, position, actionMessage) {

  var row = ruleGrid.addRow(position, handleRuleGridAction);

  // Trim element length if too long
  if (element.length > 50) {
    element = element.substring(0, 47) + '...';
  }

  row.addCell(element, 'text element', '', true);
  row.addCell(result, 'value result ' + result.toLowerCase());
  row.addCell(position, 'num position');
  row.addCell(actionMessage, 'text action');

  return row;

};

function clearRulePanel() {
  var cells = document.querySelectorAll('tbody#element_results tr > *');

  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = '-';
  }
}

function updateDetailsAction(id, detailsAction) {

  function getDetails(items) {

    if (typeof items === 'string') {
      return items;
    }

    if (items.length === 1) {
      if(typeof items[0]  === 'string') {
        return items[0];
      }
      else {
        return items[0].title;
      }
    }

    var html = '<ul class="details">';
    for (let i=0; i < items.length; i++) {
      var item = items[i];
      if (typeof item === 'string') {
        html += '<li>' + items[i] + '</li>';
      }
      else {
        html += '<li><a href="' + items[i].url +'">' + items[i].title + '</li>';
      }
    }
    html += '</ul>';

    return html;

  }

  document.getElementById(id + '_definition').innerHTML      = getDetails(detailsAction.definition);
  document.getElementById(id + '_action').innerHTML          = getDetails(detailsAction.action);
  document.getElementById(id + '_purpose').innerHTML         = getDetails(detailsAction.purpose);
  document.getElementById(id + '_techniques').innerHTML      = getDetails(detailsAction.techniques);
  document.getElementById(id + '_target_elements').innerHTML = getDetails(detailsAction.targetElements);
  document.getElementById(id + '_compliance').innerHTML      = getDetails(detailsAction.compliance);
  document.getElementById(id + '_wcag').innerHTML            = getDetails(detailsAction.wcagPrimary);
  document.getElementById(id + '_information').innerHTML     = getDetails(detailsAction.informationalLinks);

  if (id === 'rr') {
    document.getElementById('rr_none_selected').style.display = 'none';
    document.getElementById('rr_rule_selected').style.display = 'block';
  }

};

function updateRulePanelSummaryResult(evaluationResult) {

  document.getElementById('rule_panel_summary').innerHTML = evaluationResult.ruleResult.summary;
  var node = document.getElementById('rule_panel_result');
  node.innerHTML = evaluationResult.ruleResult.result;
  node.className = 'right ' + evaluationResult.ruleResult.result.toLowerCase();
};

function updateRulePanel(evaluationResult) {

  var firstRow = false;

  updateDetailsAction('da', evaluationResult.detailsAction);

  updateRulePanelSummaryResult(evaluationResult);

  var elementResults = evaluationResult.elementResults;

  ruleGrid.clearRows();

  elementResults.sort(function (a, b) {
    return b.resultValue - a.resultValue;
  });

  if (elementResults.length) {
    for (let i = 0; i < elementResults.length; i++) {
      var er = elementResults[i];
      var row = addElementResultRow(er.element, er.result, er.position, er.actionMessage);

      if (i === 0) {
        firstRow = row;
      }
    }
  }
  else {
    firstRow = addElementResultRow('No results', '', '', '');
  }
  if (firstRow) {
    firstRow.domNode.tabIndex = 0;
  }
};

function handleRuleGridAction(type, position) {

  messageArgs.position = position;

  switch (type) {
    case 'activate':
      handleGetRule(messageArgs.ruleId, position);
      break;

    case 'click':
      break;

    case 'doubleClick':
      handleGetRule(messageArgs.ruleId, position);
      break;

    case 'focus':

      messageArgs.option = 'highlight';

      browser.tabs.query({
          currentWindow: true,
          active: true
      }).then(sendMessageToTabs).catch(onError);

      break;

  }
};
