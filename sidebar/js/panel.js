"use strict";

function onError(error) {
//  console.error(`Error: ${error}`);
}

var messageArgs = {
  promptForDelay: false,
  delay: 5,
  delayCount: 0,
  includeGuidelines: true,
  includePassAndNotApplicable: true,
  ruleset: 'ARIA_STRICT',
  option: 'summary',
  groupType: 'rc',
  groupId: 1,
  rule: '',
  position: -1,
  highlight: 'none',  // other options 'selected', 'v/w', 'mc' and 'all'
  position: 0       // position of element to highlight
};

// Setup storage

var storedValue = browser.storage.local.get("ainspectorPreferences").then(getAInspectorPreferences, onError);

function getAInspectorPreferences(item) {
  var prefs = item.ainspectorPreferences;

  if (typeof prefs != 'undefined'){
    messageArgs = prefs;

    if ((messageArgs.option !== 'summary') &&
        (messageArgs.option !== 'group') &&
        (messageArgs.option !== 'rule')) {

      if (messageArgs.option === 'highlight') {
        messageArgs.option = 'group';
      }
      else {
        messageArgs.option = 'summary';
      }
    }
  }
  else {
    setAInspectorPreferences();
  }
}

function setAInspectorPreferences() {

  var ainspectorPreferences = messageArgs;

  browser.storage.local.set({ainspectorPreferences})

}

browser.runtime.onMessage.addListener(notify);

function notify(message) {
  if (message.messageForPanel) {
    changePanelElements(message.messageForPanel);
  }
};

browser.contextMenus.create({
  id: "ainspector",
  title: "AInspector Sidebar",
  contexts: ["all"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ainspector") {
    browser.sidebarAction.open();
    evaluateButton.click();
  }
});

function changePanelElements(evaluationResult) {

  function updateResults () {
    hide('summary_panel');
    hide('group_panel');
    hide('rule_panel');

    document.getElementById("ruleset").innerHTML = evaluationResult.ruleset;

    var url = evaluationResult.url;
    if (evaluationResult.url.length > 50) {
      url = evaluationResult.url.substring(0, 48) + '...';
    }
    document.getElementById("location").innerHTML = url;
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
      show('summary_panel');
      updateTitle("Summary");
      backButton.disabled = true;
      updateSummaryPanel(evaluationResult);
      setSummaryPanelFocus();
      break;

    case 'group':
      updateResults();
      show('group_panel');
      updateTitle(evaluationResult.groupLabel);
      updateGroupPanel(evaluationResult);
      setGroupPanelFocus();
      break;

    case 'rule':
      updateResults();
      show('rule_panel');
      if (evaluationResult.groupType === 'rc') {
        updateTitle(evaluationResult.ruleResult.category);
      }
      else {
        updateTitle(evaluationResult.ruleResult.guideline);
      }
      updateRulePanel(evaluationResult);
      break;

    case 'highlight':
      break;

    default:
      break;
  }
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

  setAInspectorPreferences()

  if (messageArgs.option !== 'highlight') {
    clearSummaryPanel();
    clearGroupPanel();
    clearRulePanel();
  }

  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      messageArgs
    ).then(response => {
      var evaluationResult = response.response;
      changePanelElements(evaluationResult);
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
evaluateButton.addEventListener("click", handleEvaluateButton);

window.addEventListener("load", function(){
    messageArgs.option    = 'summary';

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(sendMessageToTabs).catch(onError);
});

window.addEventListener("unload", function(){
      alert('unload');
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
      backButton.disabled = true;
      update = true;
      showSummaryPanel();
      hideGroupPanel();
      break;

    case 'rule':
    case 'highlight':
      messageArgs.option = 'group';
      update = true;
      showGroupPanel();
      hideRulePanel();
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




// Initialize panel

clearSummaryPanel();
clearGroupPanel();

showSummaryPanel();
hideGroupPanel();
hideRulePanel();

backButton.disabled = true;
detailsGroupButton.disabled = true;


