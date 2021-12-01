/*
*   panel.js
*/

import { saveOptions } from '../storage.js';

import viewSummary     from './viewSummary.js';
import viewGroup       from './viewGroup.js';
import viewRule        from './viewRule.js';

import ResultSummary   from './resultSummary.js';
import ResultTablist   from './resultTablist.js';
import ResultGrid      from './resultGrid.js';
import ResultRuleInfo  from './resultRuleInfo.js';

customElements.define('result-summary',   ResultSummary);
customElements.define('result-tablist',   ResultTablist);
customElements.define('result-grid',      ResultGrid);
customElements.define('result-rule-info', ResultRuleInfo);

var myWindowId;
var logInfo = true;

var vSummary;
var vGroup;
var vRule;
var views;

var sidebarView      = 'summary';  // other options 'group' or 'rule'
var sidebarGroupType = 'rc';  // options 'rc' or 'gl'
var sidebarGroupId   = 1;  // numberical value
var sidebarRuleId      = 'test rule';
var sidebarRulesetId = 'ARIA_STRICT';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;

const emptyContent         = getMessage("emptyContent");
const noHeadingElements    = getMessage("noHeadingElements");
const tabIsLoading         = getMessage("tabIsLoading");
const protocolNotSupported = getMessage("protocolNotSupported");

function addLabelsAndHelpContent () {
  // Header titles and labels

  document.getElementById('view-title').textContent =
    getMessage("viewTitleSummaryLabel");
  document.getElementById('back-button').textContent =
    getMessage("backButtonLabel");
  document.getElementById('views-button').textContent =
    getMessage("viewsButtonLabel");

  // Footer titles and labels

  document.querySelector('#info-location .label').textContent =
    getMessage("infoLocationLabel");
  document.querySelector('#info-title .label').textContent =
    getMessage("infoTitleLabel");
  document.querySelector('#info-ruleset .label').textContent =
    getMessage("infoRulesetLabel");

  document.getElementById('preferences-button').textContent =
    getMessage("preferencesButtonLabel");
  document.getElementById('rerun-evaluation-button').textContent =
    getMessage("rerunEvaluationButtonLabel");

}

function handleSummaryRowClick (event) {
  let tgt = event.currentTarget;

  sidebarView      = 'group';
  sidebarGroupType = tgt.id.substring(0,2);
  sidebarGroupId   = parseInt(tgt.id.substring(2));

  runContentScript('handleSummaryRowClick');
}

function initControls () {

  let backBtn = document.getElementById('back-button');
  backBtn.addEventListener('click', handleClickBackButton);

  let rerunBtn = document.getElementById('rerun-evaluation-button');
  rerunBtn.addEventListener('click', handleClickRerunEvaluationButton);

  vSummary = new viewSummary('summary', handleSummaryRowClick);
  vGroup   = new viewGroup('group');
  vRule    = new viewRule('rule');

  views = document.querySelectorAll('main .view');
  showView('summary');
}

function handleClickBackButton() {

  switch (sidebarView) {
    case 'group':
      sidebarView = 'summary';
      break;

    case 'rule':
      sidebarView = 'group';
      break;

    default:
      break;
  }
  runContentScript('handleClickBackButton');
}

function handleClickRerunEvaluationButton() {
  runContentScript('handleClickRerunEvaluationButton');
}

/*
*   When the sidebar loads, store the ID of the current window and update
*   the sidebar content.
*/
browser.windows.getCurrent({ populate: true }).then( (windowInfo) => {
  myWindowId = windowInfo.id;
  addLabelsAndHelpContent();
  initControls();
  runContentScript('onload');
});

/*
*   Generic error handler
*/
function onError (error) {
  console.log(`Error: ${error}`);
}

//--------------------------------------------------------------
//  Functions that handle menu, preferences and re-run evaluation
//  button actions
//--------------------------------------------------------------


//-----------------------------------------------
//  Functions that handle tab and window events
//-----------------------------------------------

/*
*   Handle tabs.onUpdated event when status is 'complete'
*/
let timeoutID;
function handleTabUpdated (tabId, changeInfo, tab) {
  // Skip content update when new page is loaded in background tab
  if (!tab.active) return;

  clearTimeout(timeoutID);
  if (changeInfo.status === "complete") {
    runContentScript('handleTabUpdated');
  }
  else {
    timeoutID = setTimeout(function () {
      updateSidebar(tabIsLoading);
    }, 250);
  }
}

/*
*   Handle tabs.onActivated event
*/
function handleTabActivated (activeInfo) {
  if (logInfo) console.log(activeInfo);

  runContentScript('handleTabActivated');
}

/*
*   Handle window focus change events: If the sidebar is open in the newly
*   focused window, save the new window ID and update the sidebar content.
*/
function handleWindowFocusChanged (windowId) {
  if (windowId !== myWindowId) {
    let checkingOpenStatus = browser.sidebarAction.isOpen({ windowId });
    checkingOpenStatus.then(onGotStatus, onInvalidId);
  }

  function onGotStatus (result) {
    if (result) {
      myWindowId = windowId;
      runContentScript('onGotFocus');
      if (logInfo) console.log(`Focus changed to window: ${myWindowId}`);
    }
  }

  function onInvalidId (error) {
    if (logInfo) console.log(`onInvalidId: ${error}`);
  }
}

//---------------------------------------------------------------
//  Functions that process and display data from content script
//---------------------------------------------------------------

/*
*   Show and hide views.
*/

function showView (id) {
  for (let i = 0; i < views.length; i++) {
    let view = views[i];
    if (view.id === id) {
      view.classList.add('show');
    } else {
      view.classList.remove('show');
    }
  }
}

/*
*   Display the content generated by the content script.
*/
function updateSidebar (info) {
  let viewTitle    = document.querySelector('#view-title');
  let infoLocation = document.querySelector('#info-location .value');
  let infoTitle    = document.querySelector('#info-title .value');
  let infoRuleset  = document.querySelector('#info-ruleset .value');

  // page-title and headings
  if (typeof info === 'object') {

    // Update the page information footer
    infoTitle.innerHTML    = info.title;
    infoLocation.innerHTML = info.location;
    infoRuleset.innerHTML  = info.ruleset;

    // Update the headings box
    if (typeof info.infoSummary === 'object') {
      viewTitle.textContent = getMessage("viewTitleSummaryLabel");
      showView('summary');
      vSummary.update(info.infoSummary);
    }
    else {
      if (typeof info.infoGroup === 'object') {
        viewTitle.textContent = info.infoGroup.groupLabel;
        showView('group');
        vGroup.update(info.infoGroup);
      }
      else {
        if (info.infoRule) {
          showView('rule');
//          vRule.update(info.infoRule);
        }
        else {
          vSummary.clear();
 //         vGroup.clear();
 //         vRule.clear();
        }
      }
    }
  }
  else {
    let parts = info.split(';');
    if (parts.length == 1) {
      infoLocation.textContent = '';
      infoTitle.textContent = info;
    } else {
      infoLocation.textContent = parts[0];
      infoTitle.textContent = parts[1];
    }
    infoRuleset.textContent = '';
    summary.innerHTML = '';
  }
}

//------------------------------------------------------
//  Functions that run the content script and initiate
//  processing of the data it sends via messaging
//------------------------------------------------------

/*
*   Listen for message from content script
*/
browser.runtime.onMessage.addListener(
  function (message, sender) {
    switch (message.id) {
      case 'info':
        updateSidebar(message);
        break;
    }
  }
);

/*
*   Run the content script to initiate processing of the page structure info.
*   Upon completion, the content script sends the data packaged in an 'info'
*   message. When the onMessage handler receives the message, it calls the
*   updateSidebar function, passing to it the message containing the page
*   structure info.
*/
function runContentScript (callfunct) {
  vSummary.clear();
  vGroup.clear();

  getActiveTabFor(myWindowId).then(tab => {
    if (tab.url.indexOf('http:') === 0 || tab.url.indexOf('https:') === 0) {
      browser.tabs.executeScript({ code: `var infoAInspectorEvaluation = {};`});
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.view      = "${sidebarView}";` });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.groupType = "${sidebarGroupType}";` });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.groupId   = "${sidebarGroupId}";` });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.ruleId    = "${sidebarRuleId}";` });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.rulesetId = "${sidebarRulesetId}";` });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_evaluation.js' });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_rules.js' });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_rulesets.js' });
      browser.tabs.executeScript({ file: '../common.js' });
      browser.tabs.executeScript({ file: '../evaluate.js' });
      browser.tabs.executeScript({ file: '../content.js' })
      .then(() => {
        if (logInfo) console.log(`Content script invoked by ${callfunct}`)
      });
    }
    else {
      updateSidebar (protocolNotSupported);
    }
  })
};

/*
*   getActiveTabFor: expected argument is ID of window with focus. The module
*   variable myWindowId is updated by handleWindowFocusChanged event handler.
*/
function getActiveTabFor (windowId) {
  return new Promise (function (resolve, reject) {
    let promise = browser.tabs.query({ windowId: windowId, active: true });
    promise.then(
      tabs => { resolve(tabs[0]) },
      msg => { reject(new Error(`getActiveTabInWindow: ${msg}`)); }
    )
  });
}

/*
*   Add event listeners when sidebar loads
*/
window.addEventListener("load", function (e) {
  browser.tabs.onUpdated.addListener(handleTabUpdated, { properties: ["status"] });
  browser.tabs.onActivated.addListener(handleTabActivated);
  browser.windows.onFocusChanged.addListener(handleWindowFocusChanged);
});
