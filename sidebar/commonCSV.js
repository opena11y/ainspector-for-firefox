/* viewRuleResultCSV.js */

const getMessage = browser.i18n.getMessage;

export default class commonCSV {
  constructor() {
    this.ariaStrictRulesetLabel = getMessage("optionsRulesetStrictLabel");
    this.ariaTransLRulesetLabel = getMessage("optionsRulesetTransLabel");
  }

  clean(text) {
    text = text.trim().replace('"', '\"');
    return text;
  }

  getRulesetTitle (rulesetId) {
    if (rulesetId === 'ARIA_STRICT') {
      return this.ariaStrictRulesetLabel;
    }
    return ariaTransLRulesetLabel;
  }

  getCSV (options, title, location) {
    let csv = '';
    csv += `\n"Page Title:","this.clean(${title})"\n`;
    csv += `"Page URL:","this.clean(${location})"\n`;
    csv += `"Ruleset:","${this.getRulesetTitle(options.rulesetId)}"\n\n`;
    return csv
  }

}
