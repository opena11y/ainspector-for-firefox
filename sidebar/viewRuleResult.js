
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

    this.initGrid();
  }

  resize (size) {
    const adjustment = 80;
    const highlightHeight = this.highlightSelect.offsetHeight;
    const h = (size - highlightHeight - adjustment);

    this.elementResultGrid.resize(h);

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

  update (infoRuleResult) {
    let i, id, row, er, style, sortValue, label;
    let count = 0;

    this.elementResultGrid.deleteDataRows();

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleResult.elementResults.length; i += 1) {
        er = infoRuleResult.elementResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(er.result) > 0)) {
          row = this.elementResultGrid.addRow(this.getRowId(er.position));

          this.elementResultGrid.addDataCell(row, er.element, 'element');

          style = 'result ' + this.getResultStyle(er.result);
          sortValue = this.getResultSortingValue(er.result);
          this.elementResultGrid.addDataCell(row, er.result, style, sortValue);

          this.elementResultGrid.addDataCell(row, er.position, 'position');

          this.elementResultGrid.addDataCell(row, er.actionMessage, 'action');
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
      position = parseInt(id.substring(3));
      console.log('[onRowSelection]: ' + position + ' ' + typeof position);
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
