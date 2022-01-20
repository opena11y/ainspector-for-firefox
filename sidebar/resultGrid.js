/* resultGrid.js */

import { formatItemForCSV } from '../utilities.js';

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
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Save handle functions
    this.onRowActivation = null;
    this.onRowSelection = null;

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultGrid.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize references
    this.table   = this.shadowRoot.querySelector('table');
    this.theadTr = this.table.querySelector('thead tr');
    this.thead   = this.table.querySelector('thead');
    this.tbody   = this.table.querySelector('tbody');

    this.lastSelectedRowId = '';
    this.activationDisabled = false;
  }

  resize (size) {
    const headHeight = this.thead.offsetHeight;
    const h = size - headHeight;
    this.tbody.style.height = h + 'px';
  }

  toCSV () {
    let csv = '';
    let item;
    let last;
    const headers = Array.from(this.theadTr.querySelectorAll('th, td'));

    headers.forEach( (cell, index, array) => {
      if (cell.title) {
        item = cell.title;
      } else {
        item = cell.textContent;
      }
      last = (index === (array.length - 1));
      csv += formatItemForCSV(item, last);
    })
    csv += '\n';

    const rows = Array.from(this.tbody.querySelectorAll('tr'));

    rows.forEach( (row) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      cells.forEach( (cell, index, array) => {
        last = (index === (array.length-1));
        const span = cell.querySelector('[aria-hidden]');
        if (span) {
          csv += formatItemForCSV(span.textContent, last);
        } else {
          csv += formatItemForCSV(cell.textContent, last);
        }
      });
      csv += '\n';
    });

    return csv;
  }

  set disabled (value) {
    this.activationDisabled = value;
  }

  get disabled () {
    return this.activationDisabled;
  }

  addClassNameToTable (name) {
    return this.table.classList.add(name);
  }

  setRowActivationEventHandler (handler) {
    this.onRowActivation = handler;
  }

  setRowSelectionEventHandler (handler) {
    this.table.classList.add('show-selection');
    this.onRowSelection = handler;
  }

  disable () {
    this.table.setAttribute('aria-disabled', 'true');
    this.disabled = true;
    this.setDetailsButtonDisabled (true);
  }

  enable () {
    this.table.setAttribute('aria-disabled', 'false');
    this.disabled = false;
    this.setDetailsButtonDisabled (false);
  }

  setDetailsButton (button) {
    this.detailsButton = button;
  }

  setDetailsButtonDisabled (value) {
    if (typeof value !== 'boolean') {
      value = true;
    }
    value = this.disabled ? true : value;
    if (this.detailsButton) {
      this.detailsButton.disabled = value;
    }
  }

  getRowCount () {
    return this.table.querySelectorAll('tr').length;
  }

  getRowByPosition (pos) {
    if (pos < 1) {
      return this.theadTr;
    }
    let rows =  this.table.querySelectorAll('tr');
    if (pos > rows.length) {
      return this.tbody.lastElementChild;
    }
    return rows[pos-1];
  }

  getRowCurrentPosition (row) {
    let rows =  this.table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i] === row) {
        return i + 1;
      }
    }
    // if not found return zero
    return 0;
  }

  getRowById (id) {
    return this.table.querySelector(`#${id}`);
  }

  getColCount (row) {
    return row.querySelectorAll('th, td').length;
  }

  getCellByPosition (row, pos) {
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

  getCellCurrentPosition (row, cell) {
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
  addHeaderCell (txt, style, title, isSortable) {
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
      let span = document.createElement('span');
      span.className = 'icon';
      span.textContent = '▼';
      span.setAttribute('aria-hidden', 'true');
      th.appendChild(span);
      th.classList.add('sortable');
    }
    this.theadTr.appendChild(th);
    this.theadTr.addEventListener('keydown', this.onRowKeydown.bind(this));
    th.addEventListener('keydown', this.onCellKeydown.bind(this));
    return th;
  }

  getNumberOfColumns () {
    return this.theadTr.querySelectorAll('th').length;
  }

  addMessageRow (message) {
    let tr = document.createElement('tr');
    tr.tabIndex = 0;
    tr.setAttribute('aria-label', message);

    let td = document.createElement('td');
    td.className = 'message';
    td.setAttribute('colspan', this.getNumberOfColumns());
    td.textContent = message;
    tr.appendChild(td);
    this.tbody.appendChild(tr);
  }

  // The id is used by event handlers for actions related to the row content
  addRow (id) {
    let tr = document.createElement('tr');
    tr.id = id;
    this.tbody.appendChild(tr);

    tr.addEventListener('keydown', this.onRowKeydown.bind(this));
    tr.addEventListener('click', this.onRowClick.bind(this));
    tr.addEventListener('dblclick', this.onRowDoubleClick.bind(this));
    return tr;
  }

  addDataCell (row, txt, accName, style, sortValue) {
    let span1, span2;
    let td = document.createElement('td');
    td.tabIndex = -1;

    if (accName) {
      // Hide the visually rendered text content from AT
      span1 = document.createElement('span');
      span1.textContent = txt;
      span1.setAttribute('aria-hidden', 'true');
      td.appendChild(span1);
      // Hide the content available to AT from visual rendering
      span2 = document.createElement('span');
      span2.textContent = accName;
      span2.className = 'sr-only';
      td.appendChild(span2);
    } else {
      td.textContent = txt;
    }

    if (style) {
      td.className = style;
    }
    if (sortValue) {
      td.setAttribute('data-sort-value', sortValue);
    }
    row.appendChild(td);
    td.addEventListener('keydown', this.onCellKeydown.bind(this));

    return td;
  }

  updateDataCell (row, pos, txt, name, style, sortValue) {
    let cell = this.getCellByPosition(row, pos);
    cell.textContent = txt;
    if (name) {
      cell.setAttribute('aria-label', name);
    }
    if (style) {
      cell.className = style;
    }
    if (sortValue) {
      cell.attribute('data-sort-value', sortValue);
    }
    return cell;
  }

  clearRow (id) {
    let row = this.tbody.querySelector('#' + id);
    let tds = row.querySelectorAll('td');

    // Leave first cell and clear the rest
    for (let i = 1; i < tds.length; i += 1) {
      tds[i].textContent = '-';
    }
  }

  // messages provide status feedback
  deleteDataRows (message1, message2) {
    if (typeof message1 !== 'string') {
      message1 = '';
    }
    if (typeof message2 !== 'string') {
      message2 = '';
    }
    while (this.tbody.firstChild) {
      this.tbody.firstChild.remove();
    }

    if (message1) {
      this.addMessageRow(message1);
    }

    if (message2) {
      this.addMessageRow(message2);
    }

    this.setDetailsButtonDisabled(true);
  }

  // sorts table rows using the data-sort attribute
  // data-sort attribute must me a number
  sortGridByColumn (primaryIndex, secondaryIndex, thirdIndex, sortValue) {
    function compareValues(a, b) {
      if (sortValue === 'ascending') {
        if (a.value1 === b.value1) {
          if (a.value2 === b.value2) {
            if (a.value3 === b.value3) {
              return 0;
            } else {
              return a.value3 - b.value3;
            }
          } else {
            return a.value2 - b.value2;
          }
        } else {
          return a.value1 - b.value1;
        }
      } else {
        if (a.value1 === b.value1) {
          if (a.value2 === b.value2) {
            if (a.value3 === b.value3) {
              return 0;
            } else {
              return b.value3 - a.value3;
            }
          } else {
            return b.value2 - a.value2;
          }
        } else {
          return b.value1 - a.value1;
        }
      }
    }

    if (typeof sortValue !== 'string') {
      sortValue = 'descending';
    }

    let trs = [];
    let rowData = [];
    let cell1;
    let cell2;
    let cell3;

    let tr = this.tbody.firstElementChild;

    let index = 0;
    while (tr) {
      trs.push(tr);
      cell1 = this.getCellByPosition(tr, primaryIndex);
      if (secondaryIndex) {
        cell2 = this.getCellByPosition(tr, secondaryIndex);
      }
      if (thirdIndex) {
        cell3 = this.getCellByPosition(tr, thirdIndex);
      }

      let data = {};
      data.index = index;
      data.value1 = parseFloat(cell1.getAttribute('data-sort-value'));
      if (secondaryIndex) {
        data.value2 = parseFloat(cell2.getAttribute('data-sort-value'));
      } else {
        data.value2 = 0;
      }
      if (thirdIndex) {
        data.value3 = parseFloat(cell3.getAttribute('data-sort-value'));
      } else {
        data.value3 = 0;
      }

      rowData.push(data);
      tr = tr.nextElementSibling;
      index += 1;
    }

    rowData.sort(compareValues);

    this.deleteDataRows();

    // add sorted rows
    for (let i = 0; i < rowData.length; i += 1) {
      this.tbody.appendChild(trs[rowData[i].index]);
    }

    this.setSortHeader(primaryIndex);

  }

  setSortHeader (index) {
    let th = this.getCellByPosition(this.theadTr, index);
    let cell = this.theadTr.firstChild;

    while (cell) {

      if (cell === th) {
        cell.setAttribute('aria-sort', 'descending');
      } else {
        cell.removeAttribute('aria-sort');
      }
      cell = cell.nextElementSibling;
    }
  }

  // The flag is used to udpate the last user selected item
  setSelectedRow (node, flag) {
    if (typeof flag !== 'boolean') {
      flag = true;
    }
    let n = node;
    this.setDetailsButtonDisabled(true);
    if (node.tagName !== 'TR') {
      n = node.parentNode;
    }
    if (n) {
      let trs = this.table.querySelectorAll('tr');
      if (flag) {
        this.lastSelectedRowId = n.id;
      }
      trs.forEach( (tr) => {
        if (tr === n) {
          tr.tabIndex = (n === node) ? 0 : -1;
          tr.setAttribute('aria-selected', 'true');
          this.setDetailsButtonDisabled(false);
        } else {
          tr.removeAttribute('aria-selected');
          tr.tabIndex = -1;
        }
      });
    }
  }

  setSelectedRowUsingLastId () {
    let tr, id = this.lastSelectedRowId;
    if (id) {
      tr = this.table.querySelector('tr[id=' + id + ']')
    } else {
      tr = this.tbody.firstElementChild;
    }
    if (tr && tr.id) {
      this.setSelectedRow(tr);
      id = tr.id;
    }
    return id;
  }

  getSelectedRowId () {
    let tr = this.table.querySelector('tr[aria-selected]');
    if (tr && tr.id) {
      return tr.id;
    }
    return '';
  }

  getFirstDataRowId () {
    let tr = this.tbody.firstElementChild;
    if (tr && tr.id) {
      return tr.id;
    }
    return '';
  }

  getSelectedRowId () {
    return this.lastSelectedRowId;
  }

  tryHandleRowSelection (id) {
    if (this.onRowSelection) {
      this.onRowSelection(id);
      return true;
    }
    return false;
  }

  tryHandleRowActivation (id) {
    if (!this.activationDisabled &&
        this.onRowActivation &&
        !this.disabled) {
      this.onRowActivation(id);
      return true;
    }
    return false;
  }

  // event handlers

  onRowClick (event) {
    let tgt = event.currentTarget;
    this.setSelectedRow(tgt);
    tgt.focus();
    this.tryHandleRowSelection(tgt.id);

    event.preventDefault();
    event.stopPropagation();
  }

  onRowDoubleClick (event) {
    let tgt = event.currentTarget;
    tgt.focus();
    this.setSelectedRow(tgt);
    this.tryHandleRowActivation(tgt.id);

    event.preventDefault();
    event.stopPropagation();
  }

  onRowKeydown (event) {
    let nextItem = null;
    let flag = false;

    let tgt = event.target;
    let rowPos = this.getRowCurrentPosition(tgt);

    switch(event.key) {
      case 'Enter':
        if (tgt.id) {
          this.tryHandleRowActivation(tgt.id);
          flag = true;
        }
        break;

      case 'ArrowDown':
        nextItem = this.getRowByPosition(rowPos+1);
        this.tryHandleRowSelection(nextItem.id);
        flag = true;
        break;

      case 'ArrowUp':
        nextItem = this.getRowByPosition(rowPos-1);
        this.tryHandleRowSelection(nextItem.id);
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
      this.setSelectedRow(nextItem);
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onCellKeydown (event) {
    let nextItem = null;
    let nextRow = null;
    let flag = false;

    let tgt   = event.target;
    let tgtTr = tgt.parentNode;

    let colPos = this.getCellCurrentPosition(tgtTr, tgt);
    let rowPos = this.getRowCurrentPosition(tgtTr);

    switch(event.key) {
      case 'Enter':
        if (tgtTr.id) {
          this.tryHandleRowActivation(tgtTr.id);
          flag = true;
        }
        break;

      case 'ArrowDown':
        if (rowPos && colPos) {
          nextRow = this.getRowByPosition(rowPos+1);
          nextItem = this.getCellByPosition(nextRow, colPos);
          this.tryHandleRowSelection(nextRow.id);
        }
        flag = true;
        break;

      case 'ArrowUp':
        if (rowPos && colPos) {
          nextRow = this.getRowByPosition(rowPos-1)
          nextItem = this.getCellByPosition(nextRow, colPos);
          this.tryHandleRowSelection(nextRow.id);
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
      this.setSelectedRow(nextItem);
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

}
