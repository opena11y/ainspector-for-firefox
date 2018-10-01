"use strict";

var preferencesDefaultButton  = document.getElementById('preferences_default');

var includeGuidelinesCheckbox = document.getElementById('include_guidelines');

var rulesetAriaStrictRadio = document.getElementById('ARIA_STRICT');
var rulesetAriaTransRadio  = document.getElementById('ARIA_TRANS');

var noDelayRadio        = document.getElementById('NO_DELAY');
var promptForDelayRadio = document.getElementById('PROMPT_FOR_DELAY');

var includePassAndNotApplicableCheckbox = document.getElementById('include_pass_and_na');

var reRunEvaluation = false;
// Restore Defaults

function handleResponse(message) {
  console.log(`Message from the sidebar script:  ${message.response}`);
}

function notifySidebarOfPreferenceChanges() {
  var sending = browser.runtime.sendMessage({
    updatePreferences: "all"
  });
  sending.then(handleResponse, onError);
}


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
  notifySidebarOfPreferenceChanges();

};

preferencesDefaultButton.addEventListener('click', handleResetDefault);

// Include Guidelines

function handleIncludeGuidelines (event) {
  messageArgs.includeGuidelines = includeGuidelinesCheckbox.checked;

  setAInspectorPreferences();
  notifySidebarOfPreferenceChanges();
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
    notifySidebarOfPreferenceChanges();
    reRunEvaluation = true;
  }
};

rulesetAriaStrictRadio.addEventListener('click', handleRulesetAriaStrict);

function handleRulesetAriaTrans (event) {
  if (rulesetAriaTransRadio.checked) {
    messageArgs.ruleset = 'ARIA_TRANS';
    setAInspectorPreferences();
    notifySidebarOfPreferenceChanges();
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

var storedValue = browser.storage.local.get("ainspectorPreferences").then(updateAInspectorPreferencesPanel, onError);

function updateAInspectorPreferencesPanel(item) {
  var prefs = item.ainspectorPreferences;

  if (typeof prefs != 'undefined'){
    messageArgs = prefs;
  }
  else {
    setAInspectorPreferences();
  }

  if (messageArgs.promptForDelay) {
    promptForDelayRadio.checked = true;
  }
  else {
    noDelayRadio.checked = true;
  }

  includeGuidelinesCheckbox.checked = messageArgs.includeGuidelines;

  if (messageArgs.ruleset === 'ARIA_STRICT') {
    rulesetAriaStrictRadio.checked = true;
  }
  else {
    rulesetAriaTransRadio.checked = true;
  }

  includePassAndNotApplicableCheckbox.checked = messageArgs.includePassAndNotApplicable;

};
