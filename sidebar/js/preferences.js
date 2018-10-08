"use strict";

// Internationalizationalization of preferences messages

var prefsTitle  = document.getElementById('prefs_title');
prefsTitle.textContent = i18n('prefsTitle');

var prefsGeneral  = document.getElementById('prefs_general');
prefsGeneral.textContent = i18n('prefsGeneral');

var prefsViewsMenu  = document.getElementById('prefs_views_menu');
prefsViewsMenu.textContent = i18n('prefsViewsMenu');

var prefsIncludeGuidelinesLabel  = document.getElementById('prefs_include_guidelines_label');
prefsIncludeGuidelinesLabel.textContent = i18n('prefsIncludeGuidelinesLabel');

var prefsNoDelayLabel  = document.getElementById('prefs_no_delay_label');
prefsNoDelayLabel.textContent = i18n('prefsNoDelayLabel');

var prefsPromptForDelayLabel  = document.getElementById('prefs_prompt_for_delay_label');
prefsPromptForDelayLabel.textContent = i18n('prefsPromptForDelayLabel');




var defaultButton  = document.getElementById('prefs_default');
defaultButton.textContent = i18n('prefsDefault');

var includeGuidelinesCheckbox = document.getElementById('prefs_include_guidelines_checkbox');

var rulesetAriaStrictRadio = document.getElementById('ARIA_STRICT');
var rulesetAriaTransRadio  = document.getElementById('ARIA_TRANS');

var noDelayRadio        = document.getElementById('prefs_no_delay');
var promptForDelayRadio = document.getElementById('prefs_prompt_for_delay');

var includePassAndNotApplicableCheckbox = document.getElementById('prefs_include_pass_and_na');

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

defaultButton.addEventListener('click', handleResetDefault);

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
