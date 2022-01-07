/* viewRuleResult.js */

const getMessage = browser.i18n.getMessage;

import { getOptions } from '../storage.js';

export default class ViewRuleResult {
  constructor(id, handleRowSelection) {

    this.handleRowSelection = handleRowSelection;

    this.ruleResultDiv = document.getElementById(id);

    this.resultTablist = document.createElement('result-tablist');
    this.ruleResultDiv.appendChild(this.resultTablist);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.resultTablist.tabpanel1.appendChild(this.resultRuleInfo);

    this.elementResultGrid = document.createElement('result-grid');
    this.elementResultGrid.addClassNameToTable('rule');
    this.resultTablist.tabpanel2.appendChild(this.elementResultGrid);
    this.elementResultGrid.setRowSelectionEventHandler(this.onRowSelectionCallback.bind(this));

    this.highlightSelect = document.createElement('highlight-select');
    this.highlightSelect.setChangeEventCallback(this.onSelectChangeCallback.bind(this));
    this.resultTablist.tabpanel2.appendChild(this.highlightSelect);

    // Create container DIV with heading for rule information
    const div = document.createElement('div');
    div.className = 'element-info';
    this.resultTablist.tabpanel2.appendChild(div);

    const h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.textContent = getMessage('elementSelectedLabel');
    div.appendChild(h2);

    this.resultElementInfo = document.createElement('result-element-info');
    div.appendChild(this.resultElementInfo);

    this.elementResults = {};

    this.initGrid();
  }

  toCSV () {
    let csv = '';
    csv += this.elementResultGrid.toCSV();
    return csv
  }

  resize (mainHeight) {
    const adjustment = 130;
    const highlightHeight = this.highlightSelect.offsetHeight;
    const h = (mainHeight - highlightHeight - adjustment);

    this.elementResultGrid.resize((h/2));
    this.resultElementInfo.resize((h/2));
    this.resultRuleInfo.resize(h);
  }

  initGrid () {

    this.resultTablist.tabLabel1 = getMessage('detailsActionLabel');
    this.resultTablist.tabLabel2 = getMessage('elementResultsLabel');
    // Make element results the deafult tab
    this.resultTablist.showTabpanel('tabpane-2');

    this.elementResultGrid.addHeaderCell(getMessage('elementLabel'), 'element-info');
    this.elementResultGrid.addHeaderCell(getMessage('resultLabel'), 'result');
    this.elementResultGrid.addHeaderCell(getMessage('positionAbbrev'), 'position', getMessage('positionLabel'));
    this.elementResultGrid.addHeaderCell(getMessage('actionLabel'), 'action');

  }

  getResultStyle(result) {
    let style = 'not-applicable';

    switch (result){
      case 'MC':
        style = 'manual-check';
        break;
      case 'P':
        style = 'passed';
        break;
      case 'V':
        style = 'violation';
        break;
      case 'W':
        style = 'warning';
        break;
      case 'H':
        style = 'hidden';
        break;
      default:
        break;
    }
    return style;
  }

  // returns a number for the sorting the result value
  getResultSortingValue(result) {
    return ['', 'H', 'P', 'MC', 'W', 'V'].indexOf(result);
  }

  getRowId (position) {
    return 'er-' + position;
  }

  getPositionFromId(id) {
    return id.subString(3, id.length);
  }

  getResultAccessibleName (result) {
    let accName = getMessage('notApplicableLabel');

    switch (result){
      case 'MC':
        accName = getMessage('manualCheckLabel');
        break;
      case 'P':
        accName = getMessage('passedLabel');
        break;
      case 'V':
        accName = getMessage('violationLabel');
        break;
      case 'W':
        accName = getMessage('warningLabel');
        break;
      default:
        break;
    }
    return accName;
  }

  update (infoRuleResult) {
    let i, id, row, er, rowId, style, sortValue, label, rowAccName, cellAccName = '', elemName;
    let count = 0;

    this.elementsResultInfo = {};
    this.elementResultGrid.deleteDataRows();

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleResult.elementResults.length; i += 1) {
        er = infoRuleResult.elementResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(er.result) > 0)) {

          rowId = this.getRowId(er.position);

          this.elementResults[rowId] = er;
          row = this.elementResultGrid.addRow(rowId);

          // Add element information cell (column 1)

          elemName = er.element;
          if (er.tagName) {
            elemName = er.tagName;
          }

          rowAccName = elemName;
          this.elementResultGrid.addDataCell(row, elemName, '', 'element-info');

          // Add result information cell (column 2)
          style = 'result ' + this.getResultStyle(er.result);
          sortValue = this.getResultSortingValue(er.result);
          cellAccName = this.getResultAccessibleName(er.result);
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, er.result, cellAccName, style, sortValue);

          // Add position information cell (column 3)
          cellAccName = er.position + ' ' + getMessage('domPositionLabel');
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, er.position, cellAccName, 'position', (-1 * er.position));

          // Add action information cell (column 4)
          rowAccName += ', ' + er.actionMessage;
          this.elementResultGrid.addDataCell(row, er.actionMessage, '', 'action');
          row.setAttribute('aria-label', rowAccName);

          count += 1;
        }
      }

      if (count > 0) {
        this.elementResultGrid.sortGridByColumn(2, 3, 0, 'descending');
        const id = this.elementResultGrid.setSelectedRowUsingLastId();
        this.resultRuleInfo.update(infoRuleResult.detailsAction);
      } else {
        if (infoRuleResult.elementResults.length === 0) {
          label = getMessage('noResultsMsg');
        } else {
          label = getMessage('noViolationsWarningsMCResultsMsg');
        }
        this.elementResultGrid.addNoResultsRow(label);
        this.resultRuleInfo.clear();
      }
    });
  }

  clear () {
    this.elementResultGrid.deleteDataRows();
    this.resultRuleInfo.clear();
  }

  onRowSelectionCallback (id) {
    let position = false;
    if (id) {
      this.resultElementInfo.update(this.elementResults[id]);
      position = parseInt(id.substring(3));
      if (position && typeof position === 'number') {
        if (this.handleRowSelection) {
          this.handleRowSelection(position);
        }
      }
    }
  }

  onSelectChangeCallback () {
    let id = this.elementResultGrid.getSelectedRowId();
    if (id) {
      this.onRowSelectionCallback(id);
    }
  }
}
