"use strict";

function onError(error) {
  console.error(`Error: ${error}`);
}

var messageArgs = {
  promptForDelay: false,
  delay: 5,
  delayCount: 0,
  includeGuidelines: true,
  includePassAndNotApplicable: true,
  ruleset: 'ARIA_STRICT',
  option: 'summary',
  groupType: 'rc',
  groupId: 1,
  rule: '',
  position: -1,
  highlight: 'none',  // other options 'selected', 'v/w', 'mc' and 'all'
  position: 0       // position of element to highlight
};

// Setup storage

function getAInspectorPreferences(item) {
  var prefs = item.ainspectorPreferences;

  if (typeof prefs != 'undefined'){
    messageArgs = prefs;

    if ((messageArgs.option !== 'summary') &&
        (messageArgs.option !== 'group') &&
        (messageArgs.option !== 'rule')) {

      if (messageArgs.option === 'highlight') {
        messageArgs.option = 'group';
      }
      else {
        messageArgs.option = 'summary';
      }
    }
  }
  else {
    setAInspectorPreferences();
  }

};

function setAInspectorPreferences() {

  var ainspectorPreferences = messageArgs;

  browser.storage.local.set({ainspectorPreferences})

}


