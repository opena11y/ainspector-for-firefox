
const getMessage = browser.i18n.getMessage;

export default class viewGroup {
  constructor(id, handleRowActivation) {

    this.groupNode     = document.getElementById(id);
    this.resultSummary = document.createElement('result-summary');
    this.groupNode.appendChild(this.resultSummary);

    this.ruleResultGrid = document.createElement('result-grid');
    this.ruleResultGrid.setRowActivationEventHandler(handleRowActivation);
    this.ruleResultGrid.setRowSelectionEventHandler(this.handleRowSelection);

    this.groupNode.appendChild(this.ruleResultGrid);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.groupNode.appendChild(this.resultRuleInfo);


    this.initGrid();
  }

  initGrid () {

    this.ruleResultGrid.addHeaderCell('Rule');
    this.ruleResultGrid.addHeaderCell('Result');
    this.ruleResultGrid.addHeaderCell('SC', 'Success Criteria');
    this.ruleResultGrid.addHeaderCell('Level', 'WCAG  Level');
    this.ruleResultGrid.addHeaderCell('Req', 'Required');

  }

  update (infoGroup) {
    let i, rResult;

    this.resultSummary.violations   = infoGroup.violations;
    this.resultSummary.warnings     = infoGroup.warnings;
    this.resultSummary.manualChecks = infoGroup.manual_checks;
    this.resultSummary.passed       = infoGroup.passed;

    this.ruleResultGrid.deleteDataRows();

    for (i = 0; i < infoGroup.ruleResults.length; i += 1) {
      rResult = infoGroup.ruleResults[i];
//      data.push(r.result);
//      data.push(r.wcag);
//      data.push(r.level);
//      data.push(r.required ? 'Y' : '');
//      this.ruleResultGrid.addRow(r.ruleId, r.summary, data, this.handle);
    }

  }

  clear () {
    this.resultSummary.clear();
    this.ruleResultGrid.deleteDataRows();
  }

  handleRowSelection (event) {
    let tgt = event.currentTarget;
  }

}
