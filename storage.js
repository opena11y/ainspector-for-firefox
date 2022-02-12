/*
*   storage.js
*/

const getMessage = browser.i18n.getMessage;

// Messages used in this file
const msg = {};
msg.shortcutDefaultBack   = getMessage('shortcutDefaultBack');
msg.shortcutDefaultViews  = getMessage('shortcutDefaultViews');
msg.shortcutDefaultExport = getMessage('shortcutDefaultExport');
msg.shortcutDefaultRerun  = getMessage('shortcutDefaultRerun');
msg.shortcutDefaultCopy   = getMessage('shortcutDefaultCopy');

export const defaultOptions = {
  isSidebarOpen: false,
  rulesetId: 'ARIA_STRICT',
  viewsMenuIncludeGuidelines: true,
  rerunDelayEnabled: false,
  resultsIncludePassNa: true,
  highlight: 'selected',
  // Properties for exporting reports
  projectTitle: '',
  evaluatorName: '',
  exportFormat: 'CSV',  // other option is JSON
  filenamePrefix: 'ainspector',
  filenameSummary: 'summary{date}{time}',
  filenameRuleGroup: 'rule-group-{group}{date}{time}',
  filenameRuleResult: 'rule-result-{rule}{date}{time}',
  includeDate: true,
  includeTime: true,
  promptForExportOptions: true,
  shortcutBack: msg.shortcutDefaultBack,
  shortcutViews: msg.shortcutDefaultViews,
  shortcutExport:msg.shortcutDefaultExport,
  shortcutRerun: msg.shortcutDefaultRerun,
  shortcutCopy: msg.shortcutDefaultCopy,
  shortcutsEnabled: false
};

/*
**  getOptions
*/
export function getOptions () {
  return new Promise (function (resolve, reject) {
    let promise = browser.storage.local.get();
    promise.then(
      options => {
        if (isComplete(options)) {
          resolve(options);
        }
        else {
          const optionsWithDefaults = addDefaultValues(options);
          saveOptions(optionsWithDefaults);
          resolve(optionsWithDefaults);
        }
      },
      message => { reject(new Error(`getOptions: ${message}`)) }
    );
  });
}

/*
**  saveOptions
*/
export function saveOptions (options) {
  return new Promise (function (resolve, reject) {
    let promise = browser.storage.local.set(options);
    promise.then(
      () => { resolve() },
      message => { reject(new Error(`saveOptions: ${message}`)) }
    );
  });
}

/*
*   Helper functions
*/
function hasAllProperties (refObj, srcObj) {
  for (const key of Object.keys(refObj)) {
    if (!srcObj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function isComplete (obj) {
  const numOptions = Object.keys(defaultOptions).length;
  if (Object.keys(obj).length !== numOptions) {
    return false;
  }
  return hasAllProperties(defaultOptions, obj);
}

function addDefaultValues (options) {
  const copy = Object.assign({}, defaultOptions);
  for (let [key, value] of Object.entries(options)) {
    if (copy.hasOwnProperty(key)) {
      copy[key] = value;
    }
  }
  return copy;
}
