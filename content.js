/*
*   content.js
*/

/*
*   Send 'info' message with evaluation information to sidebar script.
*/

(function () {

  let view      = infoAInspectorEvaluation.view;
  let groupType = infoAInspectorEvaluation.groupType;
  let groupId   = infoAInspectorEvaluation.groupId;
  let ruleId    = infoAInspectorEvaluation.ruleId;
  let rulesetId = infoAInspectorEvaluation.rulesetId;
  let highlight = infoAInspectorEvaluation.highlight;
  let position  = infoAInspectorEvaluation.position;
  let highlightOnly = infoAInspectorEvaluation.highlightOnly;

  console.log('[content.js][         view]: ' + view);
  console.log('[content.js][    groupType]: ' + groupType);
  console.log('[content.js][      groupId]: ' + groupId + ' (' + typeof groupId + ')');
  console.log('[content.js][       ruleId]: ' + ruleId);
  console.log('[content.js][    rulesetId]: ' + rulesetId);
  console.log('[content.js][    highlight]: ' + highlight+ ' (' + typeof highlight + ')');
  console.log('[content.js][highlightOnly]: ' + highlightOnly + ' (' + typeof highlightOnly + ')');
  console.log('[content.js][     position]: ' + position + ' (' + typeof position + ')');

  let info = {};
  info.id       = 'info';
  info.title    = document.title;
  info.location = document.location.href
  info.ruleset  = rulesetId;

  switch(view) {
    case 'summary':
      highlightModule.removeHighlight(document);
      info.infoSummary = getSummaryInfo();
      break;

    case 'rule-group':
      highlightModule.removeHighlight(document);
      info.infoRuleGroup = getRuleGroupInfo(groupType, groupId);
      break;

    case 'rule-result':
      if (highlightOnly) {
        info.infoHighlight = highlightElements(highlight, position);
      } else {
        info.infoRuleResult = getRuleResultInfo(ruleId, highlight, position);
        highlightElements(highlight, position);
      }
      break;

    default:
      break;
  }

  browser.runtime.sendMessage(info);

})();
