/* options.js */

import { getOptions, saveOptions, defaultOptions } from './storage.js';
import { validatePrefix, validateShortcut } from './validate.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {};
msg.optionsTitle           = getMessage('optionsTitle');
msg.optionsViewsMenuLegend = getMessage('optionsViewsMenuLegend');
msg.optionsInclWcagGlLabel = getMessage('optionsInclWcagGlLabel');
msg.optionsRerunEvaluationLegend = getMessage('optionsRerunEvaluationLegend');
msg.optionsNoDelayLabel          = getMessage('optionsNoDelayLabel');
msg.optionsPromptForDelayLabel   = getMessage('optionsPromptForDelayLabel');
msg.optionsEvaluationHeading  = getMessage('optionsEvaluationHeading');
// msg.optionsRulesetLegend      = getMessage('optionsRulesetLegend');
// msg.optionsRulesetStrictLabel = getMessage('optionsRulesetStrictLabel');
// msg.optionsRulesetTransLabel  = getMessage('optionsRulesetTransLabel');
msg.optionsRuleResultsLegend  = getMessage('optionsRuleResultsLegend');
msg.optionsInclPassNaLabel    = getMessage('optionsInclPassNaLabel');
msg.optionsExportHeading      = getMessage('optionsExportHeading');
msg.optionsExportPrompt       = getMessage('optionsExportPrompt');
msg.optionsExportFormatLegend = getMessage('optionsExportFormatLegend');
msg.optionsExportCSVLabel     = getMessage('optionsExportCSVLabel');
msg.optionsExportJSONLabel    = getMessage('optionsExportJSONLabel');
msg.optionsExportPrefixLabel  = getMessage('optionsExportPrefixLabel');
msg.optionsExportPrefixErrorToLong         = getMessage('optionsExportPrefixErrorToLong');
msg.optionsExportPrefixErrorCharNotAllowed = getMessage('optionsExportPrefixErrorCharNotAllowed');

msg.optionsExportIncludeDate  = getMessage('optionsExportIncludeDate');
msg.optionsResetDefaults      = getMessage('optionsResetDefaults');

msg.shortcutsHeading       = getMessage('shortcutsHeading');
msg.shortcutsEnabledLabel  = getMessage('shortcutsEnabledLabel');
msg.shortcutsTableShortcut = getMessage('shortcutsTableShortcut');
msg.shortcutsTableAction   = getMessage('shortcutsTableAction');
msg.shortcutBackLabel      = getMessage('shortcutBackLabel');
msg.shortcutViewsLabel     = getMessage('shortcutViewsLabel');
msg.shortcutExportLabel    = getMessage('shortcutExportLabel');
msg.shortcutRerunLabel     = getMessage('shortcutRerunLabel');
msg.shortcutCopyLabel      = getMessage('shortcutCopyLabel');
msg.shortcutsNote          = getMessage('shortcutsNotes');
msg.shortcutAllreadyUsed   = getMessage('shortcutAllreadyUsed');

const debug = false;
const inclWcagGl     = document.querySelector('input[id="options-incl-wcag-gl"]');
const noDelay        = document.querySelector('input[id="options-no-delay"]');
const promptForDelay = document.querySelector('input[id="options-prompt-for-delay"]');

// const rulesetStrict  = document.querySelector('input[id="ARIA_STRICT"]');
// const rulesetTrans   = document.querySelector('input[id="ARIA_TRANS"]');
const inclPassNa     = document.querySelector('input[id="options-incl-pass-na"]');

const exportPrompt     = document.querySelector('#options-export-prompt');
const exportCSV        = document.querySelector('#options-export-csv');
const exportJSON       = document.querySelector('#options-export-json');
const exportPrefix     = document.querySelector('#options-export-prefix');
const exportPrefixDesc = document.querySelector('#options-export-prefix-desc');
const exportDate       = document.querySelector('#options-export-date');

const shortcutsEnabledCheckbox  = document.querySelector('#shortcuts-enabled');
const shortcutBackKbd           = document.querySelector('#shortcut-back');
const shortcutViewsTextbox      = document.querySelector('#shortcut-views');
const shortcutExportTextbox     = document.querySelector('#shortcut-export');
const shortcutRerunTextbox      = document.querySelector('#shortcut-rerun');
const shortcutCopyTextbox       = document.querySelector('#shortcut-copy');

const resetDefaults  = document.querySelector('button[id="options-reset-defaults"]');

function setFormLabels () {
  const optionsTitle            = document.querySelector('#options-title');
  const optionsViewsMenuLegend  = document.querySelector('#options-views-menu-legend');
  const optionsInclWcagGlLabel  = document.querySelector('#options-incl-wcag-gl-label');

  const optionsRerunEvaluationLegend = document.querySelector('#options-rerun-evaluation-legend');
  const optionsNoDelayLabel          = document.querySelector('#options-no-delay-label');
  const optionsPromptForDelayLabel   = document.querySelector('#options-prompt-for-delay-label');

  const optionsEvaluationHeading     = document.querySelector('#options-evaluation-heading');
//  const optionsRulesetLegend         = document.querySelector('#options-ruleset-legend');
//  const optionsRulesetStrictLabel    = document.querySelector('#options-ruleset-strict-label');
//  const optionsRulesetTransLabel     = document.querySelector('#options-ruleset-trans-label');
  const optionsRuleResultsLegend     = document.querySelector('#options-rule-results-legend');
  const optionsInclPassNaLabel       = document.querySelector('#options-incl-pass-na-label');

  const optionsExportHeading         = document.querySelector('#options-export-heading');
  const optionsExportPromptLabel     = document.querySelector('#options-export-prompt-label');
  const optionsExportFormatLegend    = document.querySelector('#options-export-format-legend');
  const optionsExportCSVLabel        = document.querySelector('#options-export-csv-label');
  const optionsExportJSONLabel       = document.querySelector('#options-export-json-label');
  const optionsExportPrefixLabel     = document.querySelector('#options-export-prefix-label');
  const optionsExportDateLabel       = document.querySelector('#options-export-date-label');

  const shortcutsHeading       = document.querySelector('#shortcuts-heading');
  const shortcutsEnabledLabel  = document.querySelector('#shortcuts-enabled-label');
  const shortcutsTableShortcut = document.querySelector('#shortcut-table-shortcut');
  const shortcutsTableAction   = document.querySelector('#shortcut-table-action');
  const shortcutBackLabel     = document.querySelector('#shortcut-back-label');
  const shortcutViewsLabel    = document.querySelector('#shortcut-views-label');
  const shortcutExportLabel   = document.querySelector('#shortcut-export-label');
  const shortcutRerunLabel    = document.querySelector('#shortcut-rerun-label');
  const shortcutCopyLabel     = document.querySelector('#shortcut-copy-label');
  const shortcutsNote         = document.querySelector('#shortcuts-note');


  const optionsResetDefaults  = document.querySelector('#options-reset-defaults');

  optionsTitle.textContent            = msg.optionsTitle;
  optionsViewsMenuLegend.textContent  = msg.optionsViewsMenuLegend;
  optionsInclWcagGlLabel.textContent  = msg.optionsInclWcagGlLabel;
  optionsRerunEvaluationLegend.textContent = msg.optionsRerunEvaluationLegend;
  optionsNoDelayLabel.textContent          = msg.optionsNoDelayLabel;
  optionsPromptForDelayLabel.textContent   = msg.optionsPromptForDelayLabel;

  optionsEvaluationHeading.textContent     = msg.optionsEvaluationHeading;
//  optionsRulesetLegend.textContent         = msg.optionsRulesetLegend;
//  optionsRulesetStrictLabel.textContent    = msg.optionsRulesetStrictLabel;
//  optionsRulesetTransLabel.textContent     = msg.optionsRulesetTransLabel;
  optionsRuleResultsLegend.textContent     = msg.optionsRuleResultsLegend;
  optionsInclPassNaLabel.textContent       = msg.optionsInclPassNaLabel;

  optionsExportHeading.textContent      = msg.optionsExportHeading;
  optionsExportPromptLabel.textContent  = msg.optionsExportPrompt;
  optionsExportFormatLegend.textContent = msg.optionsExportFormatLegend;
  optionsExportCSVLabel.textContent     = msg.optionsExportCSVLabel;
  optionsExportJSONLabel.textContent    = msg.optionsExportJSONLabel;
  optionsExportPrefixLabel.textContent  = msg.optionsExportPrefixLabel;
  optionsExportDateLabel.textContent    = msg.optionsExportIncludeDate;

  shortcutsHeading.textContent       = msg.shortcutsHeading;
  shortcutsEnabledLabel.textContent  = msg.shortcutsEnabledLabel;
  shortcutsTableShortcut.textContent = msg.shortcutsTableShortcut;
  shortcutsTableAction.textContent   = msg.shortcutsTableAction;
  shortcutBackLabel.textContent      = msg.shortcutBackLabel;
  shortcutViewsLabel.textContent     = msg.shortcutViewsLabel;
  shortcutExportLabel.textContent    = msg.shortcutExportLabel;
  shortcutRerunLabel.textContent     = msg.shortcutRerunLabel;
  shortcutCopyLabel.textContent      = msg.shortcutCopyLabel;
  shortcutsNote.textContent          = msg.shortcutsNote;

  optionsResetDefaults.textContent         = msg.optionsResetDefaults;
}

// Save user options selected in form and display message

function saveFormOptions (e) {
  e.preventDefault();

  const options = {
  //  rulesetId: (rulesetStrict.checked ? 'ARIA_STRICT' : 'ARIA_TRANS'),
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
//  rulesetStrict.checked  = options.rulesetId === 'ARIA_STRICT';
//  rulesetTrans.checked   = options.rulesetId === 'ARIA_TRANS';
  inclPassNa.checked     = options.resultsIncludePassNa;

  exportPrompt.checked   = options.promptForExportOptions;
  exportCSV.checked      = options.exportFormat === 'CSV';
  exportJSON.checked     = options.exportFormat === 'JSON';
  exportPrefix.value     = options.filenamePrefix;
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

function hidePrefixError() {
  exportPrefixDesc.textContent = '';
  exportPrefixDesc.classList.remove('show');
}

function showPrefixError(message) {
  exportPrefixDesc.textContent = message;
  exportPrefixDesc.classList.add('show');
}

function onKeyupValidatePrefix () {
  hidePrefixError();
  const value = validatePrefix(exportPrefix.value);
  const key = exportPrefix.value[exportPrefix.value.length - 1];
  if (value !== exportPrefix.value) {
    if (exportPrefix.value.length >= 16) {
      showPrefixError(msg.optionsExportPrefixErrorToLong);
      console.log('[PREFIX][ERROR]: ' + msg.optionsExportPrefixErrorToLong);
    } else {
      showPrefixError(msg.optionsExportPrefixErrorCharNotAllowed.replaceAll('$key', `"${key}"`));
      console.log('[PREFIX][ERROR]: ' + msg.optionsExportPrefixErrorCharNotAllowed.replaceAll('$key', `"${key}"`));
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

function clearDesc (target) {
  const descDiv = target.parentNode.querySelector('.feedback');
  if (descDiv) {
    descDiv.classList.remove('show');
  }
  return descDiv;
}

function onShortcutKeydown (event) {
  const tgt = event.currentTarget;
  const descDiv = clearDesc(tgt);
  const key = event.key;
  const currentKey = tgt.value;

  if (key.length === 1) {
    if (checkForDuplicateKey(tgt, key)) {
      tgt.value = key;
      saveFormOptions(event);
    } else {
      if (descDiv) {
        descDiv.textContent = msg.shortcutAllreadyUsed.replace('$key', `"${key}"`);
        descDiv.classList.add('show');
      }
    }
    event.stopPropagation();
    event.preventDefault();
  }
}

function onShortcutBlur (event) {
  const tgt = event.currentTarget;
  const descDiv = clearDesc(tgt);
}

// Add event listeners for saving and restoring options

document.addEventListener('DOMContentLoaded', updateOptionsForm);
inclWcagGl.addEventListener('change', saveFormOptions);
noDelay.addEventListener('change', saveFormOptions);
promptForDelay.addEventListener('change', saveFormOptions);
// rulesetStrict.addEventListener('change', saveFormOptions);
// rulesetTrans.addEventListener('change', saveFormOptions);
inclPassNa.addEventListener('change', saveFormOptions);

exportPrompt.addEventListener('change', saveFormOptions);
exportCSV.addEventListener('change', saveFormOptions);
exportJSON.addEventListener('change', saveFormOptions);
exportPrefix.addEventListener('change', saveFormOptions);
exportPrefix.addEventListener('keyup', onKeyupValidatePrefix);
exportPrefix.addEventListener('blur', hidePrefixError);
exportDate.addEventListener('change', saveFormOptions);

shortcutCopyTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutExportTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutRerunTextbox.addEventListener('keydown', onShortcutKeydown);
shortcutViewsTextbox.addEventListener('keydown', onShortcutKeydown);

shortcutCopyTextbox.addEventListener('blur', onShortcutBlur);
shortcutExportTextbox.addEventListener('blur', onShortcutBlur);
shortcutRerunTextbox.addEventListener('blur', onShortcutBlur);
shortcutViewsTextbox.addEventListener('blur', onShortcutBlur);

shortcutsEnabledCheckbox.addEventListener('change', saveFormOptions);

resetDefaults.addEventListener('click', saveDefaultOptions);

