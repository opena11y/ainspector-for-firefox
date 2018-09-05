"use strict";

function onError(error) {
//  console.error(`Error: ${error}`);
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

  // Hide all view options

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

  switch(evaluationResult.option) {
    case 'summary':
      show('summary_panel');
      updateTitle("Summary");
      updateSummaryPanel(evaluationResult);
      setSummaryPanelFocus();
      break;

    case 'group':
      show('group_panel');
      updateTitle(evaluationResult.groupLabel);
      updateGroupPanel(evaluationResult);
      setGroupPanelFocus();
      break;

    case 'rule':
      show('rule_panel');
      if (evaluationResult.groupType = 'rc') {
        updateTitle(evaluationResult.ruleResult.category);
      }
      else {
        updateTitle(evaluationResult.ruleResult.guideline);
      }
      updateRulePanel(evaluationResult);
      break;

    default:
      break;

  }

}

// Group events and messages

function handleUpdateEvaluation() {

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
  clearSummaryPanel();
  clearGroupPanel();
  clearRulePanel();

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

var evaluateButton = document.getElementById('evaluate');
evaluateButton.addEventListener("click", handleUpdateEvaluation);

window.addEventListener("load", function(){
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

var messageArgs = {
  option: 'summary',
  ruleset: 'ARIA_STRICT',
  groupType: 'rc',
  groupId: 1,
  rule: '',
  position: -1,
  highight: 'none'  // other options 'selected', 'v/w', 'mc' and 'all'
};

// Initialize panel

clearSummaryPanel();
clearGroupPanel();

showSummaryPanel();
hideGroupPanel();
hideRulePanel();

backButton.disabled = true;
detailsGroupButton.disabled = true;


