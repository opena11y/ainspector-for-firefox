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
    return this.table.querySelectorAll('tr').length;
  }

  getRowByPosition(pos) {
    if (pos < 1) {
      return this.headersTr;
    }
    let rows =  this.table.querySelectorAll('tr');
    if (pos > rows.length) {
      return this.tbody.lastElementChild;
    }
    return rows[pos-1];
  }

  getRowCurrentPosition(row) {
    let rows =  this.table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i] === row) {
        return i + 1;
      }
    }
    // if not found return zero
    return 0;
  }

  getRowById(id) {
    return this.table.querySelector(`#${id}`);
  }

  getColCount(row) {
    return row.querySelectorAll('th, td').length;
  }

  getCellByPosition(row, pos) {
    let cells = row.querySelectorAll('th, td');
    if (pos < 2) {
      return cells[0];
    }
    for (let i = 0; i < cells.length; i += 1) {
      if (i === (pos-1)) {
        return cells[i];
      }
    }
    return cells[cells.length-1];
  }

  getCellCurrentPosition(row, cell) {
    let cells = row.querySelectorAll('th, td');
    for (let i = 0; i < cells.length; i += 1) {
      if (cells[i] === cell) {
        return i + 1;
      }
    }
    // if not found return zero
    return 0;
  }

  // This grid only supports one row of headers
  addHeaderCell(txt, style, title, isSortable) {
    let th = document.createElement('th');
    th.tabIndex = -1;
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
    row.tabIndex = (rowCount === 1) ? 0 : -1;

    row.id = id;
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
    let cell = this.getCellByPosition(row, pos);
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
    let rowPos = this.getRowCurrentPosition(tgt);

    switch(event.key) {
      case 'ArrowDown':
        nextItem = this.getRowByPosition(rowPos+1);
        flag = true;
        break;

      case 'ArrowUp':
        nextItem = this.getRowByPosition(rowPos-1);
        flag = true;
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

    let colPos = this.getCellCurrentPosition(tgtTr, tgt);
    let rowPos = this.getRowCurrentPosition(tgtTr);

    switch(event.key) {
      case 'ArrowDown':
        if (rowPos && colPos) {
          nextRow = this.getRowByPosition(rowPos+1);
          nextItem = this.getCellByPosition(nextRow, colPos);
        }
        flag = true;
        break;

      case 'ArrowUp':
        if (rowPos && colPos) {
          nextRow = this.getRowByPosition(rowPos-1)
          nextItem = this.getCellByPosition(nextRow, colPos);
        }
        flag = true;
        break;

      case 'ArrowLeft':
        if (tgt.previousElementSibling) {
          nextItem = tgt.previousElementSibling;
        } else {
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
