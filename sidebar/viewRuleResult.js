/* viewRuleResult.js */

import { getOptions } from '../storage.js';
import ViewRuleResultCSV  from './viewRuleResultCSV.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  elementGridLabel     : getMessage('elementGridLabel'),
  elementSelectedLabel : getMessage('elementSelectedLabel'),
  copyElemInfoDesc     : getMessage('copyElemInfoDesc'),
  elementLabel         : getMessage('elementLabel'),
  resultLabel          : getMessage('resultLabel'),
  positionAbbrev       : getMessage('positionAbbrev'),
  positionLabel        : getMessage('positionLabel'),
  domPositionLabel     : getMessage('domPositionLabel'),
  actionLabel          : getMessage('actionLabel'),
  notApplicableLabel   : getMessage('notApplicableLabel'),
  manualCheckLabel     : getMessage('manualCheckLabel'),
  passedLabel          : getMessage('passedLabel'),
  violationLabel       : getMessage('violationLabel'),
  warningLabel         : getMessage('warningLabel'),
  noResultsMsg         : getMessage('noResultsMsg'),
  noViolationsWarningsMCResultsMsg : getMessage('noViolationsWarningsMCResultsMsg')
};

export default class ViewRuleResult {
  constructor(id, handleRowSelection) {

    this.handleRowSelection = handleRowSelection;

    this.ruleResultDiv = document.getElementById(id);
    this.elementSummary = document.createElement('element-summary');
    this.ruleResultDiv.appendChild(this.elementSummary);

    // Add heading for the element result details
    let h2 = document.createElement('h2');
    h2.className = 'grid';
    h2.id = "grid-label"; // referenced by element result-grid custom element
    h2.textContent = msg.elementGridLabel;
    this.ruleResultDiv.appendChild(h2);

    this.elementResultGrid = document.createElement('result-grid');
    this.elementResultGrid.addClassNameToTable('rule');
    this.elementResultGrid.setRowSelectionEventHandler(this.onRowSelectionCallback.bind(this));
    this.ruleResultDiv.appendChild(this.elementResultGrid);

    // Create container DIV with heading for element information
    const middleSectionDiv = document.createElement('div');
    middleSectionDiv.className = 'middle-section';
    this.ruleResultDiv.appendChild(middleSectionDiv);

    // Add highlight select box
    this.highlightSelect = document.createElement('highlight-select');
    this.highlightSelect.setChangeEventCallback(this.onSelectChangeCallback.bind(this));
    middleSectionDiv.appendChild(this.highlightSelect);

    // Create container DIV with header and copy button
    const elemInfoHeaderDiv = document.createElement('div');
    elemInfoHeaderDiv.className = 'info-header';
    middleSectionDiv.appendChild(elemInfoHeaderDiv);

    // Add heading for the element result details
    h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.id = "elem-info-label";  // referenced by result-element-info custom element
    h2.textContent = msg.elementSelectedLabel;
    elemInfoHeaderDiv.appendChild(h2);

    this.resultElementInfo = document.createElement('result-element-info');
    this.ruleResultDiv.appendChild(this.resultElementInfo);

    // Add copy element result details button
    this.elemCopyButton = document.createElement('copy-button');
    this.elemCopyButton.setGetTextFunct(this.resultElementInfo.getText.bind(this.resultElementInfo));
    this.elemCopyButton.title = msg.copyElemInfoDesc;
    elemInfoHeaderDiv.appendChild(this.elemCopyButton);

    this.elementResults = {};
    this.detailsActions = {};

    this.json = '{}';

    this.initGrid();

  }

  toCSV (options, title, location) {
    let viewCSV = new ViewRuleResultCSV(this.detailsAction, this.elementResults);
    return viewCSV.getCSV(options, title, location);
  }

  toJSON () {
    return this.json;
  }

  resize (mainHeight) {
    const adjustment = 126;
    const highlightHeight = this.highlightSelect.offsetHeight;
    const h = (mainHeight - highlightHeight - adjustment) / 2;

    this.elementResultGrid.resize(h);
    this.resultElementInfo.resize(h);
  }

  initGrid () {
    this.elementResultGrid.addHeaderCell(msg.elementLabel, 'element-info');
    this.elementResultGrid.addHeaderCell(msg.resultLabel, 'result');
    this.elementResultGrid.addHeaderCell(msg.positionAbbrev, 'position', msg.positionLabel);
    this.elementResultGrid.addHeaderCell(msg.actionLabel, 'action');
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

  getResultAccessibleName (result) {
    let accName = msg.notApplicableLabel;

    switch (result){
      case 'MC':
        accName = msg.manualCheckLabel;
        break;
      case 'P':
        accName = msg.passedLabel;
        break;
      case 'V':
        accName = msg.violationLabel;
        break;
      case 'W':
        accName = msg.warningLabel;
        break;
      default:
        break;
    }
    return accName;
  }

  update (infoRuleResult) {
    let i, id, pos, row, er, rowId, style, sortValue, label, rowAccName, cellAccName = '', elemName;
    let count = 0;

    this.elementResultGrid.enable();

    this.elementsResults = {};

    this.elementSummary.violations   = infoRuleResult.violations;
    this.elementSummary.warnings     = infoRuleResult.warnings;
    this.elementSummary.manualChecks = infoRuleResult.manual_checks;
    this.elementSummary.passed       = infoRuleResult.passed;
    this.elementSummary.hidden       = infoRuleResult.hidden;

    this.json = infoRuleResult.json;

    this.detailsAction = infoRuleResult.detailsAction;

    this.elementResultGrid.deleteDataRows();

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleResult.elementResults.length; i += 1) {
        er = infoRuleResult.elementResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(er.result) > 0)) {

          rowId = this.getRowId(er.position);

          // convert JSON strings to objects
          if (er.accNameInfo) {
            er.accNameInfo = JSON.parse(er.accNameInfo);
          }

          if (er.ccrInfo) {
            er.ccrInfo = JSON.parse(er.ccrInfo);
          }

          if (er.visibilityInfo) {
            er.visibilityInfo = JSON.parse(er.visibilityInfo);
          }

          if (er.htmlAttrInfo) {
            er.htmlAttrInfo = JSON.parse(er.htmlAttrInfo);
          }

          if (er.ariaAttrInfo) {
            er.ariaAttrInfo = JSON.parse(er.ariaAttrInfo);
          }

          // Save element result object
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
          cellAccName = msg.domPositionLabel + ' ' + er.position;
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
        id = this.elementResultGrid.setSelectedRowUsingLastId();
        this.resultElementInfo.update(this.elementResults[id]);
      } else {
        if (infoRuleResult.elementResults.length === 0) {
          label = msg.noResultsMsg;
        } else {
          label = msg.noViolationsWarningsMCResultsMsg;
        }
        this.elementResultGrid.deleteDataRows(label);
        this.resultElementInfo.clear(label);
      }
      this.elementResultGrid.setSelectedRowUsingLastId();
      this.elementResultGrid.focus();
    });
  }

  clear (message1, message2) {
    this.elementResultGrid.disable();
    this.elementResultGrid.deleteDataRows(message1, message2);
    this.resultElementInfo.clear(message1, message2);
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
