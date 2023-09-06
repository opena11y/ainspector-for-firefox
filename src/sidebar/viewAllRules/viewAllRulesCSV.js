/* viewAllRulesCSV.js */

import { commonCSV } from '../commonCSV.js';
import { getOptions } from '../../storage.js';

import { getRuleCategoryLabelId, getGuidelineLabelId } from '../constants.js';

// Get message strings from locale-specific messages.json file
const getMessage  = browser.i18n.getMessage;
const msg = {
  allRulesLabel       : getMessage('allRulesLabel'),
  audioVideoLabel     : getMessage('audioVideoLabel'),
  detailsLabel        : getMessage('detailsLabel'),
  formsLabel          : getMessage('formsLabel'),
  g1_1                : getMessage('g1.1'),
  g1_2                : getMessage('g1.2'),
  g1_3                : getMessage('g1.3'),
  g1_4                : getMessage('g1.4'),
  g2_1                : getMessage('g2.1'),
  g2_2                : getMessage('g2.2'),
  g2_3                : getMessage('g2.3'),
  g2_4                : getMessage('g2.4'),
  g3_1                : getMessage('g3.1'),
  g3_2                : getMessage('g3.2'),
  g3_3                : getMessage('g3.3'),
  g4_1                : getMessage('g4.1'),
  guidelineLabel      : getMessage('guidelineLabel'),
  headingsLabel       : getMessage('headingsLabel'),
  imagesLabel         : getMessage('imagesLabel'),
  keyboardLabel       : getMessage('keyboardLabel'),
  landmarksLabel      : getMessage('landmarksLabel'),
  linksLabel          : getMessage('linksLabel'),
  manualChecksLabel   : getMessage('manualChecksLabel'),
  passedLabel         : getMessage('passedLabel'),
  ruleCategoryLabel   : getMessage('ruleCategoryLabel'),
  siteNavigationLabel : getMessage('siteNavigationLabel'),
  stylesContentLabel  : getMessage('stylesContentLabel'),
  tablesLabel         : getMessage('tablesLabel'),
  timingLabel         : getMessage('timingLabel'),
  violationsLabel     : getMessage('violationsLabel'),
  warningsLabel       : getMessage('warningsLabel'),
  widgetsScriptsLabel : getMessage('widgetsScriptsLabel')
};

export default class ViewAllRulesCSV extends commonCSV {
  constructor(ruleSummary, rcResults, glResults, ruleResults) {
    super();

    this.ruleSummary = ruleSummary;
    this.rcResults     = rcResults;
    this.glResults     = glResults;
    this.ruleResults   = ruleResults;
  }

  getCSV (options, title, location, rulesetLabel) {
    let i, r;

    let csv = super.getCSV(options, title, location, rulesetLabel);

    csv += this.getRuleSummary(this.ruleSummary, 'allRulesLabel');

    // Rule Category Results
    csv += this.getRuleSummaryRowHeaders(msg.ruleCategoryLabel);
    for (i = 0; i < this.rcResults.length; i += 1) {
      r = this.rcResults[i];
      csv += this.getRuleSummaryRow(msg[getRuleCategoryLabelId(r.id)], r);
    }
    csv += this.getRuleSummaryRow(msg.allRulesLabel,this.ruleSummary);
    csv += this.getBlankRow();

    // Guideline Results
    csv += this.getRuleSummaryRowHeaders(msg.guidelineLabel);
    for (i = 0; i < this.glResults.length; i += 1) {
      r = this.glResults[i];
      csv += this.getRuleSummaryRow(msg[getGuidelineLabelId(r.id).replaceAll('.','_')], r);
    }
    csv += this.getRuleSummaryRow(msg.allRulesLabel,this.ruleSummary);
    csv += this.getBlankRow();

    csv += this.getGroupTitle(msg.allRulesLabel);
    csv += this.getRuleResultsCSV(options, this.ruleResults, true, true);

    return csv;
  }

}
