// Evaluates current document using evaluation library

function evaluate (ruleset) {

  if (ruleset !== 'ARIA_TRANS' && ruleset !== 'ARIA_STRICT') {
    ruleset = 'ARIA_STRICT';
  }

  // evaluation script
  let doc = window.document;
  let rs = OpenAjax.a11y.RulesetManager.getRuleset(ruleset);
  let evaluator_factory = OpenAjax.a11y.EvaluatorFactory.newInstance();
  evaluator_factory.setParameter('ruleset', rs);
  evaluator_factory.setFeature('eventProcessing', 'fae-util');
  evaluator_factory.setFeature('groups', 7);
  let evaluator = evaluator_factory.newEvaluator();
  let evaluationResult = evaluator.evaluate(doc, doc.title, doc.location.href);
  return evaluationResult;
};

// ----------------------
// Summary Result functions
// ----------------------

function getSummaryItem (summary, id, labelId) {
  let item = {
    'id'             : id,
    'labelId'        : labelId,
    'violations'     : summary.violations,
    'warnings'       : summary.warnings,
    'manual_checks'  : summary.manual_checks,
    'passed'         : summary.passed,
    'not_applicable' : summary.not_applicable
  };
  return item;
};

function getRuleCategoryResults (evalResult) {
  let rcResults = [];
  ruleCategoryIds.forEach ((id) => {
    let summary = evalResult.getRuleResultsByCategory(id).getRuleResultsSummary();
    let labelId = getRuleCategoryLabelId(id);
    rcResults.push(getSummaryItem(summary, id, labelId));
  });
  return rcResults;
};

function getGuidelineResults (evalResult) {
  let glResults = [];
  guidelineIds.forEach ((id) => {
    let summary = evalResult.getRuleResultsByGuideline(id).getRuleResultsSummary();
    let labelId = getGuidelineLabelId(id);
    glResults.push(getSummaryItem(summary, id, labelId));
  });
  return glResults;
};

/*
*   getSummaryInfo
*   (1) Run evlauation library;
*   (2) return result objec for the summary view in the sidebar;
*/
function getSummaryInfo () {

  console.log('[getSummaryInfo]: starting');

  let info = {};

  let evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  let ruleGroupResult   = evaluationResult.getRuleResultsAll();
  let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();

  info.ruleset  = evaluationResult.getRuleset().getId();

  info.violations    = ruleSummaryResult.violations;
  info.warnings      = ruleSummaryResult.warnings;
  info.manual_checks = ruleSummaryResult.manual_checks;
  info.passed        = ruleSummaryResult.passed;

  info.rcResults = getRuleCategoryResults(evaluationResult);
  info.glResults = getGuidelineResults(evaluationResult);

  // Remove the evaluation library from the page,
  // otherwise get duplicate warnings for rulesest and rules being reloaded

  console.log('[getSummaryInfo]: ending');

  return info;
};

// ----------------------
// Group Result functions
// ----------------------

function getGroupItem(ruleResult) {

  let ruleId = ruleResult.getRule().getId();

  let item = { 'ruleId'        : ruleId,
               'summary'       : ruleResult.getRuleSummary(),
               'required'      : ruleResult.isRuleRequired(),
               'wcag'          : ruleResult.getRule().getPrimarySuccessCriterion().id,
               'result'        : ruleResult.getResultValueNLS(),
               'resultValue'   : ruleResult.getResultValue(),
               'level'         : ruleResult.getWCAG20LevelNLS(),
               'messages'      : ruleResult.getResultMessagesArray(),
               'detailsAction' : getDetailsAction(ruleResult)
             };

  return item;

}

/*
*   getGroupInfo
*   (1) Run evlauation library;
*   (2) return result objec for the group view in the sidebar;
*/
function getGroupInfo (groupType, groupId) {

  console.log('[getGroupInfo]: starting ');

  let info = {};

  let evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  let ruleGroupResult;

  if (groupType === 'gl') {
    ruleGroupResult   = evaluationResult.getRuleResultsByGuideline(groupId);
  }
  else {
    ruleGroupResult   = evaluationResult.getRuleResultsByCategory(groupId);
  }

  let ruleGroupInfo     = ruleGroupResult.getRuleGroupInfo();
  let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
  let ruleResults       = ruleGroupResult.getRuleResultsArray();

  info.groupLabel = ruleGroupInfo.title.replace('Guideline ', '');

  info.violations    = ruleSummaryResult.violations;
  info.warnings      = ruleSummaryResult.warnings;
  info.manual_checks = ruleSummaryResult.manual_checks;
  info.passed        = ruleSummaryResult.passed;

  info.ruleResults = [];

  for(let i = 0; i < ruleResults.length; i++) {
    info.ruleResults.push(getGroupItem(ruleResults[i]));
  }

  // Remove the evaluation library from the page,
  // otherwise get duplicate warnings for rulesest and rules being reloaded

  console.log('[getGroupInfo]: ending');

  return info;
};

// ----------------------
// Rule Result functions
// ----------------------

function getRuleResultInfo(ruleResult) {

  let rule   = ruleResult.getRule()

  var info = { 'ruleId'        : rule.getId(),
               'summary'       : ruleResult.getRuleSummary(),
               'required'      : ruleResult.isRuleRequired(),
               'wcag'          : ruleResult.getRule().getPrimarySuccessCriterion().id,
               'result'        : ruleResult.getResultValueNLS(),
               'category'      : rule.getCategoryInfo().title,
               'guideline'     : rule.getGuidelineInfo().title,
               'resultValue'   : ruleResult.getResultValue(),
               'level'         : ruleResult.getWCAG20LevelNLS(),
               'messages'      : ruleResult.getResultMessagesArray(),
               'detailsAction' : getDetailsAction(ruleResult)
             };

  return info;
}

function getElementResultInfo(ruleResult) {

  function addElementResult(elementResult) {

    var item = { 'element'       : elementResult.getElementIdentifier(),
                 'position'      : elementResult.getOrdinalPosition(),
                 'result'        : elementResult.getResultValueNLS(),
                 'resultValue'   : elementResult.getResultValue(),
                 'actionMessage' : elementResult.getResultMessage()
               };

    // Adjust sort order of element results for AInspector Sidebar
    if (item.resultValue === OpenAjax.a11y.ELEMENT_RESULT_VALUE.HIDDEN) {
      item.resultValue = 1;
    }
    else {
      if (item.resultValue === OpenAjax.a11y.ELEMENT_RESULT_VALUE.PASS) {
        item.resultValue = 2;
      }
    }

    elementResults.push(item);

  }

  var elementResults = [];

  var results = ruleResult.getElementResultsArray();

  for(let i = 0; i < results.length; i++) {
    addElementResult(results[i]);
  }

  return elementResults;
};

/*
*   getRuleInfo
*   (1) Run evlauation library;
*   (2) return result objec for the rule view in the sidebar;
*/

function getRuleInfo(ruleId) {

  console.log('[getRuleInfo]: starting ');

  let evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  let ruleResult = evaluationResult.getRuleResult(ruleId);

  let info = {};

  info.detailsAction  = getDetailsAction(ruleResult);
  info.ruleResult     = getRuleResultInfo(ruleResult);
  info.elementResults = getElementResultInfo(ruleResult);

  console.log('[getRuleInfo]: ending ');

  return info;
}

// ----------------------
// getDetailsAction
//
// Returns information related to a rule result
// ----------------------

function getDetailsAction(ruleResult) {

  function getInformationalInfoArray(infoItems) {

    function getItem(title, url) {
      let item = {};
      item.title = title;
      item.url = url;
      return item;
    }

    let items = [];

    for (let i = 0; i < infoItems.length; i++) {
      let item = infoItems[i];
      if (item.url_spec) {
        items.push(getItem(item.title, item.url_spec));
      } else {
        items.push(getItem(item.title, item.url));
      }
    }

    return items;
  }

  let rule       = ruleResult.getRule();
  let required   = ruleResult.isRuleRequired()

  let primarySC = {};
  let wcag = [];
  primarySC.title    = rule.getPrimarySuccessCriterion().title + ' (Primary)';
  primarySC.url_spec = rule.getPrimarySuccessCriterion().url_spec;
  wcag.push(primarySC);
  wcag = wcag.concat(rule.getRelatedSuccessCriteria());

  let detailsAction = {
    'ruleId'             : rule.getId(),
    'definition'         : rule.getDefinition(required),
    'action'             : ruleResult.getResultMessagesArray(),
    'purpose'            : rule.getPurpose(),
    'techniques'         : getInformationalInfoArray(rule.getTechniques()),
    'targets'            : rule.getTargetResources(),
    'compliance'         : 'WCAG Level ' + rule.getWCAG20Level() + ', ' + (required ? 'Required' : 'Recommended'),
    'sc'                 : getInformationalInfoArray(wcag),
    'additionalLinks'    : getInformationalInfoArray(rule.getInformationalLinks())
  }

  return detailsAction;

}

