/* viewSummaryCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

import { getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

// Get message strings from locale-specific messages.json file
const getMessage  = browser.i18n.getMessage;
const msg = {
  detailsLabel        : getMessage('detailsLabel'),
  ruleCategoryLabel   : getMessage('ruleCategoryLabel'),
  violationsLabel     : getMessage('violationsLabel'),
  warningsLabel       : getMessage('warningsLabel'),
  manualChecksLabel   : getMessage('manualChecksLabel'),
  passedLabel         : getMessage('passedLabel'),
  guidelineLabel      : getMessage('guidelineLabel'),
  landmarksLabel      : getMessage('landmarksLabel'),
  headingsLabel       : getMessage('headingsLabel'),
  stylesContentLabel  : getMessage('stylesContentLabel'),
  imagesLabel         : getMessage('imagesLabel'),
  formsLabel          : getMessage('formsLabel'),
  linksLabel          : getMessage('linksLabel'),
  tablesLabel         : getMessage('tablesLabel'),
  widgetsScriptsLabel : getMessage('widgetsScriptsLabel'),
  audioVideoLabel     : getMessage('audioVideoLabel'),
  keyboardLabel       : getMessage('keyboardLabel'),
  timingLabel         : getMessage('timingLabel'),
  siteNavigationLabel : getMessage('siteNavigationLabel'),
  allRulesLabel       : getMessage('allRulesLabel'),
  g1_1 : getMessage('g1.1'),
  g1_2 : getMessage('g1.2'),
  g1_3 : getMessage('g1.3'),
  g1_4 : getMessage('g1.4'),
  g2_1 : getMessage('g2.1'),
  g2_2 : getMessage('g2.2'),
  g2_3 : getMessage('g2.3'),
  g2_4 : getMessage('g2.4'),
  g3_1 : getMessage('g3.1'),
  g3_2 : getMessage('g3.2'),
  g3_3 : getMessage('g3.3'),
  g4_1 : getMessage('g4.1')
};

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

    csv += this.getRuleResultsCSV(options, msg.allRulesLabel, this.ruleResults, true, true);

    return csv;
  }

}
