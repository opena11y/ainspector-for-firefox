/* viewRuleResultCSV.js */

import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

import commonCSV from './commonCSV.js';

export default class ViewRuleGroupCSV extends commonCSV {
  constructor(groupTitle, ruleResults, ruleDetails) {
    super();
    this.groupTitle  = groupTitle;
    this.ruleResults = ruleResults;
    this.ruleDetails = ruleDetails;
  }

  getCSV (options, title, url) {
    let csv = super.getCSV(options, title, url);

    csv += `\n"Group Title:","${this.groupTitle}"\n\n`

    csv += `"Rule Summary","Result","WCAG","Level","Required"\n`
    for (let i = 0; i < this.ruleResults.length; i += 1) {
      let rr = this.ruleResults[i];
      csv += `"${rr.summary}","${rr.result}","${rr.wcag}","${rr.level}","${rr.required ? 'Y' : ''}"\n`;
    }

    return csv
  }

}