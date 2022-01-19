/* options.js */

import { getOptions, saveOptions, defaultOptions } from './storage.js';
const getMessage = browser.i18n.getMessage;

const debug = false;
const inclWcagGl     = document.querySelector('input[id="options-incl-wcag-gl"]');
const noDelay        = document.querySelector('input[id="options-no-delay"]');
const promptForDelay = document.querySelector('input[id="options-prompt-for-delay"]');

const rulesetStrict  = document.querySelector('input[id="ARIA_STRICT"]');
const rulesetTrans   = document.querySelector('input[id="ARIA_TRANS"]');
const inclPassNa     = document.querySelector('input[id="options-incl-pass-na"]');

const exportFilenameProject    = document.querySelector('#options-export-filename-project');
const exportFilenameSummary    = document.querySelector('#options-export-filename-summary');
const exportFilenameRuleGroup  = document.querySelector('#options-export-filename-rule-group');
const exportFilenameRuleResult = document.querySelector('#options-export-filename-rule-result');

const resetDefaults  = document.querySelector('button[id="options-reset-defaults"]');

function setFormLabels () {
  const optionsTitle            = document.querySelector('#options-title');
  const optionsViewsMenuLegend  = document.querySelector('#options-views-menu-legend');
  const optionsInclWcagGlLabel  = document.querySelector('#options-incl-wcag-gl-label');

  const optionsRerunEvaluationLegend = document.querySelector('#options-rerun-evaluation-legend');
  const optionsNoDelayLabel          = document.querySelector('#options-no-delay-label');
  const optionsPromptForDelayLabel   = document.querySelector('#options-prompt-for-delay-label');

  const optionsEvaluationHeading     = document.querySelector('#options-evaluation-heading');
  const optionsRulesetLegend         = document.querySelector('#options-ruleset-legend');
  const optionsRulesetStrictLabel    = document.querySelector('#options-ruleset-strict-label');
  const optionsRulesetTransLabel     = document.querySelector('#options-ruleset-trans-label');
  const optionsRuleResultsLegend     = document.querySelector('#options-rule-results-legend');
  const optionsInclPassNaLabel       = document.querySelector('#options-incl-pass-na-label');

  const optionsExportHeading                 = document.querySelector('#options-export-heading');
  const optionsExportFilenameLegend          = document.querySelector('#options-export-legend');
  const optionsExportFilenameProjectLabel    = document.querySelector('#options-export-filename-project-label');
  const optionsExportFilenameProjectDesc    = document.querySelector('#options-export-filename-project-desc');
  const optionsExportFilenameSummaryLabel    = document.querySelector('#options-export-filename-summary-label');
  const optionsExportFilenameRuleGroupLabel  = document.querySelector('#options-export-filename-rule-group-label');
  const optionsExportFilenameRuleResultLabel = document.querySelector('#options-export-filename-rule-result-label');

  const optionsResetDefaults         = document.querySelector('#options-reset-defaults');

  optionsTitle.textContent            = getMessage('optionsTitle');
  optionsViewsMenuLegend.textContent  = getMessage('optionsViewsMenuLegend');
  optionsInclWcagGlLabel.textContent  = getMessage('optionsInclWcagGlLabel');
  optionsRerunEvaluationLegend.textContent = getMessage('optionsRerunEvaluationLegend');
  optionsNoDelayLabel.textContent          = getMessage('optionsNoDelayLabel');
  optionsPromptForDelayLabel.textContent   = getMessage('optionsPromptForDelayLabel');

  optionsEvaluationHeading.textContent     = getMessage('optionsEvaluationHeading');
  optionsRulesetLegend.textContent         = getMessage('optionsRulesetLegend');
  optionsRulesetStrictLabel.textContent    = getMessage('optionsRulesetStrictLabel');
  optionsRulesetTransLabel.textContent     = getMessage('optionsRulesetTransLabel');
  optionsRuleResultsLegend.textContent     = getMessage('optionsRuleResultsLegend');
  optionsInclPassNaLabel.textContent       = getMessage('optionsInclPassNaLabel');

  optionsExportHeading.textContent                 = getMessage('optionsExportHeading');
  optionsExportFilenameLegend.textContent          = getMessage('optionsExportFilenameLegend');
  optionsExportFilenameProjectLabel.textContent    = getMessage('optionsExportFilenameProjectLabel');
  optionsExportFilenameProjectDesc.textContent    = getMessage('optionsExportFilenameProjectDesc');
  optionsExportFilenameSummaryLabel.textContent    = getMessage('optionsExportFilenameSummaryLabel');
  optionsExportFilenameRuleGroupLabel.textContent  = getMessage('optionsExportFilenameRuleGroupLabel');
  optionsExportFilenameRuleResultLabel.textContent = getMessage('optionsExportFilenameRuleResultLabel');

  optionsResetDefaults.textContent         = getMessage('optionsResetDefaults');
}

// Save user options selected in form and display message

function saveFormOptions (e) {
  e.preventDefault();

  const options = {
    rulesetId: (rulesetStrict.checked ? 'ARIA_STRICT' : 'ARIA_TRANS'),
    viewsMenuIncludeGuidelines: inclWcagGl.checked,
    rerunDelayEnabled: promptForDelay.checked,
    resultsIncludePassNa: inclPassNa.checked,

    filenameProject:    exportFilenameProject.value,
    filenameSummary:    exportFilenameSummary.value,
    filenameRuleGroup:  exportFilenameRuleGroup.value,
    filenameRuleResult: exportFilenameRuleResult.value
  }

  if (debug) console.log(options);
  saveOptions(options);
}

// Update HTML form values based on user options saved in storage.sync

function updateForm (options) {
  // Set form element values and states
  inclWcagGl.checked     = options.viewsMenuIncludeGuidelines;
  noDelay.checked        = !options.rerunDelayEnabled;
  promptForDelay.checked = options.rerunDelayEnabled;
  rulesetStrict.checked  = options.rulesetId === 'ARIA_STRICT';
  rulesetTrans.checked   = options.rulesetId === 'ARIA_TRANS';
  inclPassNa.checked     = options.resultsIncludePassNa;

  exportFilenameProject.value    = options.filenameProject;
  exportFilenameSummary.value    = options.filenameSummary;
  exportFilenameRuleGroup.value  = options.filenameRuleGroup;
  exportFilenameRuleResult.value = options.filenameRuleResult;
}

function updateOptionsForm() {
  setFormLabels();

  getOptions().then(updateForm);
}

function saveDefaultOptions () {
  saveOptions(defaultOptions).then(getOptions).then(updateForm);
}

// Add event listeners for saving and restoring options

document.addEventListener('DOMContentLoaded', updateOptionsForm);
inclWcagGl.addEventListener('change', saveFormOptions);
noDelay.addEventListener('change', saveFormOptions);
promptForDelay.addEventListener('change', saveFormOptions);
rulesetStrict.addEventListener('change', saveFormOptions);
rulesetTrans.addEventListener('change', saveFormOptions);
inclPassNa.addEventListener('change', saveFormOptions);

exportFilenameProject.addEventListener('change', saveFormOptions);
exportFilenameSummary.addEventListener('change', saveFormOptions);
exportFilenameRuleGroup.addEventListener('change', saveFormOptions);
exportFilenameRuleResult.addEventListener('change', saveFormOptions);

resetDefaults.addEventListener('click', saveDefaultOptions);

