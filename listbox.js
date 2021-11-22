/*
*   ListBox: Class that encapsulates the state and behavior of a listbox
*   container with 'option' role elements. Provides keyboard support as
*   recommended by ARIA Authoring Practices.
*
*   Desired behavior:
*   1. Handle focus of the listbox container
*   2. Handle up-arrow, down-arrow, left-arrow, right-arrow, home, end,
*      page-up and page-down key presses to move selection among options.
*   3. Handle mouse click for selecting an option.
*   4. Handle return and space key presses to initiate the desired action
*      associated with the selected option.
*
*   Functionality/methods:
*   1. Initialize the DOM elements (the container and its children) with the
*      proper ARIA roles.
*   2. Create and assign necessary event handlers for the ListBox container.
*   3. Maintain state information needed for the event handlers and set or
*      remove ARIA attributes such as aria-activedescendant and aria-selected
*      to reflect the listbox state.
*/

export default class ListBox {
  constructor (domNode, notifyFn) {
    this.container      = domNode;
    this.notifyFn       = notifyFn;

    this.optionsList    = [];
    this.selectedOption = null;
    this.firstOption    = null;
    this.lastOption     = null;
    this.increment      = 6;

    this.validate();
    this.init();
  }

  validate () {
    let listBox = this.container;

    function listBoxIsDomElement () {
      let msg = "The ListBox is not a DOM Element";
      if (!listBox instanceof Element) {
        throw new TypeError(msg);
      }
    }

    function listBoxHasChildElements () {
      let msg = "The ListBox has no child elements.";
      if (listBox.childElementCount === 0) {
        throw new Error(msg)
      }
    }

    listBoxIsDomElement();
    listBoxHasChildElements();
  }

  init () {
    // Set ARIA attributes
    this.container.setAttribute('role', 'listbox');
    this.container.setAttribute('aria-activedescendant', '');

    // Configure each option and store it in optionsList array
    let children = this.container.children;

    for (let i = 0; i < children.length; i++) {
      let option = children[i];
      this.configure(option, i);
      this.optionsList.push(option);
    }

    // Use optionsList to set firstOption and lastOption
    let length = this.optionsList.length;
    this.firstOption = this.optionsList[0];
    this.lastOption  = this.optionsList[length - 1];

    this.assignEventHandlers();
  }

  configure (option, i) {
    let prefix = 'opt-';

    // Set ARIA role and id
    option.setAttribute('role', 'option');
    option.setAttribute('id', prefix + i);
  }

  assignEventHandlers () {
    let listBox = this.container;

    // Handle events
    listBox.addEventListener('focus', this.handleFocus.bind(this));
    listBox.addEventListener('keydown', this.handleKeyDown.bind(this));
    listBox.addEventListener('mousedown', this.handleMouseDown.bind(this));
    listBox.addEventListener('dblclick', this.handleDblClick.bind(this));
  }

  handleFocus (event) {
    if (this.selectedOption === null) {
      this.setSelected(this.firstOption);
    }
    else {
      this.setSelected(this.selectedOption);
    }

    // event.stopPropagation();
    // event.preventDefault();
  }

  handleKeyDown (event) {
    let flag = false;

    switch (event.key) {

      // Navigation keys
      case 'ArrowLeft':
      case 'ArrowUp':
        this.selectPrevOption();
        flag = true;
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        this.selectNextOption();
        flag = true;
        break;

      case 'PageUp':
        this.selectPrevPage();
        flag = true;
        break;

      case 'PageDown':
        this.selectNextPage();
        flag = true;
        break;

      case 'Home':
        this.selectFirstOption();
        flag = true;
        break;

      case 'End':
        this.selectLastOption();
        flag = true;
        break;

      // Activation keys
      case 'Enter':
      case ' ':
        this.activateSelection();
        flag = true;
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleMouseDown (event) {
    let parentElement = event.target.parentElement;

    if (parentElement.getAttribute('role') === 'option') {
      this.setSelected(parentElement);

      // event.stopPropagation();
      // event.preventDefault();
    }
  }

  handleDblClick (event) {
    this.activateSelection();

    // event.stopPropagation();
    // event.preventDefault();
  }

  setSelected (option) {
    if (this.selectedOption) {
      this.selectedOption.removeAttribute('aria-selected')
    }

    this.selectedOption = option;
    option.setAttribute('aria-selected', 'true');
    this.container.setAttribute('aria-activedescendant', option.id);
    this.scrollSelectedOption();
    this.notifyFn({
      action: 'navigate',
      index: this.optionsList.indexOf(this.selectedOption)
    });
  }

  scrollSelectedOption () {
    let listbox = this.container;
    let element = this.selectedOption;

    // Note: element.offsetTop is the number of pixels from the top of the
    // closest relatively positioned parent element. Thus the CSS for the
    // ListBox container element must specify 'position: relative'.

    if (listbox.scrollHeight > listbox.clientHeight) {

      let elementBottom = element.offsetTop + element.offsetHeight;
      let scrollBottom = listbox.clientHeight + listbox.scrollTop;

      if (elementBottom > scrollBottom) {
        listbox.scrollTop = elementBottom - listbox.clientHeight;
      }
      else if (element.offsetTop < listbox.scrollTop) {
        listbox.scrollTop = element.offsetTop;
      }
    }
  }

  activateSelection () {
    this.notifyFn({
      action: 'activate',
      index: this.optionsList.indexOf(this.selectedOption)
    });
  }

  selectFirstOption () {
    this.setSelected(this.firstOption);
  }

  selectLastOption () {
    this.setSelected(this.lastOption);
  }

  selectPrevOption () {
    if (this.selectedOption === this.firstOption) return;

    let index = this.optionsList.indexOf(this.selectedOption);
    this.setSelected(this.optionsList[index - 1]);
  }

  selectNextOption () {
    if (this.selectedOption === this.lastOption) return;

    let index = this.optionsList.indexOf(this.selectedOption);
    this.setSelected(this.optionsList[index + 1]);
  }

  selectPrevPage () {
    if (this.selectedOption === this.firstOption) return;

    let index = this.optionsList.indexOf(this.selectedOption);
    let tgtIndex = index - this.increment;

    if (tgtIndex < 0) {
      this.selectFirstOption();
    }
    else {
      this.setSelected(this.optionsList[tgtIndex]);
    }
  }

  selectNextPage () {
    if (this.selectedOption === this.lastOption) return;

    let index = this.optionsList.indexOf(this.selectedOption);
    let tgtIndex = index + this.increment;

    if (tgtIndex > this.optionsList.length - 1) {
      this.selectLastOption();
    }
    else {
      this.setSelected(this.optionsList[tgtIndex]);
    }
  }
}
