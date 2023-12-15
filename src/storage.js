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
    'AUDIO_1',
    'AUDIO_2',
    'AUDIO_3',
    'BYPASS_1',
    'COLOR_1',
    'COLOR_2',
    'CONTROL_1',
    'CONTROL_2',
    'CONTROL_3',
    'CONTROL_10',
    'COOTROL_12',
    'HEADING_1',
    'IMAGE_1',
    'KEYBOARD_1',
    'KEYBOARD_2',
    'KEYBOARD_3',
    'LANDMARK_1',
    'LINK_1',
    'NAVIGATION_1',
    'TABLE_1',
    'TABLE_2',
    'TABLE_5',
    'TIMING_1',
    'VIDEO_1',
    'VIDEO_2',
    'VIDEO_3',
    'VIDEO_4,',
    'VIDEO_5,',
    'VIDEO_6,',
    'WIDGET_1',
    'WIDGET_3',
    'WIDGET_4',
    'WIDGET_5',
    'WIDGET_12'
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
