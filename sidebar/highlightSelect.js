/* highlightSelect.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <div class="highlight-select">
      <label id="label" for="select">Highlight</label>
      <select id="select">
        <option value="none" selected>None</none>
        <option value="selected">Selected</none>
        <option value="vw">V/W</none>
        <option value="all">All</none>
      </select>
    </div>
`;

export default class HighlightSelect extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'highlightSelect.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Get references

    this.select = this.shadowRoot.querySelector('#select');

  }

  get value () {
    return this.select.options[this.select.selectedIndex].value;
  }

  set value (value) {
    for (let i = 0; i < this.select.options.length; i += 1) {
      if (this.select.options[i].id === value) {
        this.select.options[i].selected = true;
      }
    }
  }

}