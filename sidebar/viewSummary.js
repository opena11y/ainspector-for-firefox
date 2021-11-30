
const getMessage = browser.i18n.getMessage;

import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from './commonModule.js';

export default class viewSummary {
  constructor(id) {
    this.summaryNode   = document.getElementById(id);

    this.resultSummary = document.createElement('result-summary');
    this.summaryNode.appendChild(this.resultSummary);

    this.resultTablist = document.createElement('result-tablist');
    this.summaryNode.appendChild(this.resultTablist);

    this.rcResultGrid = document.createElement('result-grid');
    this.resultTablist.tabpanel1.appendChild(this.rcResultGrid);

    this.glResultGrid = document.createElement('result-grid');
    this.resultTablist.tabpanel2.appendChild(this.glResultGrid);

    this.initGrids();

  }

  initGrids () {
    let i, id, label;

    let handleRowClick = this.handleRowClick.bind(this);

    this.resultTablist.tabLabel1 = getMessage("ruleCategoryLabel");
    this.rcResultGrid.addHeaderCell(getMessage('ruleCategoryLabel'));
    this.rcResultGrid.addHeaderCell(getMessage('violationsAbbrev'));
    this.rcResultGrid.addHeaderCell(getMessage('warningsAbbrev'));
    this.rcResultGrid.addHeaderCell(getMessage('manualChecksAbbrev'));
    this.rcResultGrid.addHeaderCell(getMessage('passedAbbrev'));

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      id = ruleCategoryIds[i];
      label = getMessage(getRuleCategoryLabelId(id));
      this.rcResultGrid.addRow('rc' + id, label, ['-', '-', '-', '-'], this.handleRowClick);
    }

    this.resultTablist.tabLabel2 = getMessage("guidelineLabel");
    this.glResultGrid.addHeaderCell(getMessage('guidelineLabel'));
    this.glResultGrid.addHeaderCell(getMessage('violationsAbbrev'));
    this.glResultGrid.addHeaderCell(getMessage('warningsAbbrev'));
    this.glResultGrid.addHeaderCell(getMessage('manualChecksAbbrev'));
    this.glResultGrid.addHeaderCell(getMessage('passedAbbrev'));

    for (i = 0; i < guidelineIds.length; i += 1 ) {
      id = guidelineIds[i];
      label = getMessage(getGuidelineLabelId(id));
      this.glResultGrid.addRow('gl' + id, label, ['-', '-', '-', '-'], this.handleRowClick);
    }

  }

  handleRowClick (event) {
    let tgt = event.currentTarget;
    alert(tgt.id);

//    let eval = {};
//    eval.id = 'eval';
//    eval.view = 'group';
//    eval.groupId = parseInt(tgt.id.substring(2));
//    eval.groupType = tgt.id.substring(0,2);
  }

  update (infoSummary) {
    let i, data, r, groupLabel;

    this.resultSummary.violations   = infoSummary.violations;
    this.resultSummary.warnings     = infoSummary.warnings;
    this.resultSummary.manualChecks = infoSummary.manual_checks;
    this.resultSummary.passed       = infoSummary.passed;

    for (i = 0; i < infoSummary.rcResults.length; i += 1) {
      data = [];
      r = infoSummary.rcResults[i];
      groupLabel = getMessage(r.labelId);

      data.push(groupLabel);
      data.push(r.violations);
      data.push(r.warnings);
      data.push(r.manual_checks);
      data.push(r.passed);
      this.rcResultGrid.updateRow('rc' + r.id, data);
    }

    for (i = 0; i < infoSummary.glResults.length; i += 1) {
      data = [];
      r = infoSummary.glResults[i];
      groupLabel = getMessage(r.labelId);

      data.push(groupLabel);
      data.push(r.violations);
      data.push(r.warnings);
      data.push(r.manual_checks);
      data.push(r.passed);
      this.glResultGrid.updateRow('gl' + r.id, data);
    }


  }

  clear () {
    this.resultSummary.clear();

    ruleCategoryIds.forEach( (id) => {
      this.rcResultGrid.clearRow('rc' + id)
    });

    guidelineIds.forEach( (id) => {
      this.glResultGrid.clearRow('gl' + id);
    });

  }
}
