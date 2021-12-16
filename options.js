/* options.js */

import { getOptions, saveOptions } from './storage.js';
const getMessage = browser.i18n.getMessage;

const debug = false;
const inclWcagGl     = document.querySelector('input[id="options-incl-wcag-gl"]');
const noDelay        = document.querySelector('input[id="options-no-delay"]');
const promptForDelay = document.querySelector('input[id="options-prompt-for-delay"]');
const rulesetStrict  = document.querySelector('input[id="ARIA_STRICT"]');
const rulesetTrans   = document.querySelector('input[id="ARIA_TRANS"]');
const inclPassNa     = document.querySelector('input[id="options-incl-pass-na"]');
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
  const optionsRulesetStrictLabel    = document.querySelector('#option-ruleset-strict-label');
  const optionsRulesetTransLabel     = document.querySelector('#option-ruleset-trans-label');
  const optionsRuleResultsLegend     = document.querySelector('#options-rule-results-legend');
  const optionsInclPassNaLabel       = document.querySelector('#options-incl-pass-na-label');
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
  optionsResetDefaults.textContent         = getMessage('optionsResetDefaults');
}

// Save user options selected in form and display message

function saveFormOptions (e) {
  e.preventDefault();

  const options = {
    rulesetId: (rulesetStrict.checked ? 'ARIA_STRICT' : 'ARIA_TRANS'),
    viewsMenuIncludeGuidelines: inclWcagGl.checked,
    rerunDelayEnabled: promptForDelay.checked,
    resultsIncludePassNa: inclPassNa.checked
  }

  if (debug) console.log(options);
  saveOptions(options);
}

// Update HTML form values based on user options saved in storage.sync

function updateOptionsForm() {
  setFormLabels();

  function updateForm (options) {
    console.log('updateForm: ', options);

    // Set form element values and states
    inclWcagGl.checked     = options.viewsMenuIncludeGuidelines;
    noDelay.checked        = !options.rerunDelayEnabled;
    promptForDelay.checked = options.rerunDelayEnabled;
    rulesetStrict.checked  = options.rulesetId === 'ARIA_STRICT';
    rulesetTrans.checked   = options.rulesetId === 'ARIA_TRANS';
    inclPassNa.checked     = options.resultsIncludePassNa;
  }

  getOptions().then(updateForm);
}

// Add event listeners for saving and restoring options

document.addEventListener('DOMContentLoaded', updateOptionsForm);
inclWcagGl.addEventListener('change', saveFormOptions);
noDelay.addEventListener('change', saveFormOptions);
promptForDelay.addEventListener('change', saveFormOptions);
rulesetStrict.addEventListener('change', saveFormOptions);
rulesetTrans.addEventListener('change', saveFormOptions);
inclPassNa.addEventListener('change', saveFormOptions);
// resetDefaults.addEventListener('click', saveFormOptions);

