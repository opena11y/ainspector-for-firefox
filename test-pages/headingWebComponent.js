/* headingWebComponent.js */

const template = document.createElement('template');
template.innerHTML = `
  <h3><slot name="h3">Default Slotted H3 content</slot></h3>
  <slot name="h4"><h4>Default Slotted H4 content</h4></slot>
  <slot name="h5"><h5>Default Slotted H5 content</h5></slot>
  <slot name="h6"><h6>Default Slotted H6 content</h6></slot>
`;

class HeadingWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Creates a shadow DOM root node for the element

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('heading-webcomponent', HeadingWebComponent);

