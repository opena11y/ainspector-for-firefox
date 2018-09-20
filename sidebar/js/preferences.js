"use strict";

hide('ainspector_preferences');

var preferencesButton         = document.getElementById('preferences');
var preferencesDefaultButton  = document.getElementById('preferences_default');
var preferencesCloseButton    = document.getElementById('preferences_close');

var includeGuidelinesCheckbox = document.getElementById('include_guidelines');

var rulesetAriaStrictRadio = document.getElementById('ARIA_STRICT');
var rulesetAriaTransRadio  = document.getElementById('ARIA_TRANS');

var noDelayRadio        = document.getElementById('NO_DELAY');
var promptForDelayRadio = document.getElementById('PROMPT_FOR_DELAY');

var includePassAndNotApplicableCheckbox = document.getElementById('include_pass_and_na');

var reRunEvaluation = false;
// Restore Defaults

function handleResetDefault (event) {

  messageArgs.includeGuidelines = false;
  includeGuidelinesCheckbox.checked = false;

  messageArgs.promptForDelay = false;
  noDelayRadio.checked = true;

  if (messageArgs.ruleset !== 'ARIA_STRICT') {
    messageArgs.ruleset = 'ARIA_STRICT';
    rulesetAriaStrictRadio.checked = true;
    reRunEvaluation = true;
  }

  if (!messageArgs.includePassAndNotApplicable) {
    messageArgs.includePassAndNotApplicable = true;
    includePassAndNotApplicableCheckbox.checked = true;
    reRunEvaluation = true;
  }

  setAInspectorPreferences();

};

preferencesDefaultButton.addEventListener('click', handleResetDefault);


// Open Preferences

function handlePreferences (event) {

  reRunEvaluation = false;

  includeGuidelinesCheckbox.checked = messageArgs.includeGuidelines;

  if (messageArgs.promptForDelay) {
    promptForDelayRadio.checked = true;
  }
  else {
    noDelayRadio.checked = true;
  }

  if (messageArgs.ruleset === 'ARIA_STRICT') {
    rulesetAriaStrictRadio.checked = true;
  }

  if (messageArgs.ruleset === 'ARIA_TRANS') {
    rulesetAriaTransRadio.checked = true;
  }

  includePassAndNotApplicableCheckbox.checked = messageArgs.includePassAndNotApplicable;

  hide('ainspector_results');
  show('ainspector_preferences');
};

preferencesButton.addEventListener('click', handlePreferences);


// Close preferences

function handlePreferencesClose (event) {
  hide('ainspector_preferences');
  show('ainspector_results');

  if (reRunEvaluation) {
    handleUpdateEvaluation();
  }
};

preferencesCloseButton.addEventListener('click', handlePreferencesClose);


// Include Guidelines

function handleIncludeGuidelines (event) {
  messageArgs.includeGuidelines = includeGuidelinesCheckbox.checked;
  setAInspectorPreferences();
};

includeGuidelinesCheckbox.addEventListener('click', handleIncludeGuidelines);

// Delay

function handleNoDelay (event) {
  if (noDelayRadio.checked) {
    messageArgs.promptForDelay = false;
    setAInspectorPreferences();
  }
};

noDelayRadio.addEventListener('click', handleNoDelay);

function handlePromptForDelay (event) {
  if (promptForDelayRadio.checked) {
    messageArgs.promptForDelay = true;
    setAInspectorPreferences();
  }
};

promptForDelayRadio.addEventListener('click', handlePromptForDelay);


// Set rulesets

function handleRulesetAriaStrict (event) {
  if (rulesetAriaStrictRadio.checked) {
    messageArgs.ruleset = 'ARIA_STRICT';
    setAInspectorPreferences();
    reRunEvaluation = true;
  }
};

rulesetAriaStrictRadio.addEventListener('click', handleRulesetAriaStrict);

function handleRulesetAriaTrans (event) {
  if (rulesetAriaTransRadio.checked) {
    messageArgs.ruleset = 'ARIA_TRANS';
    setAInspectorPreferences();
    reRunEvaluation = true;
  }
};

rulesetAriaTransRadio.addEventListener('click', handleRulesetAriaTrans);

// Include Pass and Not Applicable

function handleIncludePassAndNotApplicable (event) {
  messageArgs.includePassAndNotApplicable = includePassAndNotApplicableCheckbox.checked;
  setAInspectorPreferences();
  reRunEvaluation = true;
};

includePassAndNotApplicableCheckbox.addEventListener('click', handleIncludePassAndNotApplicable);

