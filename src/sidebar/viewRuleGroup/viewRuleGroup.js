/* viewRuleGroup.js */
import { 
  getResultSortingValue, 
  getSCSortingValue, 
  getLevelSortingValue, 
  getRequiredSortingValue 
} from '../sortUtils.js';

import { getResultStyle }  from '../utils.js';
import { getOptions }      from '../../storage.js';
import ViewRuleGroupCSV  from './viewRuleGroupCSV.js';

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  copyRuleInfoDesc      : getMessage('copyRuleInfoDesc'),
  detailsLabel          : getMessage('detailsLabel'),
  doubleALabel          : getMessage('doubleALabel'),
  guidelineGridLabel    : getMessage('guidelineGridLabel'),
  levelLabel            : getMessage('levelLabel'),
  manualCheckLabel      : getMessage('manualCheckLabel'),
  noResultsMsg          : getMessage('noResultsMsg'),
  noViolationsWarningsMCResultsMsg : getMessage('noViolationsWarningsMCResultsMsg'),
  notApplicableLabel    : getMessage('notApplicableLabel'),
  passedLabel           : getMessage('passedLabel'),
  resultLabel           : getMessage('resultLabel'),
  requiredAbbrev        : getMessage('requiredAbbrev'),
  requiredLabel         : getMessage('requiredLabel'),
  requiredValue         : getMessage('requiredValue'),
  ruleCategoryGridLabel : getMessage('ruleCategoryGridLabel'),
  ruleResultsGridLabel  : getMessage('ruleResultsGridLabel'),
  ruleScopeGridLabel    : getMessage('ruleScopeGridLabel'),
  ruleSelectedLabel     : getMessage('ruleSelectedLabel'),
  ruleLabel             : getMessage('ruleLabel'),
  singleALabel          : getMessage('singleALabel'),
  successCriteriaAbbrev : getMessage('successCriteriaAbbrev'),
  successCriteriaLabel  : getMessage('successCriteriaLabel'),
  violationLabel        : getMessage('violationLabel'),
  warningLabel          : getMessage('warningLabel')
};

export default class ViewRuleGroup {
  // The id is a reference to a DIV element used as the contaner
  // for the rule results view content
  constructor(id, handleRowActivation, rerunEvaluationScopeAll) {

    this.handleRowActivation = handleRowActivation;

    this.containerDiv = document.getElementById(id);
    this.ruleSummary = document.createElement('rule-group-summary');
    this.containerDiv.appendChild(this.ruleSummary);

    this.scopeFilter = document.createElement('scope-filter');
    this.scopeFilter.setCallBack(rerunEvaluationScopeAll);
    this.containerDiv.appendChild(this.scopeFilter);

    // Add heading for the rule result details
    this.gridLabelH2 = document.createElement('h2');
    this.gridLabelH2.className = 'grid';
    this.gridLabelH2.id = "grid-label"; // referenced by element result-grid custom element
    this.gridLabelH2.textContent = msg.ruleResultsGridLabel;
    this.containerDiv.appendChild(this.gridLabelH2);

    this.ruleResultGrid = document.createElement('result-grid');
    this.ruleResultGrid.setRowActivationEventHandler(handleRowActivation);
    this.ruleResultGrid.setRowSelectionEventHandler(this.handleRowSelection.bind(this));
    this.ruleResultGrid.addClassNameToTable('group');
    this.containerDiv.appendChild(this.ruleResultGrid);

    // Create container DIV with heading for rule information
    const div = document.createElement('div');
    div.className = 'rule-info';
    this.containerDiv.appendChild(div);

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

    const h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.id = 'rule-info-label';
    h2.textContent = msg.ruleSelectedLabel;
    ruleInfoHeaderDiv.appendChild(h2);

    this.ruleResultInfo = document.createElement('rule-group-rule-result-info');

    this.copyButton = document.createElement('copy-button');
    this.copyButton.setGetTextFunct(this.ruleResultInfo.getText.bind(this.ruleResultInfo));
    this.copyButton.title = msg.copyRuleInfoDesc;
    ruleInfoHeaderDiv.appendChild(this.copyButton);

    div.appendChild(this.ruleResultInfo);

    this.groupTitle = 'Rule Group';
    this.ruleResults = [];
    this.detailsActions = {};
    this.groupType = 'rc';
    this.groupId = '';

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

  toCSV (options, title, location, rulesetLabel) {
    let viewCSV = new ViewRuleGroupCSV(this.groupType, this.groupTitle, this.ruleResults, this.ruleSummary, this.groupId);
    return viewCSV.getCSV(options, title, location, rulesetLabel);
  }

  toJSON () {
    return this.json;
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

  update (infoRuleResults, groupId, scopeFilter) {
    let i, rr, row, style, value, sortValue, rowAccName, cellAccName, label;
    let count = 0;

    this.ruleResultGrid.enable();
    this.detailsActions = {};

    this.ruleSummary.violations   = infoRuleResults.violations;
    this.ruleSummary.warnings     = infoRuleResults.warnings;
    this.ruleSummary.manualChecks = infoRuleResults.manual_checks;
    this.ruleSummary.passed       = infoRuleResults.passed;

    this.scopeFilter.value  = scopeFilter;

    this.json = infoRuleResults.json;

    this.ruleResultGrid.deleteDataRows();

    this.groupTitle = infoRuleResults.groupLabel;
    this.ruleResults = infoRuleResults.ruleResults;

    this.groupType = infoRuleResults.groupType;
    this.groupId = groupId;

    if (this.groupType === 'gl') {
      this.gridLabelH2.textContent = msg.guidelinGridLabel;
    }
    else {
      if (this.groupType === 'rc') {
        this.gridLabelH2.textContent = msg.ruleCategoryGridLabel;
      }
      else {
        this.gridLabelH2.textContent = msg.ruleScopeGridLabel;
      }
    }

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleResults.ruleResults.length; i += 1) {
        rr = infoRuleResults.ruleResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(rr.result) > 0)) {

          row = this.ruleResultGrid.addRow(rr.ruleId);

          cellAccName = rr.summary;
          this.ruleResultGrid.addDataCell(row, rr.summary, cellAccName, 'rule');

          rowAccName = cellAccName;

          style = 'result ' + getResultStyle(rr.result);
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
            this.ruleResultInfo.update(detailsActions);
          } else {
            this.ruleResultInfo.update(this.ruleResultGrid.getFirstDataRowId());
          }
        } else {
          this.ruleResultInfo.update(this.ruleResultGrid.getFirstDataRowId());
        }
      } else {
        if (infoRuleResults.ruleResults.length === 0) {
          label = msg.noResultsMsg;
        } else {
          label = msg.noViolationsWarningsMCResultsMsg;
        }
        this.ruleResultGrid.addMessageRow(label);
        this.ruleResultInfo.clear(label);
      }

      this.ruleResultGrid.focus();
    })
  }

  clear (message1 = '', message2 = '') {
    this.ruleResults = [];
    this.detailsActions = {};
    this.groupTitle = '';

    this.ruleResultGrid.disable();
    this.ruleSummary.clear();
    this.ruleResultGrid.deleteDataRows(message1, message2);
    this.ruleResultInfo.clear(message1, message2);
  }

  handleRowSelection (id) {
    if (id) {
      this.ruleResultInfo.update(this.detailsActions[id]);
    }
  }

  onDetailsButtonClick () {
    let rowId = this.ruleResultGrid.getSelectedRowId();
    if (this.handleRowActivation && rowId) {
      this.handleRowActivation(rowId);
    }
  }

  resize () {
    console.log(`[     WindowHeight]: ${window.innerHeight}`);

    const containerRect = this.containerDiv.getBoundingClientRect();
    console.log(`[ container height]: ${containerRect.height} ${typeof containerRect.height}`);

    const gridRect = this.ruleResultGrid.getBoundingClientRect();
    console.log(`[      grid height]: ${gridRect.height} ${typeof gridRect.height}`);

    const infoRect = this.ruleResultInfo.getBoundingClientRect();
    console.log(`[      info height]: ${infoRect.height} ${typeof infoRect.height}`);

    const n = containerRect.height - gridRect.height;

    this.ruleResultInfo.setHeight(n);

  }
}
