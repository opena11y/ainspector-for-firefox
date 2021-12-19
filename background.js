/*
*   background.js
*/

browser.browserAction.onClicked.addListener(function (evt) {
  browser.sidebarAction.toggle();
});

/*
* The following code checks to see if the sidebar has closed
* If it is closed it semds a message to the content script
* to remove any element highlighting.  It only needs to
* remove the highlighting once.
*/

var sidebarOpen = false;
var previousSidebarOpen = false;
var messageArgs = {};

setInterval( function () {
  browser.sidebarAction.isOpen({}).then(result => {
    previousSidebarOpen = sidebarOpen;
    sidebarOpen = result;

    // Only remove the highlighiting once
    if (!sidebarOpen && (sidebarOpen !== previousSidebarOpen)) {
      removeHighlight();
    }
  });
}, 500);

function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      messageArgs
    ).then(response => {}).catch(onError);
  }
};

function removeHighlight() {
  messageArgs.option    = 'highlight';
  messageArgs.highlight = 'none';

  browser.tabs.query({
      currentWindow: true,
      active: true
  }).then(sendMessageToTabs).catch(onError);
};

