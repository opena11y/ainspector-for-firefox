function openSidebar() {
  browser.sidebarAction.open();
}

browser.browserAction.onClicked.addListener(openSidebar);

browser.contextMenus.create({
  id: "ainspector",
  title: browser.i18n.getMessage("extensionName"),
  contexts: ["all"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ainspector") {
    browser.sidebarAction.open();
  }
});

