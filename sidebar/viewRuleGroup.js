/* viewRuleGroup.js */
import { getResultSortingValue, getSCSortingValue, getLevelSortingValue, getRequiredSortingValue } from './sortUtils.js';
import { getOptions } from '../storage.js';
import ViewRuleGroupCSV  from './viewRuleGroupCSV.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  ruleResultsGridLabel  : getMessage('ruleResultsGridLabel'),
  detailsLabel          : getMessage('detailsLabel'),
  ruleSelectedLabel     : getMessage('ruleSelectedLabel'),
  copyRuleInfoDesc      : getMessage('copyRuleInfoDesc'),
  ruleLabel             : getMessage('ruleLabel'),
  resultLabel           : getMessage('resultLabel'),
  successCriteriaAbbrev : getMessage('successCriteriaAbbrev'),
  successCriteriaLabel  : getMessage('successCriteriaLabel'),
  levelLabel            : getMessage('levelLabel'),
  requiredAbbrev        : getMessage('requiredAbbrev'),
  requiredLabel         : getMessage('requiredLabel'),
  notApplicableLabel    : getMessage('notApplicableLabel'),
  manualCheckLabel      : getMessage('manualCheckLabel'),
  passedLabel           : getMessage('passedLabel'),
  violationLabel        : getMessage('violationLabel'),
  warningLabel          : getMessage('warningLabel'),
  singleALabel          : getMessage('singleALabel'),
  doubleALabel          : getMessage('doubleALabel'),
  requiredValue         : getMessage('requiredValue'),
  noResultsMsg          : getMessage('noResultsMsg'),
  noViolationsWarningsMCResultsMsg : getMessage('noViolationsWarningsMCResultsMsg')
};

export default class ViewRuleGroup {
  constructor(id, handleRowActivation) {

    this.handleRowActivation = handleRowActivation;

    this.ruleGroupDiv = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.ruleGroupDiv.appendChild(this.resultSummary);

    // Add heading for the rule result details
    let h2 = document.createElement('h2');
    h2.className = 'grid';
    h2.id = "grid-label"; // referenced by element result-grid custom element
    h2.textContent = msg.ruleResultsGridLabel;
    this.ruleGroupDiv.appendChild(h2);


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
    detailsButton.textContent = msg.detailsLabel;
    detailsButton.addEventListener('click', this.onDetailsButtonClick.bind(this));
    this.ruleResultGrid.setDetailsButton(detailsButton);
    middleSectionDiv.appendChild(detailsButton);

    // Create container DIV with header and copy button
    const ruleInfoHeaderDiv = document.createElement('div');
    ruleInfoHeaderDiv.className = 'info-header';
    middleSectionDiv.appendChild(ruleInfoHeaderDiv);

    h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.id = 'rule-info-label';
    h2.textContent = msg.ruleSelectedLabel;
    ruleInfoHeaderDiv.appendChild(h2);

    this.resultRuleInfo = document.createElement('result-rule-info');

    this.copyButton = document.createElement('copy-button');
    this.copyButton.setGetTextFunct(this.resultRuleInfo.getText.bind(this.resultRuleInfo));
    this.copyButton.title = msg.copyRuleInfoDesc;
    ruleInfoHeaderDiv.appendChild(this.copyButton);

    div.appendChild(this.resultRuleInfo);

    this.groupTitle = 'Rule Group';
    this.ruleResults = [];
    this.detailsActions = {};
    this.groupType = 'rc';
    this.isAllRules = false;

    this.json = '{}';

    this.initGrid();
  }

  initGrid () {

    this.ruleResultGrid.addHeaderCell(msg.ruleLabel, 'rule');
    this.ruleResultGrid.addHeaderCell(msg.resultLabel, 'result', '');
    this.ruleResultGrid.addHeaderCell(msg.successCriteriaAbbrev, 'sc', msg.successCriteriaLabel);
    this.ruleResultGrid.addHeaderCell(msg.levelLabel, 'level', '');
    this.ruleResultGrid.addHeaderCell(msg.requiredAbbrev, 'required', msg.requiredLabel);

  }

  toCSV (options, title, location) {
    let viewCSV = new ViewRuleGroupCSV(this.groupType, this.groupTitle, this.ruleResults, this.detailsActions, this.isAllRules);
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

    this.groupType = infoRuleGroup.groupType;
    this.isAllRules = infoRuleGroup.ruleResults.length > 60;

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
          sortValue = getResultSortingValue(rr.result);
          cellAccName = this.getResultAccessibleName(rr.result);
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.result, cellAccName, style, sortValue);

          sortValue = getSCSortingValue(rr.wcag);
          cellAccName = msg.successCriteriaLabel + ' ' + rr.wcag;
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.wcag, cellAccName, 'sc', sortValue);

          sortValue = getLevelSortingValue(rr.level);
          cellAccName = rr.level === 'A' ? msg.singleALabel : msg.doubleALabel;
          rowAccName += ', ' + cellAccName;
          this.ruleResultGrid.addDataCell(row, rr.level, cellAccName, 'level', sortValue);

          value = rr.required ? msg.requiredValue : '';
          sortValue = getRequiredSortingValue(rr.required);
          cellAccName = rr.required ? msg.requiredLabel : '';
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
          label = msg.noResultsMsg;
        } else {
          label = msg.noViolationsWarningsMCResultsMsg;
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
