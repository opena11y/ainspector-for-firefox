
const getMessage = browser.i18n.getMessage;

export default class viewGroup {
  constructor(id, handleRowActivation) {
    let div, h2;

    this.groupNode     = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.groupNode.appendChild(this.resultSummary);

    this.ruleResultGrid = document.createElement('result-grid');
    this.ruleResultGrid.setRowActivationEventHandler(handleRowActivation);
    this.ruleResultGrid.setRowSelectionEventHandler(this.handleRowSelection.bind(this));
    this.ruleResultGrid.addClassNameToTable('group');
    this.groupNode.appendChild(this.ruleResultGrid);

    // Create container DIV with heading for rule information
    div = document.createElement('div');
    div.className = 'rule-info';
    this.groupNode.appendChild(div);

    h2 = document.createElement('h2');
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

  update (infoGroup) {
    let i, rr, row, style, value, sortValue;

    this.detailsActions = {};

    this.resultSummary.violations   = infoGroup.violations;
    this.resultSummary.warnings     = infoGroup.warnings;
    this.resultSummary.manualChecks = infoGroup.manual_checks;
    this.resultSummary.passed       = infoGroup.passed;

    this.ruleResultGrid.deleteDataRows();

    for (i = 0; i < infoGroup.ruleResults.length; i += 1) {
      rr = infoGroup.ruleResults[i];

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

    this.ruleResultGrid.sortGridByColumn(2, 4, 3, 'descending');

    this.resultRuleInfo.update(this.detailsActions[infoGroup.ruleResults[0].ruleId]);

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
