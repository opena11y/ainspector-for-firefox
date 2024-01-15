/*
*   storage.js
*/


// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;

export const defaultOptions = {
  isSidebarOpen: false,
  viewsMenuIncludeGuidelines: true,
  ruleset: 'WCAG21',
  level : 'AA',
  scopeFilter: 'ALL',
  firstStepRules: [
    'AUDIO_1',      // Level A
    'BYPASS_1',     // Level A
    'COLOR_1',      // Level A
    'COLOR_2',      // Level AA
    'CONTROL_1',    // Level A
    'CONTROL_2',    // Level A
    'CONTROL_3',    // Level A
    'CONTROL_10',   // Level AA
    'CONTROL_12',   // Level A
    'HEADING_1',    // Level A
    'IMAGE_1',      // Level A
    'KEYBOARD_1',   // Level A
    'KEYBOARD_2',   // Level A
    'KEYBOARD_3',   // Level A
    'LANDMARK_1',   // Level A
    'LINK_1',       // Level A
    'NAVIGATION_1', // Level AA
    'TABLE_1',      // Level A
    'TABLE_2',      // Level AA
    'TABLE_5',      // Level A
    'TIMING_1',     // Level A
    'VIDEO_2',      // Level A
    'WIDGET_1',     // Level A
    'WIDGET_3',     // Level A
    'WIDGET_4',     // Level A
    'WIDGET_5',     // Level A
    'WIDGET_12'     // Level AA
  ],
  rerunDelayEnabled: true,
  rerunDelayValue: '5',
  resultsIncludePassNa: true,
  highlight: 'selected',
  // Properties for exporting reports
  projectTitle: '',
  evaluatorName: '',
  exportFormat: 'CSV',  // other option is JSON
  filenamePrefix: 'ainspector',
  filenameAllRules: 'all-rules{date}{time}',
  filenameRuleGroup: 'rule-group-{group}{date}{time}',
  filenameRuleResult: 'rule-result-{rule}{date}{time}',
  includeDate: true,
  includeTime: true,
  promptForExportOptions: true,
  shortcutBack:  getMessage('shortcutDefaultBack'),
  shortcutViews: getMessage('shortcutDefaultViews'),
  shortcutExport:getMessage('shortcutDefaultExport'),
  shortcutRerun: getMessage('shortcutDefaultRerun'),
  shortcutCopy:  getMessage('shortcutDefaultCopy'),
  shortcutsEnabled: false,
  documentationURL: 'https://opena11y.github.io/evaluation-library/concepts.html'
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
**  setScopeFilterToAll
*/
export function setScopeFilterToAll (options) {
  return new Promise (function (resolve, reject) {
    options.scopeFilter = 'ALL';
    () => { resolve(options); },
    message => { reject(new Error(`resetScopeFilterToAll: ${message}`)) }
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
