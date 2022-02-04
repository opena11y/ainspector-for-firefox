/* options.js */

import { getOptions, saveOptions, defaultOptions } from './storage.js';
import { validatePrefix, validateShortcut } from './validate.js';

const getMessage = browser.i18n.getMessage;

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

const shortcutBackTextbox    = document.querySelector('#options-shortcut-back');
const shortcutViewsTextbox   = document.querySelector('#options-shortcut-views');
const shortcutExportTextbox  = document.querySelector('#options-shortcut-export');
const shortcutRerunTextbox   = document.querySelector('#options-shortcut-rerun');
const shortcutDetailsTextbox = document.querySelector('#options-shortcut-details');
const shortcutGridTextbox    = document.querySelector('#options-shortcut-grid');
const shortcutInfoTextbox    = document.querySelector('#options-shortcut-info');
const shortcutTabsTextbox    = document.querySelector('#options-shortcut-tabs');
const shortcutCopyTextbox    = document.querySelector('#options-shortcut-copy');
const shortcutPreferencesTextbox   = document.querySelector('#options-shortcut-preferences');

const shortcutRequiredCtrlCheckbox  = document.querySelector('#options-shortcut-required-ctrl');
const shortcutRequiredShiftCheckbox = document.querySelector('#options-shortcut-required-shift');
const shortcutsDisabledCheckbox     = document.querySelector('#options-shortcuts-disabled');

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

  optionsExportHeading.textContent      = getMessage('optionsExportHeading');
  optionsExportPromptLabel.textContent  = getMessage('optionsExportPrompt');
  optionsExportFormatLegend.textContent = getMessage('optionsExportFormatLegend');
  optionsExportCSVLabel.textContent     = getMessage('optionsExportCSVLabel');
  optionsExportJSONLabel.textContent    = getMessage('optionsExportJSONLabel');
  optionsExportPrefixLabel.textContent  = getMessage('optionsExportPrefixLabel');
  optionsExportDateLabel.textContent    = getMessage('optionsExportIncludeDate');




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

    exportFormat: (exportCSV.checked ? 'CSV' : 'JSON'),
    filenamePrefix: validatePrefix(exportPrefix.value),
    includeDate:    exportDate.checked,
    includeTime:    exportDate.checked,
    promptForExportOptions: exportPrompt.checked,

    shortcutBack:    validateShortcut(shortcutBackTextbox.value),
    shortcutCopy:    validateShortcut(shortcutCopyTextbox.value),
    shortcutDetails: validateShortcut(shortcutDetailsTextbox.value),
    shortcutExport:  validateShortcut(shortcutExportTextbox.value),
    shortcutGrid:    validateShortcut(shortcutGridTextbox.value),
    shortcutInfo:    validateShortcut(shortcutInfoTextbox.value),
    shortcutPreferences:   validateShortcut(shortcutPreferencesTextbox.value),
    shortcutRerun:   validateShortcut(shortcutRerunTextbox.value),
    shortcutTabs:    validateShortcut(shortcutTabsTextbox.value),
    shortcutViews:   validateShortcut(shortcutViewsTextbox.value),

    shortcutRequireCtrl:  shortcutRequiredCtrlCheckbox.checked,
    shortcutRequireShift: shortcutRequiredShiftCheckbox.checked,
    shortcutsDisabled:    shortcutsDisabledCheckbox.checked
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

  shortcutBackTextbox.value    = options.shortcutBack;
  shortcutCopyTextbox.value    = options.shortcutCopy;
  shortcutDetailsTextbox.value = options.shortcutDetails;
  shortcutExportTextbox.value  = options.shortcutExport;
  shortcutGridTextbox.value    = options.shortcutGrid;
  shortcutInfoTextbox.value    = options.shortcutInfo;
  shortcutPreferencesTextbox.value   = options.shortcutPreferences;
  shortcutRerunTextbox.value   = options.shortcutRerun;
  shortcutTabsTextbox.value    = options.shortcutTabs;
  shortcutViewsTextbox.value   = options.shortcutViews;

  shortcutRequiredCtrlCheckbox.checked  = options.shortcutRequireCtrl;
  shortcutRequiredShiftCheckbox.checked = options.shortcutRequireShift;
  shortcutsDisabledCheckbox.checked     = options.shortcutsDisabled;
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
  flag = flag && checkTextbox(shortcutBackTextbox);
  flag = flag && checkTextbox(shortcutCopyTextbox);
  flag = flag && checkTextbox(shortcutDetailsTextbox);
  flag = flag && checkTextbox(shortcutExportTextbox);
  flag = flag && checkTextbox(shortcutGridTextbox);
  flag = flag && checkTextbox(shortcutInfoTextbox);
  flag = flag && checkTextbox(shortcutPreferencesTextbox);
  flag = flag && checkTextbox(shortcutRerunTextbox);
  flag = flag && checkTextbox(shortcutTabsTextbox);
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

shortcutBackTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutCopyTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutDetailsTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutExportTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutGridTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutInfoTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutPreferencesTextbox.addEventListener('keydown', saveFormOptions);
shortcutRerunTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutTabsTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutViewsTextbox.addEventListener('keydown', onShortcutKeydown);

shortcutRequiredCtrlCheckbox.addEventListener('change', saveFormOptions);
shortcutRequiredShiftCheckbox.addEventListener('change', saveFormOptions);
shortcutsDisabledCheckbox.addEventListener('change', saveFormOptions);

resetDefaults.addEventListener('click', saveDefaultOptions);

