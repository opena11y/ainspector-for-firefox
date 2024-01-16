/* infoRulesets.js */

const template = document.createElement('template');
template.innerHTML = `

  <h3 class="rules" id="id-rulesets">
    Number of Rules
  </h3>
  <table class="table table-striped" aria-labelledby="id-rulesets">
    <thead>
      <tr>
        <th class="text-start">Ruleset</th>
        <th class="text-end">Level A</th>
        <th class="text-end">Level AA</th>
        <th class="text-end">Level AAA</th>
        <th class="text-end">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th class="text-start">
          <a href="https://www.w3.org/TR/WCAG20/" target="_wcag">WCAG 2.0 (2008)</a>
        </th>
        <td class="text-end">95</td>
        <td class="text-end">22</td>
        <td class="text-end">1</td>
        <td class="text-end">118</td>
      </tr>
      <tr>
        <th class="text-start">
          <a href="https://www.w3.org/TR/WCAG21/" target="_wcag">WCAG 2.1 (2018)</a>
          </th>
        <td class="text-end">101</td>
        <td class="text-end">30</td>
        <td class="text-end">4</td>
        <td class="text-end">135</td>
      </tr>
      <tr>
        <th class="text-start">
          <a href="https://www.w3.org/TR/WCAG22/" target="_wcag">WCAG 2.2 (2023)</a>
        </th>
        <td class="text-end">102</td>
        <td class="text-end">37</td>
        <td class="text-end">4</td>
        <td class="text-end">143</td>
      </tr>
      <tr>
        <th class="text-start">First Step</th>
        <td class="text-end">22</td>
        <td class="text-end">5</td>
        <td class="text-end">0</td>
        <td class="text-end">27</td>
      </tr>
    </tbody>
  </table>

`;

export default class InfoRulesets extends HTMLElement {
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

