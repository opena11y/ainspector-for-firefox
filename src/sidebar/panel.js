/* panel.js  */

import { getOptions }        from '../storage.js';
import { getExportFileName } from './commonCSV.js';

// Classes for manipulating views
import ViewSummary           from './viewSummary.js';
import ViewRuleResults       from './viewRuleResults.js';
import ViewElementResults    from './viewElementResults.js';

// Custom elements for views
import RuleSummary           from './ruleSummary.js';
import ResultTablist         from './resultTablist.js';
import ResultGrid            from './resultGrid.js';
import ElementSummary        from './elementSummary.js';
import ResultElementInfo     from './resultElementInfo.js';
import ResultRuleInfo        from './resultRuleInfo.js';

// Custom elements for controls
import HighlightSelect       from './highlightSelect.js';
import ViewsMenuButton       from './viewsMenuButton.js';
import RerunEvaluationButton from './rerunEvaluationButton.js';
import ExportButton          from './exportButton.js';
import CopyButton            from './copyButton.js';

customElements.define('rule-summary',        RuleSummary);
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
  evaluationNotAllowed   : getMessage("evaluationNotAllowed"),
  infoLocationLabel      : getMessage('infoLocationLabel'),
  infoRulesetLabel       : getMessage('infoRulesetLabel'),
  infoTitleLabel         : getMessage('infoTitleLabel'),
  preferencesButtonLabel : getMessage('preferencesButtonLabel'),
  protocolNotSupported   : getMessage("protocolNotSupported"),
  tabIsLoading           : getMessage("tabIsLoading"),
  viewTitleSummaryLabel  : getMessage('viewTitleSummaryLabel')
};

// Initialize custom elements
var viewsMenuButton = document.querySelector('views-menu-button');
viewsMenuButton.setActivationCallback(onViewsMenuActivation);

var exportButton = document.querySelector('export-button');
exportButton.setActivationCallback(onExportClick);

var rerunEvaluationButton = document.querySelector('rerun-evaluation-button');
rerunEvaluationButton.setActivationCallback(onRerunEvaluation);

// Initialize HTML buttons
var backButton = document.getElementById('back-button');
backButton.addEventListener('click', onBackButton);

var preferencesButton = document.getElementById('preferences-button');
preferencesButton.addEventListener('click', onPreferencesClick);

var contentPort;
var myWindowId;
var logInfo = false;
var debug = false;

// The viewId object is used to both identify a view and
// the ID of the associated DIV element that contains the rendered
// content of the view
const viewId = {
  summary : 'summary',
  ruleResults: 'rule-results',
  elementResults: 'element-results'
};

// Instantiate view classes with corresponding callbacks
var vSummary = new ViewSummary(viewId.summary, onSummaryRowActivation);
var vRuleResults = new ViewRuleResults(viewId.ruleResults, onRuleResultsRowActivation);
var vElementResults = new ViewElementResults(viewId.elementResults, onUpdateHighlight);

var sidebarView      = viewId.summary;  // default view when sidebar loads
var sidebarGroupType = 'rc';  // options 'rc' or 'gl'
var sidebarGroupId   = 1;  // numberical value
var sidebarRuleId    = '';
var sidebarElementPosition = 0;
var sidebarHighlightOnly   = false;

var pageTitle = '';
var pageLocation = '';

function addSidebarLabels () {
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

function onSummaryRowActivation (id) {
  sidebarView      = viewId.ruleResults;
  sidebarGroupType = id.substring(0,2);
  sidebarGroupId   = parseInt(id.substring(2));
  runContentScripts('onSummaryRowActivation');
}

function onRuleResultsRowActivation (id) {
  sidebarView   = viewId.elementResults;
  sidebarRuleId = id;
  runContentScripts('onRuleResultsRowActivation');
}

function onViewsMenuActivation(id) {
  if (id && id.length) {
    if (id === 'summary') {
      sidebarView = viewId.summary;
    }

    if (id === 'all-rules') {
      sidebarView = viewId.ruleResults;
      if (sidebarGroupType === 'rc') {
        sidebarGroupId = 0x0FFF;  // All rules id for rule categories
      } else {
        sidebarGroupId = 0x01FFF0; // All rules id for guidelines
      }
    }

    if (id.indexOf('rc') >= 0 || id.indexOf('gl') >= 0) {
      const groupType = id.substring(0, 2);
      const groupId = parseInt(id.substring(2));
      sidebarView = viewId.ruleResults;
      sidebarGroupType = groupType;
      sidebarGroupId   = groupId;
    }
    runContentScripts('onViewsMenuActivation');
  }
}

function onRerunEvaluation() {
  runContentScripts('onRerunEvaluation');
}

function onUpdateHighlight(position) {
  sidebarHighlightOnly = true;
  sidebarElementPosition = position;
  runContentScripts('onUpdateHighlight');
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
*   When the sidebar loads:
*   1. Store the ID of the current window
*   2. Initialize sidebar labels
*   3. Add event listeners for 'resize' and 'keydown'
*   4. Call showView with default value
*   5. Run content scripts to establish connection and populate views
*/
browser.windows.getCurrent({ populate: true }).then( (windowInfo) => {
  myWindowId = windowInfo.id;
  addSidebarLabels();
  window.addEventListener('resize', resizeView);
  document.body.addEventListener('keydown', onShortcutsKeydown);
  showView(sidebarView);
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
    case viewId.ruleResults:
      vRuleResults.copyButton.click();
      break;

    case viewId.elementResults:
      vElementResults.elemCopyButton.click();
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
    case viewId.ruleResults:
      sidebarView = viewId.summary;
      break;

    case viewId.elementResults:
      sidebarView = viewId.ruleResults;
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

        case viewId.summary:
          fname = options.filenameSummary;
          csv = vSummary.toCSV(options, pageTitle, pageLocation);
          break;

        case viewId.ruleResults:
          fname = options.filenameRuleResults;
          csv = vRuleResults.toCSV(options, pageTitle, pageLocation, sidebarGroupId);
          break;

        case viewId.elementResults:
          fname = options.filenameElementResults;
          csv = vElementResults.toCSV(options, pageTitle, pageLocation);
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

        case viewId.summary:
          fname = options.filenameSummary;
          json = vSummary.toJSON();
          break;

        case viewId.ruleResults:
          fname = options.filenameRuleResults;
          json = vRuleResults.toJSON();
          break;

        case viewId.elementResults:
          fname = options.filenameElementResults;
          json = vElementResults.toJSON();
          break;

        default:
          break;
      }
      if (fname && json) {
        fname = getExportFileName(fname, options, sidebarGroupType, sidebarGroupId, sidebarRuleId);
        download(fname, json);
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
  // Get an array of DIV elements that contain view
  const viewContainers = document.querySelectorAll('main .view');

  for (const view of viewContainers) {
    if (view.id === id) {
      view.classList.add('show');
    } else {
      view.classList.remove('show');
    }
  }
  resizeView();
}

function updateBackButton () {

  if (sidebarView === viewId.summary) {
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
      if (typeof info.infoRuleResults === 'object') {
        viewTitle.textContent = info.infoRuleResults.groupLabel;
        viewTitle.title = '';
        vRuleResults.update(info.infoRuleResults, sidebarGroupId);
        enableButtons();
      }
      else {
        if (info.infoElementResults) {
          viewTitle.textContent = info.infoElementResults.title;
          viewTitle.title = info.infoElementResults.title;
          vElementResults.update(info.infoElementResults);
          enableButtons();
        }
        else {
          if (info.infoHighlight) {
            enableButtons();
          } else {
            vSummary.clear();
            vRuleResults.clear();
            vElementResults.clear();
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
      vRuleResults.clear(info);
      vElementResults.clear(info);
    } else {
      if (parts.length == 2) {
        infoLocation.textContent = parts[0];
        infoTitle.textContent = parts[1];
        vSummary.clear(parts[0], parts[1]);
        vRuleResults.clear(parts[0], parts[1]);
        vElementResults.clear(parts[0], parts[1]);
      } else {
        vSummary.clear();
        vRuleResults.clear();
        vElementResults.clear();
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
        browser.tabs.executeScript({ file: '../content-script.js' })
        .then(() => {
          if (logInfo) console.log(`Content script invoked by ${callerfn}`)
        },
        (error) => {
          updateSidebar(msg.evaluationNotAllowed);
        });
      }
      else {
        updateSidebar(msg.protocolNotSupported);
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
window.addEventListener('load', function (e) {
  browser.tabs.onUpdated.addListener(handleTabUpdated, { properties: ["status"] });
  browser.tabs.onActivated.addListener(handleTabActivated);
  browser.windows.onFocusChanged.addListener(handleWindowFocusChanged);
  resizeView();
});

window.addEventListener('unload', function (e) {
  let page = browser.extension.getBackgroundPage();
  page.removeHighlight();
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
