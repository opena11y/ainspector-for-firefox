/*
*   background.js
*/

browser.browserAction.onClicked.addListener(function (evt) {
  browser.sidebarAction.toggle();
});

/*
*  removeHighlight is called from panel.js when the 'unload'
*  event is dispatched (i.e., the sidebar is closed).
*/
function removeHighlight () {
  browser.tabs.query({ currentWindow: true, active: true })
  .then(sendMessageToTabs)
  .catch(onError);
}

function sendMessageToTabs (tabs) {
  let message = { option: 'highlight', highlight: 'none' };
  for (let tab of tabs) {
    browser.tabs.sendMessage(tab.id, message)
    .catch(onError);
  }
}

function onError (err) {
  console.error(`Error in background.js: ${err}`);
}
