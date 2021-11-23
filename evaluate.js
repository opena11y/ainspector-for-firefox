// import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId} from 'common.js';

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

// Summary Result functions


// Helper function for getting rule category and guideline group summary results

function getGroupItem (summary, id, labelId) {
  let item = {
    'id'             : id,
    'labelId'             : labelId,
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
    rcResults.push(getGroupItem(summary, id, labelId));
  });
  return rcResults;
};

function getGuidelineResults (evalResult) {
  let glResults = [];
  guidelineIds.forEach ((id) => {
    let summary = evalResult.getRuleResultsByGuideline(id).getRuleResultsSummary();
    let labelId = getGuidelineLabelId(id);
    glResults.push(getGroupItem(summary, id, labelId));
  });
  return glResults;
};

/*
*   getSummaryInfo: (1) Run evlauation library;
*   (2) return result objec for the summary view in the sidebar;
*/
function getSummaryInfo () {

  console.log('[getSummaryInfo][A]');

  let info = {};

  let evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  let ruleGroupResult   = evaluationResult.getRuleResultsAll();
  let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();

  info.ruleset  = evaluationResult.getRuleset().getId();

  console.log('[getSummaryInfo][B]');

  info.violations    = ruleSummaryResult.violations;
  info.warnings      = ruleSummaryResult.warnings;
  info.manual_checks = ruleSummaryResult.manual_checks;
  info.passed        = ruleSummaryResult.passed;

  console.log('[getSummaryInfo][C]');

  info.rcResults = getRuleCategoryResults(evaluationResult);
  console.log('[getSummaryInfo][D]');
  info.glResults = getGuidelineResults(evaluationResult);
  console.log('[getSummaryInfo][E]');


  // Remove the evaluation library from the page,
  // otherwise get duplicate warnings for rulesest and rules being reloaded
  OpenAjax = {};

  return info;
};
