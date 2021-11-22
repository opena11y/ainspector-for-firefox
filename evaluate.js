var ruleCategoryIds = [
  OpenAjax.a11y.RULE_CATEGORIES.LANDMARKS,
  OpenAjax.a11y.RULE_CATEGORIES.HEADINGS,
  OpenAjax.a11y.RULE_CATEGORIES.STYLES_READABILITY,
  OpenAjax.a11y.RULE_CATEGORIES.IMAGES,
  OpenAjax.a11y.RULE_CATEGORIES.LINKS,
  OpenAjax.a11y.RULE_CATEGORIES.FORMS,
  OpenAjax.a11y.RULE_CATEGORIES.TABLES,
  OpenAjax.a11y.RULE_CATEGORIES.WIDGETS_SCRIPTS,
  OpenAjax.a11y.RULE_CATEGORIES.AUDIO_VIDEO,
  OpenAjax.a11y.RULE_CATEGORIES.KEYBOARD_SUPPORT,
  OpenAjax.a11y.RULE_CATEGORIES.TIMING,
  OpenAjax.a11y.RULE_CATEGORIES.SITE_NAVIGATION
];

var guidelineIds = [
  OpenAjax.a11y.WCAG20_GUIDELINE.G_1_1,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_1_2,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_1_3,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_1_4,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_2_1,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_2_2,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_2_3,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_2_4,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_3_1,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_3_2,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_3_3,
  OpenAjax.a11y.WCAG20_GUIDELINE.G_4_1
];

function getRuleCategoryLabelId (id) {
  switch (id) {
  case OpenAjax.a11y.RULE_CATEGORIES.LANDMARKS:
    return 'landmarksLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.HEADINGS:
    return 'headingsLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.STYLES_READABILITY:
    return 'stylesContentLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.IMAGES:
    return 'imagesLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.LINKS:
    return 'linksLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.FORMS:
    return 'tablesLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.TABLES:
    return 'formsLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.WIDGETS_SCRIPTS:
    return 'widgetsScriptsLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.AUDIO_VIDEO:
    return 'audioVideoLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.KEYBOARD_SUPPORT:
    return 'keyboardLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.TIMING:
    return 'timingLabel';
  case OpenAjax.a11y.RULE_CATEGORIES.SITE_NAVIGATION:
    return 'siteNavigationLabel'
  default:
    return OpenAjax.a11y.RULE_CATEGORIES.UNDEFINED;

  }
};

function getGuidelineLabelId (id) {

  switch(id) {

  case OpenAjax.a11y.WCAG20_GUIDELINE.G_1_1:
    return 'g1.1';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_1_2:
    return 'g1.2';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_1_3:
    return 'g1.3';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_1_4:
    return 'g1.4';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_2_1:
    return 'g2.1';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_2_2:
    return 'g2.2';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_2_3:
    return 'g2.3';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_2_4:
    return 'g2.4';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_2_5:
    return 'g2.5';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_3_1:
    return 'g3.1';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_3_2:
    return 'g3.2';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_3_3:
    return 'g3.3';
  case OpenAjax.a11y.WCAG20_GUIDELINE.G_4_1:
    return 'g4.1';

  default:
    return OpenAjax.a11y.WCAG20_GUIDELINE.UNDEFINED;

  }
};

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
