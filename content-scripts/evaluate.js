 /* evaluate.js */

var ainspectorSidebarRuleResult = ainspectorSidebarRuleResult || {};

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
}

// ----------------------
// Summary Result functions
// ----------------------

function getSummaryItem (summary, id) {
  let item = {
    'id'             : id,
    'violations'     : summary.violations,
    'warnings'       : summary.warnings,
    'manual_checks'  : summary.manual_checks,
    'passed'         : summary.passed,
    'not_applicable' : summary.not_applicable
  };
  return item;
}

function getRuleCategoryResults (evalResult) {

  const rcIds = [
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

  let rcResults = [];
  rcIds.forEach ((id) => {
    let summary = evalResult.getRuleResultsByCategory(id).getRuleResultsSummary();
    rcResults.push(getSummaryItem(summary, id));
  });
  return rcResults;
}

function getGuidelineResults (evalResult) {

  const glIds = [
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

  let glResults = [];
  glIds.forEach ((id) => {
    let summary = evalResult.getRuleResultsByGuideline(id).getRuleResultsSummary();
    glResults.push(getSummaryItem(summary, id));
  });
  return glResults;
}

/*
*   getSummaryInfo
*   (1) Run evlauation library;
*   (2) return result objec for the summary view in the sidebar;
*/
function getSummaryInfo () {

  let info = {};

  let evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  let ruleGroupResult   = evaluationResult.getRuleResultsAll();
  let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
  let ruleResults       = ruleGroupResult.getRuleResultsArray();

  info.ruleset  = evaluationResult.getRuleset().getId();

  info.violations    = ruleSummaryResult.violations;
  info.warnings      = ruleSummaryResult.warnings;
  info.manual_checks = ruleSummaryResult.manual_checks;
  info.passed        = ruleSummaryResult.passed;

  info.rcResults = getRuleCategoryResults(evaluationResult);
  info.glResults = getGuidelineResults(evaluationResult);
  info.json = evaluationResult.toJSON();

  info.allRuleResults = [];
  for(let i = 0; i < ruleResults.length; i++) {
    info.allRuleResults.push(getRuleGroupItem(ruleResults[i]));
  }
  return info;
}

// ----------------------
// Rule Group Result functions
// ----------------------

function getRuleGroupItem(ruleResult) {

  let ruleId = ruleResult.getRule().getId();
  let rule = ruleResult.getRule();
  let elemResults = ruleResult.getElementResultsSummary();

  let item = {
    'ruleId'         : ruleId,
    'summary'        : ruleResult.getRuleSummary(),
    'required'       : ruleResult.isRuleRequired(),
    'ruleCategory'   : rule.rule_category_info.title,
    'guideline'      : rule.guideline_info.title.replace('Guideline ',''),
    'wcag'           : rule.getPrimarySuccessCriterion().id,
    'result'         : ruleResult.getResultValueNLS(),
    'resultValue'    : ruleResult.getResultValue(),
    'level'          : ruleResult.getWCAG20LevelNLS(),
    'messages'       : ruleResult.getResultMessagesArray(),
    'detailsAction'  : getDetailsAction(ruleResult),
    'elemViolations'   : elemResults.violations,
    'elemWarnings'     : elemResults.warnings,
    'elemManualChecks' : elemResults.manual_checks,
    'elemPassed'       : elemResults.passed,
    'elemHidden'       : elemResults.hidden
  };

  return item;

}

/*
*   getRuleGroupInfo
*   (1) Run evlauation library;
*   (2) return result objec for the group view in the sidebar;
*/
function getRuleGroupInfo (groupType, groupId) {

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

  info.groupType     = groupType;
  info.violations    = ruleSummaryResult.violations;
  info.warnings      = ruleSummaryResult.warnings;
  info.manual_checks = ruleSummaryResult.manual_checks;
  info.passed        = ruleSummaryResult.passed;

  info.ruleResults = [];

  info.json = ruleGroupResult.toJSON('');

  for(let i = 0; i < ruleResults.length; i++) {
    info.ruleResults.push(getRuleGroupItem(ruleResults[i]));
  }
  return info;
}

// ----------------------
// Rule Result functions
// ----------------------

function getResultInfo(ruleResult) {

  let rule   = ruleResult.getRule()

  var info = {
    'ruleId'        : rule.getId(),
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

    let accNameInfo    = JSON.stringify(elementResult.getAccessibleNameInfo());
    let ccrInfo        = JSON.stringify(elementResult.getColorContrastInfo());
    let visibilityInfo = JSON.stringify(elementResult.getVisibilityInfo());
    let htmlAttrInfo   = JSON.stringify(elementResult.getHTMLAttributes());
    let ariaAttrInfo   = JSON.stringify(elementResult.getAriaAttributes());

    let item = {
      'tagName'        : elementResult.getTagName(),
      'role'           : elementResult.getRole(),
      'position'       : elementResult.getOrdinalPosition(),
      'result'         : elementResult.getResultValueNLS(),
      'resultValue'    : elementResult.getResultValue(),
      'actionMessage'  : elementResult.getResultMessage(),
      'accNameInfo'    : accNameInfo,
      'ccrInfo'        : ccrInfo,
      'visibilityInfo' : visibilityInfo,
      'htmlAttrInfo'   : htmlAttrInfo,
      'ariaAttrInfo'   : ariaAttrInfo
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
}

/*
*   getRuleResultInfo
*   (1) Run evlauation library;
*   (2) return result objec for the rule view in the sidebar;
*/

function getRuleResultInfo(ruleId, highlight, position) {

  const evaluationResult  = evaluate(infoAInspectorEvaluation.ruleset);
  const ruleResult = evaluationResult.getRuleResult(ruleId);
  const elemSummaryResult = ruleResult.getElementResultsSummary();

  const rule = ruleResult.getRule();
  const required = ruleResult.isRuleRequired()
  const title = rule.getSummary(required);

  let info = {};

  info.title          = title;

  info.violations     = elemSummaryResult.violations;
  info.warnings       = elemSummaryResult.warnings;
  info.manual_checks  = elemSummaryResult.manual_checks;
  info.passed         = elemSummaryResult.passed;
  info.hidden         = elemSummaryResult.hidden;

  info.detailsAction  = getDetailsAction(ruleResult);
  info.ruleResult     = getResultInfo(ruleResult);
  info.elementResults = getElementResultInfo(ruleResult);

  // get JSON with element result details
  info.json = ruleResult.toJSON('', true);

  // Save reference to rule results for highlighting elements
  ainspectorSidebarRuleResult = ruleResult;

  return info;
}

/*
*   highlightElements
*/

function highlightElements(highlight, position) {

  function validElementResults () {
    return ainspectorSidebarRuleResult &&
      ainspectorSidebarRuleResult.getElementResultsArray;
  }

  function getElementResultByPosition() {
    if (validElementResults()) {
      const elementResults = ainspectorSidebarRuleResult.getElementResultsArray();

      for (let i = 0; i < elementResults.length; i++) {
        if (elementResults[i].getOrdinalPosition() === position) {
          return elementResults[i];
        }
      }
    }
    return false;
  }

  let domNode = false;

  let info = {};

  info.option = 'highlight';

  if (validElementResults()) {
    const elementResults = ainspectorSidebarRuleResult.getElementResultsArray();

    if (elementResults) {
      highlightModule.initHighlight();

      switch(highlight) {
        case 'all':
          highlightModule.highlightElementResults(document, elementResults);
          domNode = elementResults[0].getDOMElement();
          break;

        case 'none':
          highlightModule.removeHighlight(document);
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

        case 'vw':
          highlightModule.setHighlightPreferences(false, false, false, false);
          highlightModule.highlightElementResults(document, elementResults);
          domNode = elementResults[0].getDOMElement();
          break;

        default:
          break;
      }

      if (domNode && domNode.scrollIntoView) {
        domNode.scrollIntoView();
      }

    }
  }

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
    'summary'            : rule.getSummary(required),
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

