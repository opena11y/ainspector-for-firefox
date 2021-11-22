/*
*   background.js
*/

browser.browserAction.onClicked.addListener(function (evt) {
  browser.sidebarAction.toggle();
});
