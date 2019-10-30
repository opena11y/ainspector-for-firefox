var sidebarOpen = false;
var previousSidebarOpen = false;

function toggleSidebar() {

  if (sidebarOpen) {
    browser.sidebarAction.close();
  }
  else {
    browser.sidebarAction.open();
  }

}

browser.browserAction.onClicked.addListener(toggleSidebar);

browser.contextMenus.create({
  id: "ainspector",
  title: browser.i18n.getMessage("extensionName"),
  contexts: ["all"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ainspector") {
    toggleSidebar();
  }
});


setInterval( function () {

  browser.sidebarAction.isOpen({}).then(result => {
    previousSidebarOpen = sidebarOpen;
    sidebarOpen = result;

    if (!sidebarOpen && (sidebarOpen !== previousSidebarOpen)) {
      removeHighlight();
    }
  });

}, 500);

var messageArgs = {};

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



