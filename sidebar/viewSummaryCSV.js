/* viewSummaryCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

import { getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

const getMessage  = browser.i18n.getMessage;
const msg = {};
msg.detailsLabel        = getMessage('detailsLabel');
msg.ruleCategoryLabel   = getMessage('ruleCategoryLabel');
msg.violationsLabel     = getMessage('violationsLabel');
msg.warningsLabel       = getMessage('warningsLabel');
msg.manualChecksLabel   = getMessage('manualChecksLabel');
msg.passedLabel         = getMessage('passedLabel');
msg.guidelineLabel      = getMessage('guidelineLabel');

msg.landmarksLabel      = getMessage('landmarksLabel');
msg.headingsLabel       = getMessage('headingsLabel');
msg.stylesContentLabel  = getMessage('stylesContentLabel');
msg.imagesLabel         = getMessage('imagesLabel');
msg.formsLabel          = getMessage('formsLabel');
msg.linksLabel          = getMessage('linksLabel');
msg.tablesLabel         = getMessage('tablesLabel');
msg.widgetsScriptsLabel = getMessage('widgetsScriptsLabel');
msg.audioVideoLabel     = getMessage('audioVideoLabel');
msg.keyboardLabel       = getMessage('keyboardLabel');
msg.timingLabel         = getMessage('timingLabel');
msg.siteNavigationLabel = getMessage('siteNavigationLabel');
msg.allRulesLabel       = getMessage('allRulesLabel');

msg.g1_1 = getMessage('g1.1');
msg.g1_2 = getMessage('g1.2');
msg.g1_3 = getMessage('g1.3');
msg.g1_4 = getMessage('g1.4');
msg.g2_1 = getMessage('g2.1');
msg.g2_2 = getMessage('g2.2');
msg.g2_3 = getMessage('g2.3');
msg.g2_4 = getMessage('g2.4');
msg.g3_1 = getMessage('g3.1');
msg.g3_2 = getMessage('g3.2');
msg.g3_3 = getMessage('g3.3');
msg.g4_1 = getMessage('g4.1');

export default class ViewSummaryCSV extends commonCSV {
  constructor(resultSummary, rcResults, glResults, ruleResults) {
    super();

    this.resultSummary = resultSummary;
    this.rcResults     = rcResults;
    this.glResults     = glResults;
    this.ruleResults   = ruleResults;
  }

  getRow (label, result) {
    return `"${label}","${result.violations}","${result.warnings}","${result.manual_checks}","${result.passed}"\n`;
  }

  getCSV (options, title, location) {
    let i, r;

    let csv = super.getCSV(options, title, location);

    csv += `\n"","${msg.violationsLabel}","${msg.warningsLabel}","${msg.manualChecksLabel}","${msg.passedLabel}"\n`;
    csv += this.getRow(msg.allRulesLabel, this.resultSummary);


    csv += `\n"${msg.ruleCategoryLabel}","${msg.violationsLabel}","${msg.warningsLabel}","${msg.manualChecksLabel}","${msg.passedLabel}"\n`;

    for (i = 0; i < this.rcResults.length; i += 1) {
      r = this.rcResults[i];
      csv += this.getRow(msg[getRuleCategoryLabelId(r.id)], r);
    }
    csv += this.getRow(msg.allRulesLabel,this.resultSummary);

    csv += `\n\n"${msg.guidelineLabel}","${msg.violationsLabel}","${msg.warningsLabel}","${msg.manualChecksLabel}","${msg.passedLabel}"\n`;

    for (i = 0; i < this.glResults.length; i += 1) {
      r = this.glResults[i];
      csv += this.getRow(msg[getGuidelineLabelId(r.id).replaceAll('.','_')], r);
    }
    csv += this.getRow(msg.allRulesLabel,this.resultSummary);

    csv += this.getRuleResultsCSV(msg.allRulesLabel, this.ruleResults, true, true);

    return csv;
  }

}
