/* viewRuleResultsCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

// Get message strings from locale-specific messages.json file
const getMessage  = browser.i18n.getMessage;
const msg = {
  csvRuleTotals: getMessage('csvRuleTotals')
}


export default class ViewRuleResultsCSV extends commonCSV {
  constructor(groupType, groupTitle, ruleResults, ruleSummary, isAllRules=false) {
    super();
    this.groupType   = groupType;
    this.groupTitle  = groupTitle;
    this.ruleResults = ruleResults;
    this.ruleSummary = ruleSummary;
    this.isAllRules  = isAllRules;
  }

  getCSV (options, title, url) {
    let incRC = false, incGL = false;
    let csv = super.getCSV(options, title, url);

    csv += this.getGroupTitle(this.groupTitle);
    csv += this.getBlankRow()

    csv += this.getRuleSummary(this.ruleSummary);

    if (this.groupType === 'gl' || this.isAllRules) {
      incRC = true;
    }
    if (this.groupType !== 'gl' || this.isAllRules) {
      incGL = true;
    }
    csv += this.getRuleResultsCSV(options, this.ruleResults, incRC, incGL);
    return csv
  }

}
