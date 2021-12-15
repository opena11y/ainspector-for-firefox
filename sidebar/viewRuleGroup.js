
const getMessage = browser.i18n.getMessage;

import { getOptions } from '../storage.js';

export default class ViewRuleGroup {
  constructor(id, handleRowActivation) {
    let div, h2;

    this.ruleGroupNode     = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.ruleGroupNode.appendChild(this.resultSummary);

    this.ruleResultGrid = document.createElement('result-grid');
    this.ruleResultGrid.setRowActivationEventHandler(handleRowActivation);
    this.ruleResultGrid.setRowSelectionEventHandler(this.handleRowSelection.bind(this));
    this.ruleResultGrid.addClassNameToTable('group');
    this.ruleGroupNode.appendChild(this.ruleResultGrid);

    // Create container DIV with heading for rule information
    div = document.createElement('div');
    div.className = 'rule-info';
    this.ruleGroupNode.appendChild(div);

    h2 = document.createElement('h2');
    h2.className = 'selected-rule';
    h2.textContent = getMessage('ruleSelectedLabel');
    div.appendChild(h2);

    this.resultRuleInfo = document.createElement('result-rule-info');
    div.appendChild(this.resultRuleInfo);

    this.detailsActions = {};

    this.initGrid();
  }

  initGrid () {

    this.ruleResultGrid.addHeaderCell(getMessage('ruleLabel'), 'rule text');
    this.ruleResultGrid.addHeaderCell(getMessage('resultLabel'), 'result', '');
    this.ruleResultGrid.addHeaderCell(getMessage('successCriteriaAbbrev'), 'sc', getMessage('successCriteriaLabel'));
    this.ruleResultGrid.addHeaderCell(getMessage('levelLabel'), 'level', '');
    this.ruleResultGrid.addHeaderCell(getMessage('requiredAbbrev'), 'required', getMessage('requiredLabel'));

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
      default:
        break;
    }
    return style;
  }

  // returns a number for the sorting the result value
  getResultSortingValue(result) {
    return ['', 'N/A', 'P', 'MC', 'W', 'V'].indexOf(result);
  }

  // returns a number used for representing SC for sorting
  getSCSortingValue(sc) {
    let parts = sc.split('.');
    let p = parseInt(parts[0]);
    let g = parseInt(parts[1]);
    let s = parseInt(parts[2]);
    return (p * 10000 + g * 100 + s) * -1;
  }

  // returns a number used for representing level value for sorting
  getLevelSortingValue(level) {
    return ['', 'AAA', 'AA', 'A'].indexOf(level);
  }

  // returns a number used for representing required value for sorting
  getRequiredSortingValue(required) {
    return required ? 2 : 1;
  }

  update (infoRuleGroup) {
    let i, rr, row, style, value, sortValue;

    this.detailsActions = {};

    this.resultSummary.violations   = infoRuleGroup.violations;
    this.resultSummary.warnings     = infoRuleGroup.warnings;
    this.resultSummary.manualChecks = infoRuleGroup.manual_checks;
    this.resultSummary.passed       = infoRuleGroup.passed;

    this.ruleResultGrid.deleteDataRows();

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleGroup.ruleResults.length; i += 1) {
        rr = infoRuleGroup.ruleResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(rr.result) > 0)) {

          row = this.ruleResultGrid.addRow(rr.ruleId);

          this.ruleResultGrid.addDataCell(row, rr.summary, 'rule text');

          style = 'result ' + this.getResultStyle(rr.result);
          sortValue = this.getResultSortingValue(rr.result);
          this.ruleResultGrid.addDataCell(row, rr.result, style, sortValue);

          sortValue = this.getSCSortingValue(rr.wcag);
          this.ruleResultGrid.addDataCell(row, rr.wcag, 'sc', sortValue);

          sortValue = this.getLevelSortingValue(rr.level);
          this.ruleResultGrid.addDataCell(row, rr.level, 'level', sortValue);

          value = rr.required ? getMessage('requiredValue') : '';
          sortValue = this.getRequiredSortingValue(rr.required);
          this.ruleResultGrid.addDataCell(row, value, 'required', sortValue);

          this.detailsActions[rr.ruleId] = Object.assign(rr.detailsAction);
        }
      }
      this.ruleResultGrid.sortGridByColumn(2, 4, 3, 'descending');
      const id = this.ruleResultGrid.setSelectedRowUsingLastId();
      console.log('[update][id]: ' + id);
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
    })
  }

  clear () {
    this.resultSummary.clear();
    this.ruleResultGrid.deleteDataRows();
    this.resultRuleInfo.clear();
  }

  handleRowSelection (id) {
    if (id) {
      this.resultRuleInfo.update(this.detailsActions[id]);
    }
  }

}
