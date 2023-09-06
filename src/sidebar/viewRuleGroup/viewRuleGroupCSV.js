/* viewRuleGroupCSV.js */

import {
  GUIDELINES,
  RULE_CATEGORIES,
  getGuidelineLabelId,
  getRuleCategoryLabelId,
  getScopeLabelId
} from '../constants.js';


import { commonCSV } from '../commonCSV.js';
import { getOptions } from '../../storage.js';

// Get message strings from locale-specific messages.json file
const getMessage  = browser.i18n.getMessage;
const msg = {
  csvRuleTotals: getMessage('csvRuleTotals')
}


export default class ViewRuleResultsCSV extends commonCSV {
  constructor(groupType, groupTitle, ruleResults, ruleSummary, groupId) {
    super();
    this.groupType   = groupType;
    this.groupTitle  = groupTitle;
    this.ruleResults = ruleResults;
    this.ruleSummary = ruleSummary;
    this.groupId     = groupId;
    this.isAllRules  = (groupId === RULE_CATEGORIES.ALL_RULES) || (groupId === GUIDELINES.ALL_RULES);
  }

  getCSV (options, title, url, rulesetLabel) {
    let csv = super.getCSV(options, title, url, rulesetLabel);
    let msgId = '';

    if (this.groupType === 'gl') {
      msgId = getGuidelineLabelId(this.groupId);
      if (typeof msgId === 'string') {
        msgId = msgId.replace('.', '_');
      }
    } else {
      if (this.groupType === 'rc') {
        msgId = getRuleCategoryLabelId(this.groupId);
      } else {
        msgId = getScopeLabelId(this.groupId);
      }
    }

    csv += this.getGroupTitle(this.groupTitle);
    csv += this.getBlankRow()

    csv += this.getRuleSummary(this.ruleSummary, msgId);

    const incGL = this.groupType.includes('gl') || this.isAllRules;
    const incRC = this.groupType.includes('rc') || this.isAllRules;
    const incSC = this.groupType.includes('sc') || this.isAllRules;
    csv += this.getRuleResultsCSV(options, this.ruleResults, incRC, incGL, incSC);
    return csv
  }

}
