/* infoWCAGLevels.js */

const template = document.createElement('template');
template.innerHTML = `

 <h3 class="rules" id="id-levels">
    WCAG Rule Level Definitions
  </h3>
  <table class="table" aria-labelledby="id-levels">
    <tbody>
      <tr>
        <th class="text-start text-top term">
          A
        </th>
        <td class="text-start">
          Level A requirments set a minimum level of accessibility, but does not achieve accessibility for many people with disabilities.
        </td>
      </tr>
      <tr>
        <th class="text-start text-top term">
          AA
        </th>
        <td class="text-start">
          Level AA requirements meet the accessibility of a broader range of disabilities and when combined with Level A requirements are typically considered the minimum requirements to be considered accessible.
        </td>
      </tr>
      <tr>
        <th class="text-start text-top term">
          AAA
        </th>
        <td class="text-start">
          Level AAA requirements maximizes the the accessibility to the broadest range of disabilities and when combined with Level A and AA requirements achieves the highest level of accessibility.
          </td>
      </tr>
    </tbody>
  </table>

`;

export default class InfoWCAGLevels extends HTMLElement {
  constructor () {

    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './info-dialog/infoDialogContent.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

