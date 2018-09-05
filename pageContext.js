"use strict";

function handleError(error) {
  console.log(`Error: ${error}`);
}

window.onload = function notifyPanel() {

  // to be run when the window finishes loading
  var aiResponse = summary();

  var sending = browser.runtime.sendMessage({
    messageForPanel: aiResponse
  });
  sending.then(handleError);
}

function evaluateRules(ruleset) {
//  console.log('[evaluateRules][Start]: ' + ruleset);

  if (ruleset !== 'ARIA_TRANS' && ruleset !== 'ARIA_STRICT') {
    ruleset = 'ARIA_STRICT';
  }

  // evaluation script
  var doc = window.document;
  var rs = OpenAjax.a11y.RulesetManager.getRuleset(ruleset);
  var evaluator_factory = OpenAjax.a11y.EvaluatorFactory.newInstance();
  evaluator_factory.setParameter('ruleset', rs);
  evaluator_factory.setFeature('eventProcessing', 'fae-util');
  evaluator_factory.setFeature('groups', 7);
  var evaluator = evaluator_factory.newEvaluator();
  var evaluationResult = evaluator.evaluate(doc, doc.title, doc.location.href);
//  console.log('[evaluateRules][End]: ' + evaluationResult);
  return evaluationResult;
}

function getCommonData(evaluationResult) {
//  console.log('[getCommonData][Start]');
  // gets required data from evaluation object to return to panel
  var aiResponse = new Object();
  aiResponse.url = evaluationResult.getURL();
  aiResponse.ruleset = evaluationResult.getRuleset().getId();
//  console.log('[getCommonData][End]: ' + aiResponse);
  return aiResponse;
}

function addSummaryData(aiResponse, evaluationResult) {
//  console.log('[getSummaryData][Start]');
  var ruleGroupResult = evaluationResult.getRuleResultsAll();
  var ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();

  aiResponse.violations    = ruleSummaryResult.violations;
  aiResponse.warnings      = ruleSummaryResult.warnings;
  aiResponse.manual_checks = ruleSummaryResult.manual_checks;
  aiResponse.passed        = ruleSummaryResult.passed;

//  console.log('[getSummaryData][End]');
}

function addRuleCategoryData(aiResponse, evaluationResult) {
  console.log('[addRuleCategoryData][Start]');


  function addItem(ruleCategoryId, label) {

    var summary = evaluationResult.getRuleResultsByCategory(ruleCategoryId).getRuleResultsSummary();
//    console.log('[addRuleCategoryData][addItem][summary]: ' + summary);

    var item = { 'id'             : ruleCategoryId,
                 'label'          : label,
                 'violations'     : summary.violations,
                 'warnings'       : summary.warnings,
                 'manual_checks'  : summary.manual_checks,
                 'passed'         : summary.passed,
                 'not_applicable' : summary.not_applicable
               };

    aiResponse.rcResults.push(item);

  }

  aiResponse.rcResults = [];

  addItem(OpenAjax.a11y.RULE_CATEGORIES.LANDMARKS, 'Landmarks');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.HEADINGS, 'Headings');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.STYLES_READABILITY, 'Styles/Content');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.IMAGES, 'Images');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.LINKS, 'Links' );
  addItem(OpenAjax.a11y.RULE_CATEGORIES.FORMS, 'Forms');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.TABLES, 'Tables');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.WIDGETS_SCRIPTS, 'Widgets/Scripts');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.AUDIO_VIDEO, 'Audio/Video');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.KEYBOARD_SUPPORT, 'Keyboard');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.TIMING, 'Timing');
  addItem(OpenAjax.a11y.RULE_CATEGORIES.SITE_NAVIGATION, 'Site Navigation');

  console.log('[addRuleCategoryData][End]');
}

function addGuidelineData(aiResponse, evaluationResult) {
  console.log('[addRuleCategoryData][Start]');


  function addItem(guidelineId, label) {

    var summary = evaluationResult.getRuleResultsByGuideline(guidelineId).getRuleResultsSummary();
//    console.log('[addRuleCategoryData][addItem][summary]: ' + summary);

    var item = { 'id'             : guidelineId,
                 'label'          : label,
                 'violations'     : summary.violations,
                 'warnings'       : summary.warnings,
                 'manual_checks'  : summary.manual_checks,
                 'passed'         : summary.passed,
                 'not_applicable' : summary.not_applicable
               };

    aiResponse.glResults.push(item);

  }

  aiResponse.glResults = [];

  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_1_1, '1.1 Text Alternatives');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_1_2, '1.2 Time-based Media');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_1_3, '1.3 Adaptable');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_1_4, '1.4 Distinguishable');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_2_1, '2.1 Keyboard Accessible' );
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_2_2, '2.2 Enough Time');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_2_3, '2.3 Seizures');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_2_4, '2.4 Navigable');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_3_1, '3.1 Readable');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_3_2, '3.2 Predictable');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_3_3, '3.3 Input Assistance');
  addItem(OpenAjax.a11y.WCAG20_GUIDELINE.G_4_1, '4.1 Compatible');

  console.log('[addRuleCategoryData][End]');
}

function summary(ruleset) {
//  console.log('[summary][Start]');
  var evaluationResult = evaluateRules(ruleset);
  var aiResponse = getCommonData(evaluationResult);
  addSummaryData(aiResponse, evaluationResult);
  addRuleCategoryData(aiResponse, evaluationResult);
  addGuidelineData(aiResponse, evaluationResult);
  aiResponse.option = 'summary';

  console.log('[summary][URL]: '     + aiResponse.url);
  console.log('[summary][Ruleset]: ' + aiResponse.ruleset);
//  console.log('[summary][End]: '     + aiResponse);
  return aiResponse;
}

function addGroupSummaryData(aiResponse, evaluationResult, groupType, groupId) {

  function getRuleResult(ruleResult) {
//    console.log('[addGroupSummaryData][addRuleResult: ' + ruleResult);

    var ruleId = ruleResult.getRule().getId();

    var item = { 'ruleId'        : ruleId,
                 'summary'       : ruleResult.getRuleSummary(),
                 'required'      : ruleResult.isRuleRequired(),
                 'wcag'          : ruleResult.getRule().getPrimarySuccessCriterion().id,
                 'result'        : ruleResult.getResultValueNLS(),
                 'resultValue'   : ruleResult.getResultValue(),
                 'level'         : ruleResult.getWCAG20LevelNLS(),
                 'messages'      : ruleResult.getResultMessagesArray(),
                 'detailsAction' : getDetailsAction(evaluationResult, ruleId)
               };


    return item;

  }

  console.log('[getGroupSummaryData][Start]: ' + groupType + ' ' + groupId);

  var ruleGroupResult;

  if (groupType === 'gl') {
    ruleGroupResult   = evaluationResult.getRuleResultsByGuideline(groupId);
  }
  else {
    ruleGroupResult   = evaluationResult.getRuleResultsByCategory(groupId);
  }

  var ruleGroupInfo     = ruleGroupResult.getRuleGroupInfo();
  var ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
  var ruleResults       = ruleGroupResult.getRuleResultsArray();

  aiResponse.groupLabel  = ruleGroupInfo.title;

  aiResponse.violations    = ruleSummaryResult.violations;
  aiResponse.warnings      = ruleSummaryResult.warnings;
  aiResponse.manual_checks = ruleSummaryResult.manual_checks;
  aiResponse.passed        = ruleSummaryResult.passed;

  aiResponse.ruleResults = []

  for(let i = 0; i < ruleResults.length; i++) {
    aiResponse.ruleResults.push(getRuleResult(ruleResults[i]));
  }

//  console.log('[getSummaryData][End]');
}

function group(ruleset, groupType, groupId) {
  var evaluationResult = evaluateRules(ruleset);
  var aiResponse = getCommonData(evaluationResult);
  addGroupSummaryData(aiResponse, evaluationResult, groupType, groupId);
  aiResponse.option = 'group'

  console.log('[group][URL]:     ' + aiResponse.url);
  console.log('[group][Ruleset]: ' + aiResponse.ruleset);
  console.log('[group][End]:     ' + aiResponse.groupLabel);
  return aiResponse;
}

// Rule result

function getDetailsAction(evaluationResult, ruleId) {

  function getInformationalInfoArray(infoItems) {

    function getItem(title, url) {
      var item = {};
      item.title = title;
      item.url = url;
      return item;
    }

    var items = [];

    for (let i = 0; i < infoItems.length; i++) {

      items.push(getItem(infoItems[i].title, infoItems[i].url));

    }

    return items;
  }

  var ruleResult = evaluationResult.getRuleResult(ruleId);
  var rule       = ruleResult.getRule();
  var required   = ruleResult.isRuleRequired()

  var detailsAction = {
    'ruleId'             : rule.getId(),
    'definition'         : rule.getDefinition(required),
    'action'             : ruleResult.getResultMessagesArray(),
    'purpose'            : rule.getPurpose(),
    'techniques'         : getInformationalInfoArray(rule.getTechniques()),
    'targetElements'     : rule.getTargetResources(),
    'compliance'         : 'WCAG Level ' + rule.getWCAG20Level() + ', ' + (ruleResult.isRuleRequired() ? 'Required' : 'Recommended'),
    'wcagPrimary'        : rule.getPrimarySuccessCriterion().title,
    'wcagSecondary'      : rule.getRelatedSuccessCriteria(),
    'informationalLinks' : getInformationalInfoArray(rule.getInformationalLinks())
  }

  return detailsAction;

}

function getElementResults(evaluationResult, ruleId) {

  function addElementResult(elementResult) {

    var item = { 'element'       : elementResult.getElementIdentifier(),
                 'position'      : elementResult.getOrdinalPosition(),
                 'result'        : elementResult.getResultValueNLS(),
                 'resultValue'   : elementResult.getResultValue(),
                 'actionMessage' : elementResult.getResultMessage()
               };

    elementResults.push(item);

  }

  console.log('[addRuleResultData][Start]: ' + ruleId);

  var elementResults = [];
  var ruleResult     = evaluationResult.getRuleResult(ruleId);

  var results = ruleResult.getElementResultsArray();

  for(let i = 0; i < results.length; i++) {
    addElementResult(results[i]);
  }

  console.log('[addRuleResultData][End]');
  return elementResults;
};

function getRuleResult(evaluationResult, ruleId) {
  console.log("[getRuleResult][start]");

  var ruleResult = evaluationResult.getRuleResult(ruleId);
  console.log("[getRuleResult][ruleResult]: " + ruleResult);

  var ruleId = ruleResult.getRule().getId();
  var rule   = ruleResult.getRule()

  var item = { 'ruleId'        : ruleId,
               'summary'       : ruleResult.getRuleSummary(),
               'required'      : ruleResult.isRuleRequired(),
               'wcag'          : ruleResult.getRule().getPrimarySuccessCriterion().id,
               'result'        : ruleResult.getResultValueNLS(),
               'category'      : rule.getCategoryInfo().title,
               'guideline'     : rule.getGuidelineInfo().title,
               'resultValue'   : ruleResult.getResultValue(),
               'level'         : ruleResult.getWCAG20LevelNLS(),
               'messages'      : ruleResult.getResultMessagesArray(),
               'detailsAction' : getDetailsAction(evaluationResult, ruleId)
             };

  console.log("[getRuleResult][end]");
  return item;

}

function rule(ruleset, ruleId) {
  console.log("[rule][start]");

  var evaluationResult = evaluateRules(ruleset);
  var aiResponse  = getCommonData(evaluationResult);

  aiResponse.option = 'rule'
  aiResponse.detailsAction  = getDetailsAction(evaluationResult, ruleId);
  aiResponse.ruleResult     = getRuleResult(evaluationResult, ruleId);
  aiResponse.elementResults = getElementResults(evaluationResult, ruleId);

  console.log("[rule][end]");

  return aiResponse;
}


browser.runtime.onMessage.addListener(request => {
  // to be executed on receiving messages from the panel

  var aiResponse;
  var option  = 'summary';
  var ruleset = 'ARIA_STRICT';

  if (typeof request.option === 'string') {
    option = request.option;
  }

  if (typeof request.ruleset === 'string') {
    ruleset = request.ruleset;
  }

  console.log("[onMessage][start]");
  console.log('[onMessage][option]:    ' + option);
  console.log('[onMessage][ruleset]:   ' + ruleset);

  switch (option) {
    case 'summary':
      aiResponse = summary(ruleset);
      break;

    case 'group':
      console.log('[onMessage][groupType]: ' + request.groupType);
      console.log('[onMessage][groupId]:   ' + request.groupId);
      aiResponse = group(ruleset, request.groupType, request.groupId);
      break;

    case 'rule':
      console.log('[onMessage][rule]: ' + request.ruleId);
      aiResponse = rule(ruleset, request.ruleId);
      break;

    default:
      aiResponse = summary(ruleset);
      break;

  }

  console.log('[onMessage][End]:' + aiResponse);
  return Promise.resolve({response: aiResponse});
});
