function openSidebar() {
  browser.sidebarAction.open();
}



browser.browserAction.onClicked.addListener(openSidebar);
