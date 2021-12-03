/* resultGrid.js */

const template = document.createElement('template');
template.innerHTML = `
    <table role="grid" class="result-grid">
      <thead>
        <tr></tr>
      </head>
      <tbody>
      </tbody>
    </table>
`;

export default class ResultGrid extends HTMLElement {
  constructor (callbackRowClick, callbackRowDoubleClick) {
    super();
    this.attachShadow({ mode: 'open' });

    // Save callback functions
    this.callbackRowClick = callbackRowClick;
    this.callbackRowDoubleClick = callbackRowDoubleClick;

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultGrid.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize references
    this.table     = this.shadowRoot.querySelector('table');
    this.headersTr = this.table.querySelector('thead tr');
    this.tbody     = this.table.querySelector('tbody');
  }

  getRowCount() {
    return this.tbody.querySelectorAll('tr').length;
  }

  getColCount(row) {
    return row.querySelectorAll('th, td').length;
  }

  getRowByPosition(pos) {
    return this.tbody.querySelector(`[data-grid-row="${pos}"]`);
  }

  getRowById(id) {
    return this.tbody.querySelector(`#${id}`);
  }

  getDataCellByPosition(row, pos) {
    return row.querySelector(`td:nth-child(${pos})`);
  }

  // This grid only supports one row of headers
  addHeaderCell(txt, style, title, isSortable) {
    let th = document.createElement('th');
    th.tabIndex = -1;
    th.setAttribute('data-grid-col', this.getColCount(this.headersTr) + 1);
    th.textContent = txt;
    if (style) {
      th.className = style;
    }
    if (title) {
      th.title = title;
    }
    if (isSortable) {
      th.setAttribute('data-sortable', 'true');
    }
    this.headersTr.appendChild(th);
    this.headersTr.addEventListener('keydown', this.handleRowKeydown.bind(this));
    th.addEventListener('keydown', this.handleCellKeydown.bind(this));
  }

  // The id is used by event handlers for actions related to the row content
  addRow(id) {
    let row = document.createElement('tr');
    let rowCount = this.getRowCount();
    // first data row by default gets tabindex=0 to be part of tab sequence of page
    row.tabIndex = (rowCount === 0) ? 0 : -1;

    row.id = id;
    row.setAttribute('data-grid-row', rowCount + 1);
    this.tbody.appendChild(row);

    row.addEventListener('keydown', this.handleRowKeydown.bind(this));

    if (this.callbackClick) {
      row.addEventListener('click', this.callbackClick);
    }

    if (this.callbackDoubleClick) {
      row.addEventListener('dblclick', this.callbackDoubleClick);
    }
    return row;
  }

  addDataCell(row, txt, style, sortValue) {
    let td = document.createElement('td');
    td.tabIndex = -1;

    td.textContent = txt;
    td.setAttribute('data-grid-col', this.getColCount(row) + 1);

    if (style) {
      td.className = style;
    }
    if (sortValue) {
      td.attribute('data-sort-value', sortValue);
    }
    row.appendChild(td);
    td.addEventListener('keydown', this.handleCellKeydown.bind(this));

    return td;

  }

  updateDataCell(row, pos, txt, style, sortValue) {
    let cell = this.getDataCellByPosition(row, pos);
    cell.textContent = txt;
    if (style) {
      cell.className = style;
    }
    if (sortValue) {
      cell.attribute('data-sort-value', sortValue);
    }
  }

  clearRow(id) {
    let row = this.tbody.querySelector('#' + id);
    let tds = row.querySelectorAll('td');

    // Leave first cell and clear the rest
    for (let i = 1; i < tds.length; i += 1) {
      tds[i].textContent = '-';
    }
  }

  deleteDataRows () {
    this.tbody.innerHTML = '';
  }

  // event handlers

  handleRowKeydown (event) {
    let nextItem = null;
    let flag = false;

    let tgt = event.target;
    let row = parseInt(tgt.getAttribute('data-grid-row'));

    switch(event.key) {
      case 'ArrowDown':
        flag = true;
        nextItem = this.getRowByPosition(row+1);
        break;

      case 'ArrowUp':
        flag = true;
        nextItem = this.getRowByPosition(row-1);
        break;

      case 'ArrowRight':
        nextItem = tgt.firstElementChild;
        flag = true;
        break;


      default:
        break;
    }

    if (nextItem) {
      nextItem.focus();
      nextItem.tabIndex = 0;
      tgt.tabIndex = -1;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handleCellKeydown (event) {
    let nextItem = null;
    let nextRow = null;
    let flag = false;

    let tgt   = event.target;
    let tgtTr = tgt.parentNode;

    let col = parseInt(tgt.getAttribute('data-grid-col'));
    let row = parseInt(tgtTr.getAttribute('data-grid-row'));

    switch(event.key) {
      case 'ArrowDown':
        flag = true;
        nextRow = this.getRowByPosition(row+1);
        if (nextRow) {
          nextItem = this.getDataCellByPosition(nextRow, col);
        }
        break;

      case 'ArrowUp':
        flag = true;
        nextRow = this.getRowByPosition(row-1);
        if (nextRow) {
          nextItem = this.getDataCellByPosition(nextRow, col);
        }
        break;

      case 'ArrowLeft':
        nextItem = tgt.previousElementSibling;
        if (!nextItem) {
          nextItem = tgtTr;
        }
        flag = true;
        break;

      case 'ArrowRight':
        nextItem = tgt.nextElementSibling;
        flag = true;
        break;

      default:
        break;
    }

    if (nextItem) {
      nextItem.focus();
      nextItem.tabIndex = 0;
      tgt.tabIndex = -1;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

}
