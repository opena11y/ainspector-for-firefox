
const getMessage = browser.i18n.getMessage;

export default class viewRule {
  constructor(id) {
    this.ruleNode     = document.getElementById(id);

    this.resultTablist = document.createElement('result-tablist');
    this.ruleNode.appendChild(this.resultTablist);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.resultTablist.tabpanel1.appendChild(this.resultRuleInfo);

    this.elementResultGrid = document.createElement('result-grid');
    this.elementResultGrid.addClassNameToTable('rule');

    this.resultTablist.tabpanel2.appendChild(this.elementResultGrid);

    this.initGrid();
  }

  initGrid () {

    this.resultTablist.tabLabel1 = 'Details/Action';
    this.resultTablist.tabLabel2 = 'Element Results';

    this.elementResultGrid.addHeaderCell('Element');
    this.elementResultGrid.addHeaderCell('Result');
    this.elementResultGrid.addHeaderCell('Pos');
    this.elementResultGrid.addHeaderCell('Action');

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

  update (infoRule) {
    let i, row, er, style, sortValue;

    this.elementResultGrid.deleteDataRows();

    for (i = 0; i < infoRule.elementResults.length; i += 1) {
      er = infoRule.elementResults[i];

      row = this.elementResultGrid.addRow('er-' + er.position);

      this.elementResultGrid.addDataCell(row, er.element, 'element text');

      style = 'result ' + this.getResultStyle(er.result);
      sortValue = this.getResultSortingValue(er.result);
      this.elementResultGrid.addDataCell(row, er.result, style, sortValue);

      this.elementResultGrid.addDataCell(row, er.position, 'num');

      this.elementResultGrid.addDataCell(row, er.actionMessage, 'text');
    }

    this.resultRuleInfo.update(infoRule.detailsAction);

  }

  clear () {
    this.resultGrid.deleteDataRows();
    this.resultRuleInfo.clear();
  }
}
