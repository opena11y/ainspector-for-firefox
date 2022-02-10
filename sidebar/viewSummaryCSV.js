/* viewSummaryCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

import { getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

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

    csv += '\n"","Violations","Warnings","Manual Checks","Passed"\n';
    csv += this.getRow('Totals',this.resultSummary);


    csv += '\n"Rule Category","Violations","Warnings","Manual Checks","Passed"\n';

    for (i = 0; i < this.rcResults.length; i += 1) {
      r = this.rcResults[i];
      csv += this.getRow(getMessage(getRuleCategoryLabelId(r.id)), r);
    }
    csv += this.getRow('Totals',this.resultSummary);

    csv += '\n\n"WCAG Guideline","Violations","Warnings","Manual Checks","Passed"\n';

    for (i = 0; i < this.glResults.length; i += 1) {
      r = this.glResults[i];
      csv += this.getRow(getMessage(getGuidelineLabelId(r.id)), r);
    }
    csv += this.getRow('Totals',this.resultSummary);

    csv += this.getRuleResultsCSV('All Rules', this.ruleResults, true, true);

    return csv;
  }

}
