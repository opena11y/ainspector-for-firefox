
const getMessage = browser.i18n.getMessage;

export default class viewRule {
  constructor(id) {
    this.ruleNode     = document.getElementById(id);

    this.resultTablist = document.createElement('result-tablist');
    this.ruleNode.appendChild(this.resultTablist);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.resultTablist.tabpanel1.appendChild(this.resultRuleInfo);

    this.resultGrid = document.createElement('result-grid');
    this.resultTablist.tabpanel2.appendChild(this.resultGrid);

    this.initGrid();
  }

  initGrid () {

    this.resultTablist.tabLabel1 = 'Details/Action';
    this.resultTablist.tabLabel2 = 'Element Results';

    this.resultGrid.addHeaderCell('Element');
    this.resultGrid.addHeaderCell('Result');
    this.resultGrid.addHeaderCell('Pos');
    this.resultGrid.addHeaderCell('Action');

  }

  update (infoRule) {
  }

  clear () {
    this.resultGrid.deleteDataRows();
  }
}
