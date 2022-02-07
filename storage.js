/*
*   storage.js
*/

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
  shortcutBack: 'b',
  shortcutViews: 'v',
  shortcutExport: 'e',
  shortcutRerun: 'r',
  shortcutDetails: 'd',
  shortcutGrid: 'g',
  shortcutInfo: 'i',
  shortcutTabs: 't',
  shortcutCopy: 'c',
  shortcutPreferences: 'p',
  shortcutAllowAlt: false,
  shortcutRequireCtrl: false,
  shortcutRequireShift: false,
  shortcutsDisabled: false
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
