/* infoScopes.js */

const template = document.createElement('template');
template.innerHTML = `

 <h3 class="rules" id="id-aria">
    Aria Versions
  </h3>
  <table class="table" aria-labelledby="id-aria">
    <tbody>
      <tr>
        <th class="text-start text-top term" style="white-space: nowrap">
          ARIA 1.2
        </th>
        <td class="text-start">
          The <a href="https://www.w3.org/TR/wai-aria-1.2/">Accessible Rich Internet Applications 1.2</a> Specification was published in June 2023 and it's features are widely supported in browsers and is the current standard to reliability use.
      </tr>
      <tr>
        <th class="text-start text-top term">
          ARIA 1.3
        </th>
        <td class="text-start">
          The <a href="https://www.w3.org/TR/wai-aria-1.3/">Accessible Rich Internet Applications 1.3</a> is the current working draft under development by the <a href="https://www.w3.org/WAI/ARIA/">Accessible Rich Internet Applications (ARIA) Working Group</a> (<a href="https://www.w3.org/TR/wai-aria-1.3/#major-feature-in-this-release">major new features</a>).  New features of ARIA 1.3 have been implemented by some browsers. The specification is still under development so new features should be used with caution until it becomes as specification with wide spread implementation of features.
        </td>
      </tr>
    </tbody>
  </table>

  <p style="font-weight: normal"><strong>Note:</strong> A few ARIA features are not fully supported by assistive technologies like screen readers.  See the <a href="https://www.w3.org/community/aria-at/">ARIA and Assistive Technologies Community Group</a> for work on improving assistive technology support for ARIA features.</p>
`;

export default class InfoAriaVersions extends HTMLElement {
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

