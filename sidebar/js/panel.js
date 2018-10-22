"use strict";

var storedValue = browser.storage.local.get("ainspectorPreferences").then(getAInspectorPreferences, onError);

browser.runtime.onMessage.addListener(notify);

function notify(message) {

  if (message.messageForPanel) {
    updateEvaluationResults(message.messageForPanel);
  }

  if (message.updatePreferences) {
    browser.storage.local.get("ainspectorPreferences").then(getAInspectorPreferences, onError);
  }
};

function updateEvaluationResults(evaluationResult) {

  function updateResults () {
    summaryPanel.hide();
    groupPanel.hide();
    rulePanel.hide();

    document.getElementById("ruleset").textContent = i18n(evaluationResult.ruleset);

    var url = evaluationResult.url;
    if (evaluationResult.url.length > 50) {
      url = evaluationResult.url.substring(0, 48) + '...';
    }
    document.getElementById("location").textContent = url;
    if (url !== evaluationResult.url) {
      document.getElementById("location").setAttribute('title', evaluationResult.url);
    }
  }

  switch(evaluationResult.option) {
    case 'update':
      handleUpdateEvaluation();
      break;

    case 'summary':
      updateResults();
      updateTitle("labelSummary");
      summaryPanel.update(evaluationResult);
      summaryPanel.show();
      summaryPanel.setFocus();
      break;

    case 'group':
      updateResults();
      updateTitle(evaluationResult.groupLabel);
      groupPanel.update(evaluationResult);
      groupPanel.show();
      groupPanel.setFocus();
      break;

    case 'rule':
      updateResults();
      if (evaluationResult.groupType === 'rc') {
        updateTitle(evaluationResult.ruleResult.category);
      }
      else {
        updateTitle(evaluationResult.ruleResult.guideline);
      }
      rulePanel.update(evaluationResult);
      rulePanel.show();
//      rulePanel.setFocus();
      break;

    case 'highlight':
      break;

    case 'preferenceUpdate':
      alert('Preference Update');
      break;

    default:
      break;
  }
};

function repositionFooter(id) {

  var mainNode = document.getElementById('id_main');
  var mainRect = mainNode.getBoundingClientRect();

  var footerNode  = document.getElementById('id_footer');
  var footerRect  = footerNode.getBoundingClientRect();

  if (mainRect.bottom === 0) {
    return;
  }

  var diff = window.innerHeight - (mainRect.bottom + footerRect.height);


  if (diff < 9) {
    footerNode.style.position = 'static';
    footerNode.style.bottom   = 'auto';
  }
  else {
    footerNode.style.position = 'absolute';
    footerNode.style.bottom   = '0px';
  }



}

function debug(message) {

  messageArgs.option    = 'debug';
  messageArgs.debug     = message;

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};

// Group events and messages

function handleUpdateEvaluation() {

  if (messageArgs.option === 'highlight') {
    messageArgs.option = 'rule';
  }

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
}

function handleGetSummary() {

  messageArgs.option    = 'summary';

  backButton.disabled = true;

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};


function handleGetGroup(id) {

  var groupType = id.substring(0,2);
  var groupId   = id.split('-')[1];

  messageArgs.option    = 'group';
  messageArgs.groupType = groupType;
  messageArgs.groupId   = parseInt(groupId);

  backButton.disabled = false;

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};

function handleGetRule(ruleId, position) {

  if (typeof position !== 'number') {
    position = -1;
  }

  messageArgs.option    = 'rule';
  messageArgs.ruleId    = ruleId;
  messageArgs.position  = position;

  backButton.disabled = false;

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};

// Add event handlers

function sendMessageToTabs(tabs) {

  switch (messageArgs.option) {
    case 'debug':
    case 'unload':
      break;

    case 'highlight':
      setAInspectorPreferences();
      break;

    default:
      setAInspectorPreferences();
      summaryPanel.clear();
      groupPanel.clear();
      rulePanel.clear();
      break;
  }

  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      messageArgs
    ).then(response => {
      var evaluationResult = response.response;
      updateEvaluationResults(evaluationResult);
    }).catch(onError);
  }
};


function handleEvaluateButton () {

  if (messageArgs.promptForDelay) {
    delayDialog.open();
  }
  else {
    handleUpdateEvaluation();
  }
}

var evaluateButton = document.getElementById('evaluate');
evaluateButton.textContent = i18n('labelRerunEvaluate');
evaluateButton.addEventListener("click", handleEvaluateButton);

window.addEventListener("load", function(){

    messageArgs.option    = 'summary';

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);
});

window.addEventListener("unload", function(){

      messageArgs.option    = 'unload';

      browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);
});

// Back button

function handleBack(event) {
  var update = false;

  switch (messageArgs.option) {
    case 'group':
      messageArgs.option = 'summary';
      update = true;
      groupPanel.hide();
      summaryPanel.show();
      break;

    case 'rule':
    case 'highlight':
      messageArgs.option = 'group';
      update = true;
      rulePanel.hide();
      groupPanel.show();
      break;

    default:
      break;
  }

  if (update) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);
  }
};

var backButton = document.getElementById('back');
backButton.textContent = i18n('labelBack');
backButton.addEventListener('click', handleBack);

// Highlight button

function handleHighlight(event) {
  var value = event.target.value;

  messageArgs.option    = 'highlight';

  if (value) {
    messageArgs.highlight = value;
  }
  else {
    messageArgs.highlight = 'none';
  }

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};

var highlightOptions = document.getElementById('highlight');
highlightOptions.addEventListener('change', handleHighlight);

document.getElementById('highlight_label').textContent = i18n('labelHighlight');



// initialize Preferences

function handlePreferences (event) {
   chrome.runtime.openOptionsPage();
};

var preferencesButton = document.getElementById('preferences');
preferencesButton.textContent = i18n('labelPreferences');
preferencesButton.addEventListener('click', handlePreferences);

// Initialize panels

summaryPanel.init();
groupPanel.init();
rulePanel.init();

summaryPanel.show();
groupPanel.hide();
rulePanel.hide();
