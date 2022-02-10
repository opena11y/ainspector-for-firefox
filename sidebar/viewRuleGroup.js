/* viewRuleGroup.js */
const getMessage = browser.i18n.getMessage;

import { getOptions } from '../storage.js';
import ViewRuleGroupCSV  from './viewRuleGroupCSV.js';

export default class ViewRuleGroup {
  constructor(id, handleRowActivation) {

    this.handleRowActivation = handleRowActivation;

    this.ruleGroupDiv = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.ruleGroupDiv.appendChild(this.resultSummary);

    // Add heading for the rule result details
    this.gridH2 = document.createElement('h2');
    this.gridH2.className = 'grid';
    this.gridH2.id = "grid-label"; // referenced by element result-grid custom element
    this.gridH2.textContent = getMessage('ruleCategoryResultGridLabel');
    this.ruleGroupDiv.appendChild(this.gridH2);


    this.ruleResultGrid = document.createElement('result-grid');
    this.ruleResultGrid.setRowActivationEventHandler(handleRowActivation);
    this.ruleResultGrid.setRowSelectionEventHandler(this.handleRowSelection.bind(this));
    this.ruleResultGrid.addClassNameToTable('group');
    this.ruleGroupDiv.appendChild(this.ruleResultGrid);

    // Create container DIV with heading for rule information
    const div = document.createElement('div');
    div.className = 'rule-info';
    this.ruleGroupDiv.appendChild(div);

    const middleSectionDiv = document.createElement('div');
    middleSectionDiv.className = 'middle-section';
    div.appendChild(middleSectionDiv);

    const detailsButton = document.createElement('button');
    detailsButton.id = 'rule-group-details';
    detailsButton.className = 'details';
    detailsButton.textContent = getMessage('detailsLabel');
    detailsButton.addEventListener('click', this.onDetailsButtonClick.bind(this));
    this.ruleResultGrid.setDetailsButton(detailsButton);
    middleSectionDiv.appendChild(detailsButton);

    // Create container DIV with header and copy button
    const ruleInfoHeaderDiv = document.createElement('div');
    ruleInfoHeaderDiv.className = 'info-header';
    middleSectionDiv.appendChild(ruleInfoHeaderDiv);

    const h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.id = 'rule-info-label';
    h2.textContent = getMessage('ruleSelectedLabel');
    ruleInfoHeaderDiv.appendChild(h2);

    this.resultRuleInfo = document.createElement('result-rule-info');

    this.copyButton = document.createElement('copy-button');
    this.copyButton.setGetTextFunct(this.resultRuleInfo.getText.bind(this.resultRuleInfo));
    this.copyButton.title = getMessage('copyRuleInfoDesc');
    ruleInfoHeaderDiv.appendChild(this.copyButton);

    div.appendChild(this.resultRuleInfo);

    this.groupTitle = 'Rule Group';
    this.ruleResults = [];
    this.detailsActions = {};

    this.json = '{}';

    this.initGrid();
  }

  initGrid () {

    this.ruleResultGrid.addHeaderCell(getMessage('ruleLabel'), 'rule');
    this.ruleResultGrid.addHeaderCell(getMessage('resultLabel'), 'result', '');
    this.ruleResultGrid.addHeaderCell(getMessage('successCriteriaAbbrev'), 'sc', getMessage('successCriteriaLabel'));
    this.ruleResultGrid.addHeaderCell(getMessage('levelLabel'), 'level', '');
    this.ruleResultGrid.addHeaderCell(getMessage('requiredAbbrev'), 'required', getMessage('requiredLabel'));

  }

  toCSV (options, title, location) {
    let viewCSV = new ViewRuleGroupCSV(this.groupTitle, this.ruleResults, this.detailsActions);
    return viewCSV.getCSV(options, title, location);
  }

  toJSON () {
    return this.json;
  }

  resize (size) {
    const adjustment = 100;
    const ruleSummaryHeight = this.resultSummary.offsetHeight;
    const h = (size - ruleSummaryHeight - adjustment) / 2;

    this.ruleResultGrid.resize(h);
    this.resultRuleInfo.resize(h);
  }

  getResultStyle (result) {
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
      default:
        break;
    }
    return style;
  }

  // returns a number for the sorting the result value
  getResultSortingValue (result) {
    return ['', 'N/A', 'P', 'MC', 'W', 'V'].indexOf(result);
  }

  // returns a number used for representing SC for sorting
  getSCSortingValue (sc) {
    let parts = sc.split('.');
    let p = parseInt(parts[0]);
    let g = parseInt(parts[1]);
    let s = parseInt(parts[2]);
    return (p * 10000 + g * 100 + s) * -1;
  }

  // returns a number used for representing level value for sorting
  getLevelSortingValue (level) {
    return ['', 'AAA', 'AA', 'A'].indexOf(level);
  }

  // returns a number used for representing required value for sorting
  getRequiredSortingValue (required) {
    return required ? 2 : 1;
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

  update (infoRuleGroup) {
    let i, rr, row, style, value, sortValue, rowAccName, cellAccName, label;
    let count = 0;

    this.ruleResultGrid.enable();
    this.detailsActions = {};

    this.resultSummary.violations   = infoRuleGroup.violations;
    this.resultSummary.warnings     = infoRuleGroup.warnings;
    this.resultSummary.manualChecks = infoRuleGroup.manual_checks;
    this.resultSummary.passed       = infoRuleGroup.passed;

    this.json = infoRuleGroup.json;

    this.ruleResultGrid.deleteDataRows();

    this.groupTitle = infoRuleGroup.groupLabel;
    this.ruleResults = infoRuleGroup.ruleResults;

    if (infoRuleGroup.groupType === 'gl') {
      this.gridH2.textContent = getMessage('guidelineResultGridLabel');
    } else {
      this.gridH2.textContent = getMessage('ruleCategoryResultGridLabel');
    }

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleGroup.ruleResults.length; i += 1) {
        rr = infoRuleGroup.ruleResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(rr.result) > 0)) {

          row = this.ruleResultGrid.addRow(rr.ruleId);

          cellAccName = rr.summary;
          this.ruleResultGrid.addDataCell(row, rr.summary, cellAccName, 'rule');

          rowAccName = cellAccName;

          style = 'result ' + this.getResultStyle(rr.result);
          sortValue = this.getResultSortingValue(rr.result);
          cellAccName = this.getResultAccessibleName(rr.result);
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.result, cellAccName, style, sortValue);

          sortValue = this.getSCSortingValue(rr.wcag);
          cellAccName = getMessage('successCriteriaLabel') + ' ' + rr.wcag;
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.wcag, cellAccName, 'sc', sortValue);

          sortValue = this.getLevelSortingValue(rr.level);
          cellAccName = rr.level === 'A' ? getMessage('singleALabel') : getMessage('doubleALabel');
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.level, cellAccName, 'level', sortValue);

          value = rr.required ? getMessage('requiredValue') : '';
          sortValue = this.getRequiredSortingValue(rr.required);
          cellAccName = rr.required ? getMessage('requiredLabel') : '';
          rowAccName += rr.required ? ', ' + cellAccName : '';
          this.ruleResultGrid.addDataCell(row, value, cellAccName, 'required', sortValue);

          row.setAttribute('aria-label', rowAccName);

          this.detailsActions[rr.ruleId] = Object.assign(rr.detailsAction);
          count += 1;
        }
      }

      if (count) {
        this.ruleResultGrid.sortGridByColumn(2, 4, 3, 'descending');
        const id = this.ruleResultGrid.setSelectedRowUsingLastId();

        // Update the rule details/actions section
        if (id) {
          const detailsActions = this.detailsActions[id];
          if (detailsActions) {
            this.resultRuleInfo.update(detailsActions);
          } else {
            this.resultRuleInfo.update(this.ruleResultGrid.getFirstDataRowId());
          }
        } else {
          this.resultRuleInfo.update(this.ruleResultGrid.getFirstDataRowId());
        }
      } else {
        if (infoRuleGroup.ruleResults.length === 0) {
          label = getMessage('noResultsMsg');
        } else {
          label = getMessage('noViolationsWarningsMCResultsMsg');
        }
        this.ruleResultGrid.addMessageRow(label);
        this.resultRuleInfo.clear(label);
      }

      this.ruleResultGrid.focus();
    })
  }

  clear (message1, message2) {
    this.ruleResults = [];
    this.detailsActions = {};
    this.groupTitle = '';

    this.ruleResultGrid.disable();
    this.resultSummary.clear();
    this.ruleResultGrid.deleteDataRows(message1, message2);
    this.resultRuleInfo.clear(message1, message2);
  }

  handleRowSelection (id) {
    if (id) {
      this.resultRuleInfo.update(this.detailsActions[id]);
    }
  }

  onDetailsButtonClick () {
    let rowId = this.ruleResultGrid.getSelectedRowId();
    if (this.handleRowActivation && rowId) {
      this.handleRowActivation(rowId);
    }
  }
}
