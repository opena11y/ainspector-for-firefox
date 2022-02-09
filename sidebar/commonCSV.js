/* viewRuleResultCSV.js */

import { getRuleCategoryFilenameId, getGuidelineFilenameId } from './constants.js';

const getMessage = browser.i18n.getMessage;

export class commonCSV {
  constructor() {
    this.ariaStrictRulesetLabel = getMessage("optionsRulesetStrictLabel");
    this.ariaTransLRulesetLabel = getMessage("optionsRulesetTransLabel");
  }

  getRulesetTitle (rulesetId) {
    if (rulesetId === 'ARIA_STRICT') {
      return this.ariaStrictRulesetLabel;
    }
    return ariaTransLRulesetLabel;
  }

  getCSV (options, title, location) {
    let csv = '';
    csv += `"Page Title:","${cleanCSVItem(title)}"\n`;
    csv += `"Page URL:","${cleanCSVItem(location)}"\n`;
    csv += `"Ruleset:","${this.getRulesetTitle(options.rulesetId)}"\n`;
    csv += `"Date:","${getTodaysDate()}"\n`;
    csv += `"Time:","${getTimeOfDay()}"\n`;
    csv += `"Source:","AInspector ${getMessage('extensionVersion')}"\n\n`;
    return csv
  }

}

function getTodaysDate () {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  return yyyy + '-' + mm + '-' + dd;
}

function getTimeOfDay () {
  let today = new Date();
  let hh = today.getHours();
  let mm = today.getMinutes();
  let ss = today.getSeconds();
  hh = hh < 10 ? "0" + hh : hh;
  mm = mm < 10 ? "0" + mm : mm;
  ss = ss < 10 ? "0" + ss : ss;
  return hh + ":" + mm + ':' + ss;
}

export function getExportFileName (fname, options, groupType, groupId, ruleId) {

  if (typeof groupType !== 'string') {
    groupType = 'rc';
  }

  if (typeof groupId !== 'number') {
    groupId = 1;
  }

  if (typeof ruleId !== 'string') {
    groupId = '';
  }

  // get group ID
  let date = '', time = '', dd, mm, yyyy, hh, ss, parts, ruleNum;
  if (groupType === 'rc') {
    groupId = getRuleCategoryFilenameId(groupId);
  } else {
    groupId = getGuidelineFilenameId(groupId);
  }

  // get today's date
  let today = new Date();
  if (options.includeDate) {
    date = '-' + getTodaysDate();
  }

  // get time of day
  if (options.includeTime) {
    hh = today.getHours();
    mm = today.getMinutes();
    ss = today.getSeconds();
    hh = hh < 10 ? "0" + hh : hh;
    mm = mm < 10 ? "0" + mm : mm;
    ss = ss < 10 ? "0" + ss : ss;
    time = '-' + hh + "h-" + mm + 'm-' + ss + 's';
  }

  // format rule id
  if (ruleId && typeof ruleId === 'string') {
    parts = ruleId.split('_');
    if (parts.length == 2) {
      ruleNum = parseInt(parts[1]);
      ruleNum = ruleNum < 10 ? '0' + ruleNum : ruleNum;
      ruleId = parts[0].toLowerCase() + '-' + ruleNum;
    }
  } else {
    ruleId = '';
  }

  fname = fname.replace('{date}', date);
  fname = fname.replace('{time}', time);
  fname = fname.replace('{group}', groupId);
  fname = fname.replace('{rule}', ruleId);

  if (options.filenamePrefix) {
    const prefixLen = options.filenamePrefix.length;
    if (options.filenamePrefix[prefixLen - 1] === '-') {
      fname = options.filenamePrefix + fname;
    } else {
      fname = options.filenamePrefix + '-' + fname;
    }
  }

  if (options.exportFormat === 'CSV') {
    fname += '.csv';
  }

  if (options.exportFormat === 'JSON') {
    fname += '.json';
  }

  return fname;
}

export function cleanCSVItem (item) {
  if (!item) {
    item = '';
  } else {
    if (typeof item !== 'string') {
      if (typeof item.toString === 'function') {
        item = item.toString();
      } else {
        item = ' ' + item;
        item = item.substring(1);
      }
    }
  }
  // clean it for CSV
  item = item.trim().replaceAll('"', '""');
  return item;
}

