/* panel.js  */

import { getOptions } from '../storage.js';
import { getExportFileName } from './commonCSV.js';

import ViewSummary     from './viewSummary.js';
import ViewRuleGroup   from './viewRuleGroup.js';
import ViewRuleResult  from './viewRuleResult.js';

import ResultSummary     from './resultSummary.js';
import ResultTablist     from './resultTablist.js';
import ResultGrid        from './resultGrid.js';
import ElementSummary    from './elementSummary.js';
import ResultElementInfo from './resultElementInfo.js';
import ResultRuleInfo    from './resultRuleInfo.js';

import HighlightSelect       from './highlightSelect.js';
import ViewsMenuButton       from './viewsMenuButton.js';
import RerunEvaluationButton from './rerunEvaluationButton.js';
import ExportButton          from './exportButton.js';
import CopyButton            from './copyButton.js';

customElements.define('result-summary',      ResultSummary);
customElements.define('result-tablist',      ResultTablist);
customElements.define('result-grid',         ResultGrid);
customElements.define('element-summary',     ElementSummary);
customElements.define('result-element-info', ResultElementInfo);
customElements.define('result-rule-info',    ResultRuleInfo);
customElements.define('highlight-select',    HighlightSelect);
customElements.define('views-menu-button',   ViewsMenuButton);
customElements.define('rerun-evaluation-button', RerunEvaluationButton);
customElements.define('export-button',       ExportButton);
customElements.define('copy-button',         CopyButton);

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  backButtonLabel        : getMessage('backButtonLabel'),
  ariaStrictRulesetLabel : getMessage("optionsRulesetStrictLabel"),
  ariaTransRulesetLabel  : getMessage("optionsRulesetTransLabel"),
  infoLocationLabel      : getMessage('infoLocationLabel'),
  infoRulesetLabel       : getMessage('infoRulesetLabel'),
  infoTitleLabel         : getMessage('infoTitleLabel'),
  preferencesButtonLabel : getMessage('preferencesButtonLabel'),
  protocolNotSupported   : getMessage("protocolNotSupported"),
  tabIsLoading           : getMessage("tabIsLoading"),
  viewTitleSummaryLabel  : getMessage('viewTitleSummaryLabel')
};

var contentPort;
var myWindowId;
var logInfo = false;
var debug = false;

var vSummary;
var vRuleGroup;
var vRuleResult;
var views;

var sidebarViews;  // Array of elements containing the sidebar views
var sidebarView      = 'summary';  // other options 'group' or 'rule'
var sidebarGroupType = 'rc';  // options 'rc' or 'gl'
var sidebarGroupId   = 1;  // numberical value
var sidebarRuleId    = '';
var sidebarElementPosition = 0;
var sidebarHighlightOnly   = false;

var pageTitle = '';
var pageLocation = '';

var backButton;
var viewsMenuButton;
var preferencesButton;
var exportButton;
var rerunEvaluationButton;

function addLabelsAndHelpContent () {
  let elem;
  // Header titles and labels
  elem = document.getElementById('view-title');
  elem.textContent = msg.viewTitleSummaryLabel;

  elem = document.getElementById('back-button');
  elem.textContent = msg.backButtonLabel;

  // Footer titles and labels
  elem = document.querySelector('#info-location .label')
  elem.textContent = msg.infoLocationLabel;

  elem = document.querySelector('#info-title .label');
  elem.textContent = msg.infoTitleLabel;

  elem = document.getElementById('preferences-button');
  elem.textContent = msg.preferencesButtonLabel;
}

// Callback functions used by views for activation or selection of rows

function callbackSummaryRowActivation (id) {
  sidebarView      = 'rule-group';
  sidebarGroupType = id.substring(0,2);
  sidebarGroupId   = parseInt(id.substring(2));
  runContentScripts('handleSummaryRowClick');
}

function callbackRuleGroupRowActivation (id) {
  sidebarView   = 'rule-result';
  sidebarRuleId = id;
  runContentScripts('callbackSummaryRowActivation');
}

function callbackViewsMenuActivation(id) {
  if (id && id.length) {
    if (id === 'summary') {
      sidebarView = 'summary';
    }

    if (id === 'all-rules') {
      sidebarView = 'rule-group';
      if (sidebarGroupType === 'rc') {
        sidebarGroupId = 0x0FFF;  // All rules id for rule categories
      } else {
        sidebarGroupId = 0x01FFF0; // All rules id for guidelines
      }
    }

    if (id.indexOf('rc') >= 0 || id.indexOf('gl') >= 0) {
      const groupType = id.substring(0, 2);
      const groupId = parseInt(id.substring(2));
      sidebarView = 'rule-group';
      sidebarGroupType = groupType;
      sidebarGroupId   = groupId;
    }
    runContentScripts('callbackViewsMenuActivation');
  }
}

function callbackRerunEvaluation() {
  runContentScripts('callbackRerunEvaluation');
}

function callbackUpdateHighlight(position) {
  sidebarHighlightOnly = true;
  sidebarElementPosition = position;
  runContentScripts('callbackUpdateHighlight');
}

/*
** Initilize controls and views on the page
*/
function initControls () {

  window.addEventListener('resize', resizeView);

  document.body.addEventListener('keydown', onShortcutsKeydown);

  backButton = document.getElementById('back-button');
  backButton.addEventListener('click', onBackButton);

  viewsMenuButton = document.querySelector('views-menu-button');
  viewsMenuButton.setActivationCallback(callbackViewsMenuActivation);

  preferencesButton = document.getElementById('preferences-button');
  preferencesButton.addEventListener('click', onPreferencesClick);

  exportButton = document.querySelector('export-button');
  exportButton.setActivationCallback(onExportClick);

  rerunEvaluationButton = document.querySelector('rerun-evaluation-button');
  rerunEvaluationButton.setActivationCallback(callbackRerunEvaluation);

  vSummary    = new ViewSummary('summary', callbackSummaryRowActivation);
  vRuleGroup  = new ViewRuleGroup('rule-group', callbackRuleGroupRowActivation);
  vRuleResult = new ViewRuleResult('rule-result', callbackUpdateHighlight);

  sidebarViews = document.querySelectorAll('main .view');
  showView(sidebarView);
}

/*
**  Set up listeners/handlers for connection and messages from content script
*/
browser.runtime.onConnect.addListener(connectionHandler);

function connectionHandler (port) {
  if (debug) console.log(`port.name: ${port.name}`);
  contentPort = port;
  contentPort.onMessage.addListener(portMessageHandler);
  contentPort.postMessage({ id: 'getInfo' });
}

function portMessageHandler (message) {
  switch (message.id) {
    case 'info':
      updateSidebar(message);
      break;
  }
}

/*
*   When the sidebar loads, store the ID of the current window; update sidebar
*   labels and help content, and run content scripts to establish connection.
*/
browser.windows.getCurrent({ populate: true }).then( (windowInfo) => {
  myWindowId = windowInfo.id;
  addLabelsAndHelpContent();
  initControls();
  runContentScripts('windows.getCurrent');
});

//--------------------------------------------------------------
//  Functions that handle menu, preferences and re-run evaluation
//  button actions
//--------------------------------------------------------------

/*
**  Generic error handler
*/
function onError (error) {
  console.log(`Error: ${error}`);
}

function shortcutCopy () {
  switch (sidebarView) {
    case 'rule-group':
      vRuleGroup.copyButton.click();
      break;

    case 'rule-result':
      vRuleResult.elemCopyButton.click();
      break;

    default:
      break;
  }
}


function onShortcutsKeydown (event) {
  let flag = false;

  if (!event.metaKey &&
      !event.ctrlKey &&
      !exportButton.isOpen() &&
      !rerunEvaluationButton.isOpen() &&
      !viewsMenuButton.isOpen()) {
    getOptions().then( (options) => {


      if (options.shortcutsEnabled) {

        if (event.key === options.shortcutBack) {
          if (!backButton.disabled) {
            onBackButton();
          }
          flag = true;
        }

        if (event.key === options.shortcutCopy) {
          shortcutCopy();
          flag = true;
        }

        if (event.key === options.shortcutExport) {
          if (!exportButton.disabled) {
            exportButton.onExportButtonClick();
          }
          flag = true;
        }

        if (event.key === options.shortcutRerun) {
          if (!rerunEvaluationButton.disabled) {
            rerunEvaluationButton.onRerunButtonClick();
          }
          flag = true;
        }

        if (event.key === options.shortcutViews) {
          if (!viewsMenuButton.disabled) {
            viewsMenuButton.onButtonClick(event);
          }
          flag = true;
        }

        if (flag) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

    });
  }
}

function onBackButton() {

  switch (sidebarView) {
    case 'rule-group':
      sidebarView = 'summary';
      break;

    case 'rule-result':
      sidebarView = 'rule-group';
      break;

    default:
      break;
  }
  runContentScripts('onBackButton');
}

function onPreferencesClick (event) {
   chrome.runtime.openOptionsPage();
}

function onExportClick () {
  let fname = '', csv = '', json = '';

  getOptions().then( (options) => {

    if (options.exportFormat === 'CSV') {
      switch (sidebarView) {

        case 'summary':
          fname = options.filenameSummary;
          csv = vSummary.toCSV(options, pageTitle, pageLocation);
          break;

        case 'rule-group':
          fname = options.filenameRuleGroup;
          csv = vRuleGroup.toCSV(options, pageTitle, pageLocation);
          break;

        case 'rule-result':
          fname = options.filenameRuleResult;
          csv = vRuleResult.toCSV(options, pageTitle, pageLocation);
          break;

        default:
          break;
      }
      if (fname && csv) {
        fname = getExportFileName(fname, options, sidebarGroupType, sidebarGroupId, sidebarRuleId);
        download(fname, csv);
      }
    } else {

      switch (sidebarView) {

        case 'summary':
          fname = getExportFileName(options.filenameSummary, options);
          json = vSummary.toJSON();
          break;

        case 'rule-group':
          fname = getExportFileName(options.filenameRuleGroup, options);
          json = vRuleGroup.toJSON();
          break;

        case 'rule-result':
          fname = getExportFileName(options.filenameRuleResult, options);
          json = vRuleResult.toJSON();
          break;

        default:
          break;
      }
      if (fname && json) {
        download(fname, json, 'JSON');
      } else {
        alert('JSON is not available for this view.')
      }
    }
  });
}


//-----------------------------------------------
//  Functions that handle tab and window events
//-----------------------------------------------

/*
**  Handle tabs.onUpdated event when status is 'complete'
*/
let timeoutID;
function handleTabUpdated (tabId, changeInfo, tab) {
  // Skip content update when new page is loaded in background tab
  if (!tab.active) return;

  clearTimeout(timeoutID);
  if (changeInfo.status === "complete") {
    runContentScripts('handleTabUpdated');
  }
  else {
    timeoutID = setTimeout(function () {
      updateSidebar(msg.tabIsLoading);
    }, 250);
  }
}

/*
**  Handle tabs.onActivated event
*/
function handleTabActivated (activeInfo) {
  if (logInfo) console.log(activeInfo);
  runContentScripts('handleTabActivated');
}

/*
**  Handle window focus change events: If the sidebar is open in the newly
**  focused window, save the new window ID and update the sidebar content.
*/
function handleWindowFocusChanged (windowId) {
  if (windowId !== myWindowId) {
    let checkingOpenStatus = browser.sidebarAction.isOpen({ windowId });
    checkingOpenStatus.then(onGotStatus, onInvalidId);
  }

  function onGotStatus (result) {
    if (result) {
      myWindowId = windowId;
      runContentScripts('onGotFocus');
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
**  Show and hide sidebar views
*/

function showView (id) {
  for (let i = 0; i < sidebarViews.length; i++) {
    let view = sidebarViews[i];
    if (view.id === id) {
      view.classList.add('show');
    } else {
      view.classList.remove('show');
    }
  }
  resizeView();
}

function updateBackButton () {

  if (sidebarView === 'summary') {
    backButton.disabled = true;
  } else {
    backButton.disabled = false;
  }
}

function disableButtons() {
  viewsMenuButton.disabled = true;
  exportButton.disabled = true;
  rerunEvaluationButton.disabled = true;
  vSummary.disabled = true;

  updateBackButton();
}

function enableButtons() {
  viewsMenuButton.disabled = false;
  exportButton.disabled = false;
  rerunEvaluationButton.disabled = false;
  vSummary.disabled = false;

  updateBackButton();
}

/*
**  Resize sidebar components
*/

function resizeView () {
  const minContainerHeight = 650;
  const containerDiv = document.querySelector('#container');
  containerDiv.style.height = Math.max(minContainerHeight, window.innerHeight) + 'px';
}

/*
**  Display the content generated by the content script.
*/
function updateSidebar (info) {
  let viewTitle    = document.querySelector('#view-title');
  let infoLocation = document.querySelector('#info-location .value');
  let infoTitle    = document.querySelector('#info-title .value');

  // page-title and headings
  if (typeof info === 'object') {

    // Update the page information footer
    infoTitle.textContent    = info.title;
    infoTitle.title          = info.title;
    pageTitle = info.title;

    infoLocation.textContent = info.location;
    pageLocation = info.location;

    // Update the headings box
    if (typeof info.infoSummary === 'object') {
      viewTitle.textContent = msg.viewTitleSummaryLabel;
        viewTitle.title = '';
      vSummary.update(info.infoSummary);
      enableButtons();
    }
    else {
      if (typeof info.infoRuleGroup === 'object') {
        viewTitle.textContent = info.infoRuleGroup.groupLabel;
        viewTitle.title = '';
        vRuleGroup.update(info.infoRuleGroup);
        enableButtons();
      }
      else {
        if (info.infoRuleResult) {
          viewTitle.textContent = info.infoRuleResult.title;
          viewTitle.title = info.infoRuleResult.title;
          vRuleResult.update(info.infoRuleResult);
          enableButtons();
        }
        else {
          if (info.infoHighlight) {
            enableButtons();
          } else {
            vSummary.clear();
            vRuleGroup.clear();
            vRuleResult.clear();
            disableButtons();
          }
        }
      }
    }
  }
  else {
    let parts = info.split(';');
    if (parts.length == 1) {
      infoLocation.textContent = '';
      infoTitle.textContent = info;
      vSummary.clear(info);
      vRuleGroup.clear(info);
      vRuleResult.clear(info);
    } else {
      if (parts.length == 2) {
        infoLocation.textContent = parts[0];
        infoTitle.textContent = parts[1];
        vSummary.clear(parts[0], parts[1]);
        vRuleGroup.clear(parts[0], parts[1]);
        vRuleResult.clear(parts[0], parts[1]);
      } else {
        vSummary.clear();
        vRuleGroup.clear();
        vRuleResult.clear();
      }
    }
    disableButtons();
  }
}

//------------------------------------------------------
//  Functions that run the content scripts to initiate
//  processing of the data to be sent via port message
//------------------------------------------------------

/*
*   runContentScripts: When content.js is executed, it established a port
*   connection with this script (panel.js), which in turn has a port message
*   handler listening for the 'info' message. When that message is received,
*   the handler calls the updateSidebar function with the structure info.
*/
function runContentScripts (callerfn) {
  if (!sidebarHighlightOnly) {
    updateSidebar (msg.tabIsLoading);
    showView(sidebarView);
  }

  getOptions().then( (options) => {
    getActiveTabFor(myWindowId).then(tab => {
      if (tab.url.indexOf('http:') === 0 || tab.url.indexOf('https:') === 0) {
        browser.tabs.executeScript({ code: `var infoAInspectorEvaluation = {};`});
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.view      = "${sidebarView}";` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.groupType = "${sidebarGroupType}";` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.ruleId          = "${sidebarRuleId}";` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.rulesetId       = "${options.rulesetId}";` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.highlight       = "${options.highlight}";` });
        // note the following properties are number and boolean values
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.groupId         = ${sidebarGroupId};` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.position        = ${sidebarElementPosition};` });
        browser.tabs.executeScript({ code: `infoAInspectorEvaluation.highlightOnly   = ${sidebarHighlightOnly};` });
        browser.tabs.executeScript({ file: '../content-scripts/a11y-content.js' })
        .then(() => {
          if (logInfo) console.log(`Content script invoked by ${callerfn}`)
        });
      }
      else {
        updateSidebar (msg.protocolNotSupported);
      }
      sidebarHighlightOnly= false;
    })
  });

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
window.addEventListener ("load", function (e) {
  browser.tabs.onUpdated.addListener(handleTabUpdated, { properties: ["status"] });
  browser.tabs.onActivated.addListener(handleTabActivated);
  browser.windows.onFocusChanged.addListener(handleWindowFocusChanged);
  resizeView();
});

/*
**  Export report download function
*/


function onStartedDownload(id) {
//  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function download(filename, content, format) {
  let blob;

  if (typeof format !== 'string') {
    format = 'CSV';
  }

  if (format === 'CSV') {
    blob = new Blob([content], {
     type: "text/plain;charset=utf-8"
    });
  } else {
    blob = new Blob([content], {
     type: "application/json"
    });
  }

  let downloading = browser.downloads.download({
    url : URL.createObjectURL(blob),
    filename : filename,
    saveAs: true,
    conflictAction : 'uniquify'
  });
  downloading.then(onStartedDownload, onFailed);

}

