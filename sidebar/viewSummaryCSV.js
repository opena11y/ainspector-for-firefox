/* viewRuleResultCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

import { getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';

export default class ViewSummaryCSV extends commonCSV {
  constructor(rcResults, glResults) {
    super();

    this.rcResults = rcResults;
    this.glResults = glResults;
  }

  getCSV (options, title, location) {
    let i, r;

    let csv = super.getCSV(options, title, location);

    csv += '\n"Rule Catactory","Violations","Warnings","Manual Checks","Passed"\n';

    for (i = 0; i < this.rcResults.length; i += 1) {
      r = this.rcResults[i];
      csv += `"${getMessage(getRuleCategoryLabelId(r.id))}","${r.violations}","${r.warnings}","${r.manual_checks}","${r.passed}"\n`;
    }

    csv += '\n\n"WCAG Guideline","Violations","Warnings","Manual Checks","Passed"\n';

    for (i = 0; i < this.glResults.length; i += 1) {
      r = this.glResults[i];
      csv += `"${getMessage(getGuidelineLabelId(r.id))}","${r.violations}","${r.warnings}","${r.manual_checks}","${r.passed}"\n`;
    }

    return csv;
  }

}
