/* options.js */

import { getOptions, saveOptions, defaultOptions } from './storage.js';
import { validatePrefix, validateShortcut } from './validate.js';

const getMessage = browser.i18n.getMessage;
const msg = {};
msg.optionsTitle = getMessage('optionsTitle');
msg.optionsViewsMenuLegend = getMessage('optionsViewsMenuLegend');
msg.optionsInclWcagGlLabel = getMessage('optionsInclWcagGlLabel');
msg.optionsRerunEvaluationLegend = getMessage('optionsRerunEvaluationLegend');
msg.optionsNoDelayLabel = getMessage('optionsNoDelayLabel');
msg.optionsPromptForDelayLabel = getMessage('optionsPromptForDelayLabel');
msg.optionsEvaluationHeading = getMessage('optionsEvaluationHeading');
msg.optionsRulesetLegend = getMessage('optionsRulesetLegend');
msg.optionsRulesetStrictLabel = getMessage('optionsRulesetStrictLabel');
msg.optionsRulesetTransLabel = getMessage('optionsRulesetTransLabel');
msg.optionsRuleResultsLegend = getMessage('optionsRuleResultsLegend');
msg.optionsInclPassNaLabel = getMessage('optionsInclPassNaLabel');
msg.optionsExportHeading = getMessage('optionsExportHeading');
msg.optionsExportPrompt = getMessage('optionsExportPrompt');
msg.optionsExportFormatLegend = getMessage('optionsExportFormatLegend');
msg.optionsExportCSVLabel = getMessage('optionsExportCSVLabel');
msg.optionsExportJSONLabel = getMessage('optionsExportJSONLabel');
msg.optionsExportPrefixLabel = getMessage('optionsExportPrefixLabel');
msg.optionsExportIncludeDate = getMessage('optionsExportIncludeDate');
msg.optionsResetDefaults = getMessage('optionsResetDefaults');


const debug = true;
const inclWcagGl     = document.querySelector('input[id="options-incl-wcag-gl"]');
const noDelay        = document.querySelector('input[id="options-no-delay"]');
const promptForDelay = document.querySelector('input[id="options-prompt-for-delay"]');

const rulesetStrict  = document.querySelector('input[id="ARIA_STRICT"]');
const rulesetTrans   = document.querySelector('input[id="ARIA_TRANS"]');
const inclPassNa     = document.querySelector('input[id="options-incl-pass-na"]');

const exportPrompt   = document.querySelector('#options-export-prompt');
const exportCSV      = document.querySelector('#options-export-csv');
const exportJSON     = document.querySelector('#options-export-json');
const exportPrefix   = document.querySelector('#options-export-prefix');
const exportDate     = document.querySelector('#options-export-date');

const shortcutBackKbd        = document.querySelector('#options-shortcut-back');
const shortcutViewsTextbox   = document.querySelector('#options-shortcut-views');
const shortcutExportTextbox  = document.querySelector('#options-shortcut-export');
const shortcutRerunTextbox   = document.querySelector('#options-shortcut-rerun');
const shortcutCopyTextbox    = document.querySelector('#options-shortcut-copy');
const shortcutsEnabledCheckbox     = document.querySelector('#options-shortcuts-enabled');

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

  const optionsExportHeading         = document.querySelector('#options-export-heading');
  const optionsExportPromptLabel     = document.querySelector('#options-export-prompt-label');
  const optionsExportFormatLegend    = document.querySelector('#options-export-format-legend');
  const optionsExportCSVLabel        = document.querySelector('#options-export-csv-label');
  const optionsExportJSONLabel       = document.querySelector('#options-export-json-label');
  const optionsExportPrefixLabel     = document.querySelector('#options-export-prefix-label');
  const optionsExportDateLabel       = document.querySelector('#options-export-date-label');

  const optionsResetDefaults         = document.querySelector('#options-reset-defaults');

  optionsTitle.textContent            = msg.optionsTitle;
  optionsViewsMenuLegend.textContent  = msg.optionsViewsMenuLegend;
  optionsInclWcagGlLabel.textContent  = msg.optionsInclWcagGlLabel;
  optionsRerunEvaluationLegend.textContent = msg.optionsRerunEvaluationLegend;
  optionsNoDelayLabel.textContent          = msg.optionsNoDelayLabel;
  optionsPromptForDelayLabel.textContent   = msg.optionsPromptForDelayLabel;

  optionsEvaluationHeading.textContent     = msg.optionsEvaluationHeading;
  optionsRulesetLegend.textContent         = msg.optionsRulesetLegend;
  optionsRulesetStrictLabel.textContent    = msg.optionsRulesetStrictLabel;
  optionsRulesetTransLabel.textContent     = msg.optionsRulesetTransLabel;
  optionsRuleResultsLegend.textContent     = msg.optionsRuleResultsLegend;
  optionsInclPassNaLabel.textContent       = msg.optionsInclPassNaLabel;

  optionsExportHeading.textContent      = msg.optionsExportHeading;
  optionsExportPromptLabel.textContent  = msg.optionsExportPrompt;
  optionsExportFormatLegend.textContent = msg.optionsExportFormatLegend;
  optionsExportCSVLabel.textContent     = msg.optionsExportCSVLabel;
  optionsExportJSONLabel.textContent    = msg.optionsExportJSONLabel;
  optionsExportPrefixLabel.textContent  = msg.optionsExportPrefixLabel;
  optionsExportDateLabel.textContent    = msg.optionsExportIncludeDate;

  optionsResetDefaults.textContent         = msg.optionsResetDefaults;
}

// Save user options selected in form and display message

function saveFormOptions (e) {
  e.preventDefault();

  const options = {
    rulesetId: (rulesetStrict.checked ? 'ARIA_STRICT' : 'ARIA_TRANS'),
    viewsMenuIncludeGuidelines: inclWcagGl.checked,

    rerunDelayEnabled: promptForDelay.checked,
    resultsIncludePassNa: inclPassNa.checked,

    exportFormat: (exportCSV.checked ? 'CSV' : 'JSON'),
    filenamePrefix: validatePrefix(exportPrefix.value),
    includeDate:    exportDate.checked,
    includeTime:    exportDate.checked,
    promptForExportOptions: exportPrompt.checked,

    shortcutCopy:    validateShortcut(shortcutCopyTextbox.value),
    shortcutExport:  validateShortcut(shortcutExportTextbox.value),
    shortcutRerun:   validateShortcut(shortcutRerunTextbox.value),
    shortcutViews:   validateShortcut(shortcutViewsTextbox.value),

    shortcutsEnabled:    shortcutsEnabledCheckbox.checked
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

  exportPrompt.checked   = options.promptForExportOptions;
  exportCSV.checked      = options.exportFormat === 'CSV';
  exportJSON.checked     = options.exportFormat === 'JSON';
  exportPrefix.value     = validatePrefix(options.filenamePrefix);
  exportDate.checked     = options.includeDate;

  shortcutBackKbd.textContent      = options.shortcutBack;
  shortcutCopyTextbox.value        = options.shortcutCopy;
  shortcutExportTextbox.value      = options.shortcutExport;
  shortcutRerunTextbox.value       = options.shortcutRerun;
  shortcutViewsTextbox.value       = options.shortcutViews;
  shortcutsEnabledCheckbox.checked = options.shortcutsEnabled;
}

function updateOptionsForm() {
  setFormLabels();
  getOptions().then(updateForm);
}

function saveDefaultOptions () {
  saveOptions(defaultOptions).then(getOptions).then(updateForm);
}

function onKeyupValidatePrefix () {
  let value = validatePrefix(exportPrefix.value);
  if (value !== exportPrefix.value) {
    if (exportPrefix.value >= 16) {
      console.log("[PrefixError]: Prefix can only be 16 characters");
    } else {
      console.log("[PrefixError]: Character not allowed");
    }
  }
  exportPrefix.value = value;
}

function checkForDuplicateKey (textbox, key) {

  function checkTextbox (tb) {
    if (tb !== textbox) {
      return tb.value !== key;
    }
    return true;
  }

  let flag = true;
  flag = flag && checkTextbox(shortcutCopyTextbox);
  flag = flag && checkTextbox(shortcutExportTextbox);
  flag = flag && checkTextbox(shortcutRerunTextbox);
  flag = flag && checkTextbox(shortcutViewsTextbox);

  return flag;
}

function onShortcutKeydown (event) {
  let tgt = event.currentTarget;
  let key = event.key;
  let currentKey = tgt.value;

  if (key.length === 1) {
    if (checkForDuplicateKey(tgt, key)) {
      tgt.value = key;
      saveFormOptions(event);
    }
    event.stopPropagation();
    event.preventDefault();
  }
}

// Add event listeners for saving and restoring options

document.addEventListener('DOMContentLoaded', updateOptionsForm);
inclWcagGl.addEventListener('change', saveFormOptions);
noDelay.addEventListener('change', saveFormOptions);
promptForDelay.addEventListener('change', saveFormOptions);
rulesetStrict.addEventListener('change', saveFormOptions);
rulesetTrans.addEventListener('change', saveFormOptions);
inclPassNa.addEventListener('change', saveFormOptions);

exportPrompt.addEventListener('change', saveFormOptions);
exportCSV.addEventListener('change', saveFormOptions);
exportJSON.addEventListener('change', saveFormOptions);
exportPrefix.addEventListener('change', saveFormOptions);
exportPrefix.addEventListener('keyup', onKeyupValidatePrefix);
exportDate.addEventListener('change', saveFormOptions);

shortcutCopyTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutExportTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutRerunTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutViewsTextbox.addEventListener('keydown', onShortcutKeydown);

shortcutsEnabledCheckbox.addEventListener('change', saveFormOptions);

resetDefaults.addEventListener('click', saveDefaultOptions);

