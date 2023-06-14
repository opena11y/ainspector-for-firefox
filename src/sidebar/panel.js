/* panel.js  */

import { getOptions }        from '../storage.js';
import { getExportFileName } from './commonCSV.js';

// Classes for manipulating views
import ViewAllRules          from './viewAllRules/viewAllRules.js';
import ViewAllRulesTablist   from './viewAllRules/viewAllRulesTablist.js';

import ViewRuleGroup         from './viewRuleGroup/viewRuleGroup.js';

import ViewRuleResult        from './viewRuleResult/viewRuleResult.js';
import ViewRuleResultInfo    from './viewRuleResult/viewRuleResultInfo.js';

// Custom elements for views
import RuleResultSummary     from './viewComponents/ruleResultSummary.js';
import RuleGroupSummary      from './viewComponents/ruleGroupSummary.js';
import ResultGrid            from './viewComponents/resultGrid.js';
import ResultRuleInfo        from './viewComponents/resultRuleInfo.js';
import SummaryInfo           from './viewComponents/summaryInfo.js';


// Custom elements for controls
import CopyButton            from './panelComponents/copyButton.js';
import ExportButton          from './panelComponents/exportButton.js';
import HighlightSelect       from './panelComponents/highlightSelect.js';
import RerunEvaluationButton from './panelComponents/rerunEvaluationButton.js';
import ViewsMenuButton       from './panelComponents/viewsMenuButton.js';

customElements.define('all-rules-tablist',   ViewAllRulesTablist);
customElements.define('rule-result-summary', RuleResultSummary);
customElements.define('rule-group-summary',  RuleGroupSummary);
customElements.define('rule-result-info',    ViewRuleResultInfo);
customElements.define('result-grid',         ResultGrid);
customElements.define('result-rule-info',    ResultRuleInfo);
customElements.define('summary-info',        SummaryInfo);

customElements.define('copy-button',         CopyButton);
customElements.define('export-button',       ExportButton);
customElements.define('highlight-select',    HighlightSelect);
customElements.define('rerun-evaluation-button', RerunEvaluationButton);
customElements.define('views-menu-button',   ViewsMenuButton);

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  backButtonLabel        : getMessage('backButtonLabel'),
  ariaStrictRulesetLabel : getMessage("optionsRulesetStrictLabel"),
  ariaTransRulesetLabel  : getMessage("optionsRulesetTransLabel"),
  evaluationNotAllowed   : getMessage("evaluationNotAllowed"),
  guidelineLabel         : getMessage("guidelineLabel"),
  infoLocationLabel      : getMessage('infoLocationLabel'),
  infoRulesetLabel       : getMessage('infoRulesetLabel'),
  infoTitleLabel         : getMessage('infoTitleLabel'),
  preferencesButtonLabel : getMessage('preferencesButtonLabel'),
  protocolNotSupported   : getMessage("protocolNotSupported"),
  ruleCategoryLabel      : getMessage("ruleCategoryLabel"),
  ruleScopeLabel         : getMessage("ruleScopeLabel"),
  ruleLabel              : getMessage("ruleLabel"),
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
  allRules : 'all-rules',
  ruleGroup: 'rule-group',
  ruleResult: 'rule-result'
};

// Instantiate view classes with corresponding callbacks
var vAllRules   = new ViewAllRules(viewId.allRules, onAllRulesRowActivation);
var vRuleGroup  = new ViewRuleGroup(viewId.ruleGroup, onRuleGroupRowActivation);
var vRuleResult = new ViewRuleResult(viewId.ruleResult, onUpdateHighlight);

var sidebarView      = viewId.allRules;  // default view when sidebar loads
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

function onAllRulesRowActivation (id) {
  sidebarView      = viewId.ruleGroup;
  sidebarGroupType = id.substring(0,2);
  sidebarGroupId   = parseInt(id.substring(2));
  runContentScripts('onAllRulesRowActivation');
}

function onRuleGroupRowActivation (id) {
  sidebarView   = viewId.ruleResult;
  sidebarRuleId = id;
  runContentScripts('onRuleGroupRowActivation');
}

function onViewsMenuActivation(id) {
  if (id && id.length) {
    if (id === 'summary') {
      sidebarView = viewId.allRules;
    }

    if (id === 'all-rules') {
      sidebarView = viewId.ruleGroup;
      if (sidebarGroupType === 'gl') {
        sidebarGroupId = 0x01FFF0; // All rules id for guidelines
      } else {
        if (sidebarGroupType === 'rc') {
          sidebarGroupId = 0x0FFF;  // All rules id for rule categories
        } else {
          sidebarGroupId = 0x0007; // All rules id for rule scope
        }
      }
    }

    if (id.includes('rc') || id.includes('gl') || id.includes('sc')) {
      const groupType = id.substring(0, 2);
      const groupId = parseInt(id.substring(2));
      sidebarView = viewId.ruleGroup;
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
    case viewId.ruleGroup:
      vRuleGroup.copyButton.click();
      break;

    case viewId.ruleResult:
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
    case viewId.ruleGroup:
      sidebarView = viewId.allRules;
      break;

    case viewId.ruleResult:
      sidebarView = viewId.ruleGroup;
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

        case viewId.allRules:
          fname = options.filenameAllRules;
          csv = vAllRules.toCSV(options, pageTitle, pageLocation);
          break;

        case viewId.ruleGroup:
          fname = options.filenameRuleGroup;
          csv = vRuleGroup.toCSV(options, pageTitle, pageLocation, sidebarGroupId);
          break;

        case viewId.ruleResult:
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

        case viewId.allRules:
          fname = options.filenameAllRules;
          json = vAllRules.toJSON();
          break;

        case viewId.ruleGroup:
          fname = options.filenameRuleGroup;
          json = vRuleGroup.toJSON();
          break;

        case viewId.ruleResult:
          fname = options.filenameRuleResult;
          json = vRuleResult.toJSON();
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
let activeTabUrl;
function handleTabUpdated (tabId, changeInfo, tab) {
  // Skip content update when new page is loaded in background tab
  if (!tab.active) return;

  if (logInfo) {
    if (tab.url !== activeTabUrl) {
      activeTabUrl = tab.url;
      console.log(`handleTabUpdated: ${tab.url}`);
    }
    console.log(`changeInfo.status: ${changeInfo.status}`);
  }
  if (changeInfo.status === "complete") {
    runContentScripts('handleTabUpdated');
  }
  else {
    updateSidebar(msg.tabIsLoading);
  }
}

/*
**  Handle tabs.onActivated event
*/
function handleTabActivated (activeInfo) {
  if (logInfo) {
    async function logTabUrl(info) {
      try {
        let tab = await browser.tabs.get(info.tabId);
        console.log(`handleTabActivated: ${tab.url}`);
      }
      catch (error) {
        console.error(error);
      }
    }
    logTabUrl(activeInfo);
  }
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

  if (sidebarView === viewId.allRules) {
    backButton.disabled = true;
  } else {
    backButton.disabled = false;
  }
}

function disableButtons() {
  viewsMenuButton.disabled = true;
  exportButton.disabled = true;
  rerunEvaluationButton.disabled = true;
  vAllRules.disabled = true;

  updateBackButton();
}

function enableButtons() {
  viewsMenuButton.disabled = false;
  exportButton.disabled = false;
  rerunEvaluationButton.disabled = false;
  vAllRules.disabled = false;

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

    if (logInfo) console.log(`\n[updateSidebar][location        ]: ${info.location}`);
    if (logInfo) console.log(`[updateSidebar][infoAllRules      ]: ${info.infoAllRules}`);
    if (logInfo) console.log(`[updateSidebar][infoRuleGroup     ]: ${info.infoRuleGroup}`);
    if (logInfo) console.log(`[updateSidebar][infoRuleResul t   ]: ${info.infoRuleResult}`);
    if (logInfo) console.log(`[updateSidebar][infoHighlight     ]: ${info.infoHighlight}`);

    // Update the page information footer
    infoTitle.textContent    = info.title;
    infoTitle.title          = info.title;
    pageTitle = info.title;

    infoLocation.textContent = info.location;
    pageLocation = info.location;

    // Update the headings box
    if (typeof info.infoAllRules === 'object') {
      viewTitle.textContent = msg.viewTitleSummaryLabel;
      viewTitle.title = '';
      vAllRules.update(info.infoAllRules);
      enableButtons();
    }
    else {
      if (typeof info.infoRuleGroup === 'object') {
        if (info.infoRuleGroup.groupType === 'gl') {
          viewTitle.textContent = msg.guidelineLabel + ': ' + info.infoRuleGroup.groupLabel;
        }
        else {
          if (info.infoRuleGroup.groupType === 'rc') {
            viewTitle.textContent = msg.ruleCategoryLabel + ': ' + info.infoRuleGroup.groupLabel;
          }
          else {
            viewTitle.textContent = msg.ruleScopeLabel + ': ' + info.infoRuleGroup.groupLabel;
          }
        }
        viewTitle.title = '';
        vRuleGroup.update(info.infoRuleGroup, sidebarGroupId);
        enableButtons();
      }
      else {
        if (info.infoRuleResult) {
          viewTitle.textContent = msg.ruleLabel + ': ' + info.infoRuleResult.title;
          viewTitle.title = info.infoRuleResult.title;
          vRuleResult.update(info.infoRuleResult);
          enableButtons();
        }
        else {
          if (info.infoHighlight) {
            enableButtons();
          } else {
            vAllRules.clear();
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
      vAllRules.clear(info);
      vRuleGroup.clear(info);
      vRuleResult.clear(info);
    } else {
      if (parts.length == 2) {
        infoLocation.textContent = parts[0];
        infoTitle.textContent = parts[1];
        vAllRules.clear(parts[0], parts[1]);
        vRuleGroup.clear(parts[0], parts[1]);
        vRuleResult.clear(parts[0], parts[1]);
      } else {
        vAllRules.clear();
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

  console.log(`[runContentScripts]: ${callerfn}`);

  if (!sidebarHighlightOnly) {
    updateSidebar (msg.tabIsLoading);
    showView(sidebarView);
  }


  getOptions().then( (options) => {
    getActiveTabFor(myWindowId).then(tab => {

      let contentCode = '';
      contentCode += `var ainspectorSidebarRuleResult = ainspectorSidebarRuleResult || {};`;
      contentCode += `var infoAInspectorEvaluation = {`;
      contentCode += `  view: "${sidebarView}",`;
      contentCode += `  groupType: "${sidebarGroupType}",`;
      contentCode += `  ruleId: "${sidebarRuleId}",`;
      contentCode += `  rulesetId: "${options.rulesetId}",`;
      contentCode += `  highlight: "${options.highlight}",`;
      // note the following properties are number and boolean values
      contentCode += `  groupId: ${sidebarGroupId},`;
      contentCode += `  position: ${sidebarElementPosition},`;
      contentCode += `  highlightOnly: ${sidebarHighlightOnly}`;
      contentCode += `};`;

      if (tab.url.indexOf('http:') === 0 || tab.url.indexOf('https:') === 0) {
        browser.tabs.executeScript({ code: contentCode })
        .then(() => browser.tabs.executeScript({ file: '../ainspector-content-script.js' }))
        .then(() => {
          if (logInfo) console.log(`Content script invoked by ${callerfn}`);
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
  if (logInfo) {
    console.log(`Started downloading: ${id}`);
  }
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
