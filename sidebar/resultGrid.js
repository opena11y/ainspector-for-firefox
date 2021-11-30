/* ruleSummary.js */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <table class="result-grid">
      <thead>
        <tr><tr>
      </head>
      <tbody>
      </tbody>
    </table>
`;

export default class ResultGrid extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultGrid.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize references
    this.headersTr   = this.shadowRoot.querySelector('thead tr');
    this.tbody   = this.shadowRoot.querySelector('tbody');
  }

  addHeaderCell(content) {
    let th = document.createElement('th');
    th.textContent = content;
    this.headersTr.appendChild(th);
  }

  addRow(id, label, data, callback) {

    let row = document.createElement('tr');
    row.id = id;
    this.tbody.appendChild(row);

    if (label) {
      this.addDataCell(row, label);
    }

    data.forEach( (d) => {
      this.addDataCell(row, d);
    });

    if (callback) {
      row.addEventListener('click', callback);
    }

  }

  addDataCell(row, d) {
    let td = document.createElement('td');
    td.textContent = d;
    row.appendChild(td);
  }

  updateRow(id, data) {
    let row = this.tbody.querySelector('#' + id);
    let tds = row.querySelectorAll('td');

    for (let i = 0; i < data.length; i += 1) {
      tds[i].textContent = data[i];
    }

  }

  clearRow(id) {
    let row = this.tbody.querySelector('#' + id);
    let tds = row.querySelectorAll('td');

    // Leave first cell and clear the reast
    for (let i = 1; i < tds.length; i += 1) {
      tds[i].textContent = '-';
    }

  }

  clearDataCells () {
    this.tbody.innerHTML = '';
  }

}
