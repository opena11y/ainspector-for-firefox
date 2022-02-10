/* viewRuleGroupCSV.js */

import { commonCSV } from './commonCSV.js';
import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

export default class ViewRuleGroupCSV extends commonCSV {
  constructor(groupType, groupTitle, ruleResults, ruleDetails, isAllRules) {
    super();
    this.groupType   = groupType;
    this.groupTitle  = groupTitle;
    this.ruleResults = ruleResults;
    this.ruleDetails = ruleDetails;
    this.isAllRules  = isAllRules;
  }

  getCSV (options, title, url) {
    let incRC = false, incGL = false;
    let csv = super.getCSV(options, title, url);
    if (this.groupType === 'gl' || this.isAllRules) {
      incRC = true;
    }
    if (this.groupType !== 'gl' || this.isAllRules) {
      incGL = true;
    }
    csv += this.getRuleResultsCSV(this.groupTitle, this.ruleResults, incRC, incGL);
    return csv
  }

}
