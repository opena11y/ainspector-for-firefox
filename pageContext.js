"use strict";

function handleError(error) {
  console.log(`Error: ${error}`);
}

window.onload = function notifyPanel() {

  // to be run when the window finishes loading
  var aiResponse = {};
  aiResponse.option = 'update';

  var sending = browser.runtime.sendMessage({
    messageForPanel: aiResponse
  });
  sending.then(handleError);
}

function evaluateRules(ruleset) {

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
  return evaluationResult;
}

function getCommonData(evaluationResult) {
  var aiResponse = new Object();
  aiResponse.url = evaluationResult.getURL();
  aiResponse.ruleset = evaluationResult.getRuleset().getId();
  return aiResponse;
}

function addSummaryData(aiResponse, evaluationResult) {
  var ruleGroupResult = evaluationResult.getRuleResultsAll();
  var ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();

  aiResponse.violations    = ruleSummaryResult.violations;
  aiResponse.warnings      = ruleSummaryResult.warnings;
  aiResponse.manual_checks = ruleSummaryResult.manual_checks;
  aiResponse.passed        = ruleSummaryResult.passed;

}

function addRuleCategoryData(aiResponse, evaluationResult) {


  function addItem(ruleCategoryId, label) {

    var summary = evaluationResult.getRuleResultsByCategory(ruleCategoryId).getRuleResultsSummary();

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
}

function addGuidelineData(aiResponse, evaluationResult) {


  function addItem(guidelineId, label) {

    var summary = evaluationResult.getRuleResultsByGuideline(guidelineId).getRuleResultsSummary();

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
}

function summary(ruleset) {
  var evaluationResult = evaluateRules(ruleset);
  var aiResponse = getCommonData(evaluationResult);
  addSummaryData(aiResponse, evaluationResult);
  addRuleCategoryData(aiResponse, evaluationResult);
  addGuidelineData(aiResponse, evaluationResult);
  aiResponse.option = 'summary';

  return aiResponse;
}

function addGroupSummaryData(aiResponse, evaluationResult, groupType, groupId) {

  function getRuleResult(ruleResult) {

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

}

function group(ruleset, groupType, groupId) {
  var evaluationResult = evaluateRules(ruleset);
  var aiResponse = getCommonData(evaluationResult);
  addGroupSummaryData(aiResponse, evaluationResult, groupType, groupId);
  aiResponse.option = 'group'

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
  var ruleResult     = evaluationResult.getRuleResult(ruleId);

  var results = ruleResult.getElementResultsArray();

  for(let i = 0; i < results.length; i++) {
    addElementResult(results[i]);
  }

  console.log('[addRuleResultData][End]');
  return elementResults;
};

var ainspectorSidebarRuleResult;

function getRuleResult(evaluationResult, ruleId) {

  var ruleResult = evaluationResult.getRuleResult(ruleId);
  // save rule result for use in updating highlighting
  ainspectorSidebarRuleResult = ruleResult;

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



  return item;
}

function rule(ruleset, ruleId, highlight, position) {

  var evaluationResult = evaluateRules(ruleset);
  var aiResponse  = getCommonData(evaluationResult);

  aiResponse.option = 'rule'
  aiResponse.detailsAction  = getDetailsAction(evaluationResult, ruleId);
  aiResponse.ruleResult     = getRuleResult(evaluationResult, ruleId);
  aiResponse.elementResults = getElementResults(evaluationResult, ruleId);

  highlightModule.initHighlight();

  switch(highlight) {
    case 'all':
      highlightModule.highlightElementResults(document, evaluationResult.getRuleResult(ruleId).getElementResultsArray());
      break;

    case 'vw':
      highlightModule.setHighlightPreferences(false, false, false, false);
      highlightModule.highlightElementResults(document, evaluationResult.getRuleResult(ruleId).getElementResultsArray());
      break;

    case 'selected':
      highlightModule.setHighlightPreferences();
      highlightModule.highlightElementResults(document, evaluationResult.getRuleResult(ruleId).getElementResultsArray());
      break;

    default:
      break;
  }

  return aiResponse;
}

function highlight(highlight, position) {

  function getElementResultByPosition() {
    if (ainspectorSidebarRuleResult) {
      var elementResults = ainspectorSidebarRuleResult.getElementResultsArray();

      for (let i = 0; i < elementResults.length; i++) {
        if (elementResults[i].getOrdinalPosition() === position) {
          return elementResults[i];
        }
      }
    }

    return false;

  }

  var domNode = false;

  var aiResponse = {};

  aiResponse.option = 'highlight';

  if (ainspectorSidebarRuleResult) {
    var elementResults = ainspectorSidebarRuleResult.getElementResultsArray();

    if (elementResults) {
      highlightModule.initHighlight();
      console.log('[highlight]: ' + highlight);
      console.log('[highlight][position]: ' + position);

      switch(highlight) {
        case 'all':
          highlightModule.highlightElementResults(document, elementResults);
          domNode = elementResults[0].getDOMElement();
          break;

        case 'vw':
          highlightModule.setHighlightPreferences(false, false, false, false);
          highlightModule.highlightElementResults(document, elementResults);
          domNode = elementResults[0].getDOMElement();
          break;

        case 'selected':

          for (let i = 0; i < elementResults.length; i++) {
            if (elementResults[i].getOrdinalPosition() === position) {
              highlightModule.highlightElementResults(document, [elementResults[i]]);
              domNode = elementResults[i].getDOMElement();
              break;
            }
          }
          break;

        default:
          break;
      }

      if (domNode && domNode.scrollIntoView) {
        domNode.scrollIntoView();
      }

    }
  }

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

  highlightModule.initHighlight();
  highlightModule.removeHighlight(document);

  switch (option) {
    case 'summary':
      aiResponse = summary(ruleset);
      break;

    case 'group':
      console.log('[onMessage][groupType]: ' + request.groupType);
      console.log('[onMessage]  [groupId]:   ' + request.groupId);
      aiResponse = group(ruleset, request.groupType, request.groupId);
      break;

    case 'rule':
      console.log('[onMessage]     [rule]: ' + request.ruleId);
      console.log('[onMessage][highlight]: ' + request.highlight);
      aiResponse = rule(ruleset, request.ruleId, request.highlight, request.position);
      break;

    case 'highlight':
      console.log('[onMessage] [highlight]: ' + request.highlight);
      console.log('[onMessage]  [position]: ' + request.position);
      aiResponse = highlight(request.highlight, request.position);
      break;

    default:
      break;

  }

  console.log('[onMessage][End]:' + aiResponse);
  return Promise.resolve({response: aiResponse});
});
