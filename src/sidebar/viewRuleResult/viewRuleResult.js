/* viewRuleResult.js */

import { getOptions }      from '../../storage.js';
import { getResultStyle }  from '../utils.js';
import ViewRuleResultCSV   from './viewRuleResultCSV.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  actionLabel          : getMessage('actionLabel'),
  copyElemInfoDesc     : getMessage('copyElemInfoDesc'),
  elementGridLabel     : getMessage('elementGridLabel'),
  elementLabel         : getMessage('elementLabel'),
  elementSelectedLabel : getMessage('elementSelectedLabel'),
  manualCheckLabel     : getMessage('manualCheckLabel'),
  noResultsMsg         : getMessage('noResultsMsg'),
  noViolationsWarningsMCResultsMsg : getMessage('noViolationsWarningsMCResultsMsg'),
  notApplicableLabel   : getMessage('notApplicableLabel'),
  passedLabel          : getMessage('passedLabel'),
  positionAbbrev       : getMessage('positionAbbrev'),
  positionLabel        : getMessage('positionLabel'),
  resultLabel          : getMessage('resultLabel'),
  ruleResultsLabel     : getMessage('ruleResultsLabel'),
  violationLabel       : getMessage('violationLabel'),
  warningLabel         : getMessage('warningLabel')
};

export default class ViewRuleResult {
  // The id is a reference to a DIV element used as the container
  // for the element results view content
  constructor(id, handleRowSelection, rerunEvaluationScopeAll) {

    this.handleRowSelection = handleRowSelection;

    this.containerDiv = document.getElementById(id);
    this.elementSummary = document.createElement('rule-result-summary');
    this.containerDiv.appendChild(this.elementSummary);

    this.scopeFilter = document.createElement('scope-filter');
    this.scopeFilter.setCallBack(rerunEvaluationScopeAll);
    this.containerDiv.appendChild(this.scopeFilter);

    // Add heading for the element result details
    this.gridH2 = document.createElement('h2');
    this.gridH2.className = 'grid';
    this.gridH2.id = "grid-label"; // referenced by element result-grid custom element
    this.gridH2.textContent = msg.ruleResultsLabel;
    this.containerDiv.appendChild(this.gridH2);

    this.elementResultGrid = document.createElement('result-grid');

    this.elementResultGrid.addClassNameToTable('rule');
    this.elementResultGrid.setRowSelectionEventHandler(this.onRowSelectionCallback.bind(this));
    this.containerDiv.appendChild(this.elementResultGrid);

    // Create container DIV with heading for element information
    this.middleSectionDiv = document.createElement('div');
    this.middleSectionDiv.className = 'middle-section';
    this.containerDiv.appendChild(this.middleSectionDiv);

    // Add highlight select box
    this.highlightSelect = document.createElement('highlight-select');
    this.highlightSelect.setChangeEventCallback(this.onSelectChangeCallback.bind(this));
    this.middleSectionDiv.appendChild(this.highlightSelect);

    // Create container DIV with header and copy button
    const elemInfoHeaderDiv = document.createElement('div');
    elemInfoHeaderDiv.className = 'info-header';
    this.middleSectionDiv.appendChild(elemInfoHeaderDiv);

    // Add heading for the element result details
    this.infoH2 = document.createElement('h2');
    this.infoH2.className = 'selected';
    this.infoH2.id = "elem-info-label";  // referenced by result-element-info custom element
    this.infoH2.textContent = msg.elementSelectedLabel;
    elemInfoHeaderDiv.appendChild(this.infoH2);

    this.ruleResultInfo = document.createElement('rule-result-info');
    this.containerDiv.appendChild(this.ruleResultInfo);

    // Add copy element result details button
    this.elemCopyButton = document.createElement('copy-button');
    this.elemCopyButton.setGetTextFunct(this.ruleResultInfo.getText.bind(this.ruleResultInfo));
    this.elemCopyButton.title = msg.copyElemInfoDesc;
    elemInfoHeaderDiv.appendChild(this.elemCopyButton);

    this.elementResults = {};
    this.detailsActions = {};

    this.json = '{}';

    this.initGrid();

  }

  toCSV (options, title, location, rulesetLabel) {
    let viewCSV = new ViewRuleResultCSV(this.detailsAction, this.elementResults, this.elementSummary);
    return viewCSV.getCSV(options, title, location, rulesetLabel);
  }

  toJSON () {
    return this.json;
  }

  initGrid () {
    this.elementResultGrid.addHeaderCell(msg.elementLabel, 'element-info');
    this.elementResultGrid.addHeaderCell(msg.resultLabel, 'result');
    this.elementResultGrid.addHeaderCell(msg.positionAbbrev, 'position', msg.positionLabel);
    this.elementResultGrid.addHeaderCell(msg.actionLabel, 'action');
  }

  // returns a number for the sorting the result value
  getResultSortingValue(result) {
    return ['', 'H', 'P', 'MC', 'W', 'V'].indexOf(result);
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

  update (infoRuleResult, scopeFilter) {
    let i, id, pos, row, er, rowId, style, sortValue, label, rowAccName, cellAccName = '', elemName;
    let count = 0;

    this.elementResultGrid.enable();

    this.elementResults = {};

    this.elementSummary.violations   = infoRuleResult.violations;
    this.elementSummary.warnings     = infoRuleResult.warnings;
    this.elementSummary.manualChecks = infoRuleResult.manual_checks;
    this.elementSummary.passed       = infoRuleResult.passed;
    this.elementSummary.hidden       = infoRuleResult.hidden;

    this.scopeFilter.value  = scopeFilter;

    this.ruleResult = infoRuleResult.ruleResult;

    this.json = infoRuleResult.json;

    this.detailsAction = infoRuleResult.detailsAction;

    this.elementResultGrid.updateHeaderCell(msg.elementLabel, 'element-info');

    this.elementResultGrid.deleteDataRows();

    getOptions().then( (options) => {

      const or = infoRuleResult.otherResult;

      // Check for Page or Website result
      if (or && 
          (options.resultsIncludePassNa ||
          (['', 'V', 'W', 'MC'].indexOf(or.result) > 0))) {

//          rowId = this.getRowId(or.otherName);
          rowId = or.resultId;

          // Save element result object
          this.elementResults[rowId] = or;
          row = this.elementResultGrid.addRow(rowId);

          rowAccName = or.otherName;
          this.elementResultGrid.addDataCell(row, or.otherName, '', 'element-info');

          // Add result information cell (column 2)
          style = 'result ' + getResultStyle(or.result);
          sortValue = this.getResultSortingValue(or.result);
          cellAccName = this.getResultAccessibleName(or.result);
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, or.result, cellAccName, style, sortValue);

          // Add position information cell (column 3)
          this.elementResultGrid.addDataCell(row, '', '', 'position', 0);

          // Add action information cell (column 4)
          rowAccName += ', ' + or.actionMessage;
          this.elementResultGrid.addDataCell(row, or.actionMessage, '', 'action');
          row.setAttribute('aria-label', rowAccName);

          count += 1;

      }

      for (i = 0; i < infoRuleResult.elementResults.length; i += 1) {
        er = infoRuleResult.elementResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(er.result) > 0)) {

//          rowId = this.getRowId(er.position);
          rowId = er.resultId;

          // convert JSON strings to objects
          if (er.accNameInfo) {
            er.accNameInfo = JSON.parse(er.accNameInfo);
          }

          if (er.ccrInfo) {
            er.ccrInfo = JSON.parse(er.ccrInfo);
          }

          if (er.tableCellInfo) {
            er.tableCellInfo = JSON.parse(er.tableCellInfo);
          }

          if (er.tableInfo) {
            er.tableInfo = JSON.parse(er.tableInfo);
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
            elemName = er.tagName + er.id + er.className;
          }

          rowAccName = elemName + ' ' + msg.elementLabel;
          this.elementResultGrid.addDataCell(row, elemName, '', 'element-info');

          // Add result information cell (column 2)
          style = 'result ' + getResultStyle(er.result);
          sortValue = this.getResultSortingValue(er.result);
          cellAccName = this.getResultAccessibleName(er.result);
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, er.result, cellAccName, style, sortValue);

          // Add position information cell (column 3)
          rowAccName += ', ' + msg.positionLabel + ' ' + er.position;
          this.elementResultGrid.addDataCell(row, er.position, '', 'position', (-1 * er.position));

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
        this.ruleResultInfo.update(this.elementResults[id], this.ruleResult);
      } else {
        if (infoRuleResult.elementResults.length === 0) {
          label = msg.noResultsMsg;
        } else {
          label = msg.noViolationsWarningsMCResultsMsg;
        }
        this.elementResultGrid.deleteDataRows(label);
        this.ruleResultInfo.clear(label);
      }
      this.elementResultGrid.setSelectedRowUsingLastId();
      this.elementResultGrid.focus();
    });
  }

  clear (message1 = '', message2 = '') {
    this.elementResultGrid.disable();
    this.elementResultGrid.deleteDataRows(message1, message2);
    this.ruleResultInfo.clear(message1, message2);
  }

  getPositionFromResultId(resultId) {
    const parts = resultId.split('-');
    if (parts.length === 3) {
      return parseInt(parts[2]);
    }
    return '';
  }

  onRowSelectionCallback (resultId) {
    if (resultId) {
      this.ruleResultInfo.update(this.elementResults[resultId], this.ruleResult);
      this.handleRowSelection(resultId);
    }
  }

  onSelectChangeCallback () {
    let id = this.elementResultGrid.getSelectedRowId();
    if (id) {
      this.onRowSelectionCallback(id);
    }
  }

  resizeView (height) {

    const elementSummaryRect = this.elementSummary.getBoundingClientRect();
    const scopeFilterRect = this.scopeFilter.getBoundingClientRect();
    const gridH2Rect      = this.gridH2.getBoundingClientRect();
    const midSectDivRect  = this.middleSectionDiv.getBoundingClientRect();

//    console.log(`[RuleResult]         summary: ${elementSummaryRect.height}`);
//    console.log(`[RuleResult]          filter: ${scopeFilterRect.height};`);
//    console.log(`[RuleResult]              h2: ${gridH2Rect.height}`);
//    console.log(`[RuleResult]          middle: ${midSectDivRect.height}`);

    const availableHeight = height -
                            elementSummaryRect.height -
                            (2.5 * scopeFilterRect.height) -
                            (2 * gridH2Rect.height) -
                            midSectDivRect.height;

//    console.log(`[RuleResult] availableHeight: ${availableHeight}`);

    this.elementResultGrid.setHeight(availableHeight * 0.4)
    this.ruleResultInfo.setHeight(availableHeight * 0.6);

  }
}
