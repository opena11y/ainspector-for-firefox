/* viewRuleGroupCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

export default class ViewRuleGroupCSV extends commonCSV {
  constructor(groupTitle, ruleResults, ruleDetails) {
    super();
    this.groupTitle  = groupTitle;
    this.ruleResults = ruleResults;
    this.ruleDetails = ruleDetails;
  }

  getCSV (options, title, url) {
    let csv = super.getCSV(options, title, url);

    csv += this.getRuleResultsCSV(this.groupTitle, this.ruleResults);

    return csv
  }

}
