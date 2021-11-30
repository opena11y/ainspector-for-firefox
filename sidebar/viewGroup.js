
const getMessage = browser.i18n.getMessage;

export default class viewGroup {
  constructor(id) {
    this.groupNode     = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.groupNode.appendChild(this.resultSummary);

    this.resultGrid = document.createElement('result-grid');
    this.groupNode.appendChild(this.resultGrid);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.groupNode.appendChild(this.resultRuleInfo);


    this.initGrid();
  }

  initGrid () {

    this.resultGrid.addHeaderCell('Rule');
    this.resultGrid.addHeaderCell('Result');
    this.resultGrid.addHeaderCell('SC');
    this.resultGrid.addHeaderCell('Level');
    this.resultGrid.addHeaderCell('Req');

  }

  update (infoGroup) {
    this.resultSummary.violations   = infoGroup.violations;
    this.resultSummary.warnings     = infoGroup.warnings;
    this.resultSummary.manualChecks = infoGroup.manual_checks;
    this.resultSummary.passed       = infoGroup.passed;
  }

  clear () {
    this.resultSummary.clear();
    this.resultGrid.clearDataCells();
  }
}
