/*
*   panel.js
*/

import { saveOptions } from '../storage.js';

var myWindowId;
var logInfo = true;
var listBox;

var sidebarView    = 'summary';  // other options 'group' or 'rule'
var sidebarGroup   = 'test group';
var sidebarRule    = 'test rule';
var sidebarRuleset = 'ARIA_STRICT';

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

/*
*   When the sidebar loads, store the ID of the current window and update
*   the sidebar content.
*/
browser.windows.getCurrent({ populate: true }).then( (windowInfo) => {
  myWindowId = windowInfo.id;
  addLabelsAndHelpContent();
  runContentScript('windows.getCurrent');
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
      runContentScript('onFocusChanged');
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
*   Display the content generated by the content script.
*/
function updateSidebar (info) {
  let infoLocation = document.querySelector('#info-location .value');
  let infoTitle    = document.querySelector('#info-title .value');
  let infoRuleset  = document.querySelector('#info-ruleset .value');

  let summary = document.getElementById('summary');

  // page-title and headings
  if (typeof info === 'object') {
    // Update the page-title box
    infoTitle.innerHTML = info.title;
    infoLocation.innerHTML = info.location;
    infoRuleset.innerHTML = info.infoSummary.ruleset;

    // Update the headings box
    if (info.infoSummary) {

      let html = `<h2>Summary</h2>`;
      html += `<div>${info.infoSummary.violations} ${info.infoSummary.warnings} ${info.infoSummary.manual_checks} ${info.infoSummary.passed}</div>`;

      html += `<h2>Rule Category</h2>`;
      for (let i = 0; i < info.infoSummary.rcResults.length; i += 1) {
        let r = info.infoSummary.rcResults[i];
        let groupLabel = getMessage(r.labelId);
        html += `<div>${r.id} ${groupLabel} ${r.violations} ${r.warnings} ${r.manual_checks} ${r.passed}  ${r.not_applicable}</div>`;
      }

      html += `<h2>Guidlines</h2>`;
      for (let i = 0; i < info.infoSummary.glResults.length; i += 1) {
        let r = info.infoSummary.glResults[i];
        let groupLabel = getMessage(r.labelId);
        html += `<div>${r.id} ${groupLabel} ${r.violations} ${r.warnings} ${r.manual_checks} ${r.passed}  ${r.not_applicable}</div>`;
      }

      summary.innerHTML = `<div class="grid-message">${html}</div>`;
    }
    else {
      summary.innerHTML = `<div class="grid-message">${noHeadingElements}</div>`;
    }
  }
  else {
    let parts = info.split(';');
    if (parts.length == 1) {
      infoTitle.textContent = info;
      infoLocation.textContent = '';
    } else {
      infoTitle.textContent = parts[0];
      infoLocation.textContent = parts[1];
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
function runContentScript (callerFn) {
  getActiveTabFor(myWindowId).then(tab => {
    if (tab.url.indexOf('http:') === 0 || tab.url.indexOf('https:') === 0) {
      browser.tabs.executeScript({ code: `var infoAInspectorEvaluation = {};`});
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.view     = "${sidebarView}";`  });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.group    = "${sidebarGroup}";` });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.rule     = "${sidebarRule}";`  });
      browser.tabs.executeScript({ code: `infoAInspectorEvaluation.ruleset  = "${sidebarRuleset}";`  });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_evaluation.js' });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_rules.js' });
      browser.tabs.executeScript({ file: '../scripts/oaa_a11y_rulesets.js' });
      browser.tabs.executeScript({ file: '../common.js' });
      browser.tabs.executeScript({ file: '../evaluate.js' });
      browser.tabs.executeScript({ file: '../content.js' })
      .then(() => {
        if (logInfo) console.log(`Content script invoked by ${callerFn}`)
      });
    }
    else {
      updateSidebar (protocolNotSupported);
    }
  })
}

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
