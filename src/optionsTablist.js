/* optionsTablist.js */

const debug = false;

class OptionsTablist {
  constructor () {

    // Initialize abbreviations and labels
    this.tabs      =  document.querySelectorAll('[role=tablist] [role=tab]');
    this.tabpanels =  [];

    this.firstTab = this.tabs[0];
    this.lastTab = this.tabs[this.tabs.length-1];

    // Event handlers

   for (let i = 0; i < this.tabs.length; i += 1) {
      const tab = this.tabs[i];
      let node = false;
      const id = tab.getAttribute('aria-controls');
      if (id) {
        node = document.getElementById(id);
        if (node) {
          debug && console.log(`[id found]: ${id} ${node}`);
        }
        else {
          debug && console.log(`[id not found]: ${id}`);
        }
      }
      else {
        debug && console.log(`[id]: none`);
      }
      this.tabpanels.push(node);

      tab.tabIndex = -1;
      tab.addEventListener('click', this.handleTabClick.bind(this));
      tab.addEventListener('keydown', this.handleTabKeydown.bind(this));
    }

    this.showTabpanel(this.firstTab);
  }

  get selectedTabIndex () {
    for (let i = 0; i < this.tabs.length; i += 1) {
      const tab = this.tabs[i];
      if (tab.getAttribute('aria-selected') === 'true') {
        return i;
      }
    }
    return 0;
  }

  focus () {
    if (this.selectedTabId === 'tabpanel-1') {
      this.tabDiv1.focus();
    } else {
      this.tabDiv2.focus();
    }
  }

  showTabpanel(showTab, focusFlag=true) {
    debug && console.log(`[showTabpanel]`);
    for (let i = 0; i < this.tabs.length; i += 1) {
      const tab = this.tabs[i];
      const tabpanel = this.tabpanels[i];

      debug && console.log(`[showTabpanel][${i}][${tab === showTab}]`);
      debug && console.log(`[showTabpanel][${i}][${tabpanel.id}]`);

      if (tab === showTab) {
        tabpanel.classList.remove('hide');
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = 0;
        if (focusFlag) {
          tab.focus();
        }
      }
      else {
        tabpanel.classList.add('hide');
        tab.removeAttribute('aria-selected');
        tab.tabIndex = -1;
      }
    }
  }

  // Event handlers

  handleTabClick(event) {
    const tgt = event.currentTarget;
    debug && console.log(`[handleTabClick]: ${tgt.id}`);
    this.showTabpanel(tgt, false);
    event.preventDefault();
    event.stopPropagation();
  }

  handleTabKeydown(event) {
    const tgt = event.currentTarget;
    let flag = false;
    let index = this.selectedTabIndex;

    switch(event.key) {
      case 'ArrowLeft':
        if (index > 0) {
          index = index - 1;
        }
        this.showTabpanel(this.tabs[index]);
        flag = true;
        break;

      case 'ArrowRight':
        if (index < (this.tabs.length - 1)) {
          index = index + 1;
        }
        this.showTabpanel(this.tabs[index]);
        flag = true;
        break;

      case 'Home':
        this.showTabpanel(this.firstTab);
        flag = true;
        break;

      case 'End':
        this.showTabpanel(this.lastTab);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

}

new OptionsTablist();
