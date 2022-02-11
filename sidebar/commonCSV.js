/* commonCSV.js */

import { getRuleCategoryFilenameId, getGuidelineFilenameId } from './constants.js';

import { sortRuleResults } from './sortUtils.js';

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

  arrayToCSV (items, lines) {
    if (typeof extraLine !== 'number') {
      lines = 1;
    }
    let csv = '';
    items.forEach( (item, index) => {
      if (index !== 0) {
        csv += ',';
      }
      csv += '"' + cleanCSVItem(item) + '"';
    });

    for (let i = 0; i < lines; i += 1) {
      csv += '\n';
    }
    return csv;
  }

  getCSV (options, title, location) {
    let csv = '';
    csv += this.arrayToCSV([getMessage('csvPageTitle'), title]);
    csv += this.arrayToCSV([getMessage('csvPageURL'), location]);
    csv += this.arrayToCSV([getMessage('csvRuleset'), this.getRulesetTitle(options.rulesetId)]);
    csv += this.arrayToCSV([getMessage('csvDate'), getTodaysDate()]);
    csv += this.arrayToCSV([getMessage('csvTime'), getTimeOfDay()]);
    csv += this.arrayToCSV([getMessage('csvSource'), 'AInspector ' + getMessage('extensionVersion')], 2);
    return csv;
  }

  getRuleResultsCSV (title, ruleResults, incRC, incGL) {
    if (typeof incRC !== 'boolean') {
      incRC = false;
    }
    if (typeof incGL !== 'boolean') {
      incGL = false;
    }
    let props = [];
    let csv = '\n';

    ruleResults = sortRuleResults(ruleResults);

    csv += this.arrayToCSV([getMessage('csvGroupTitle'), title], 2);
    props.push(getMessage('csvRuleSummary'));
    props.push(getMessage('resultLabel'));
    props.push(getMessage('csvResultValue'));
    if (incRC) {
      props.push(getMessage('ruleCategoryLabel'));
    }
    if (incGL) {
      props.push(getMessage('guidelineLabel'));
    }
    props.push(getMessage('csvSuccessCriteria'));
    props.push(getMessage('levelLabel'));
    props.push(getMessage('requiredLabel'));
    props.push(getMessage('violationsLabel'));
    props.push(getMessage('warningsLabel'));
    props.push(getMessage('manualChecksLabel'));
    props.push(getMessage('passedLabel'));
    props.push(getMessage('hiddenLabel'));

    csv += this.arrayToCSV(props);

    for (let i = 0; i < ruleResults.length; i += 1) {
      let values = [];
      let rr = ruleResults[i];
      values.push(rr.summary);
      values.push(rr.result);
      values.push(rr.resultValue);
      if (incRC) {
        values.push(rr.ruleCategory);
      }
      if (incGL) {
        values.push(rr.guideline);
      }
      values.push(rr.wcag);
      values.push(rr.level);
      values.push((rr.required ? 'Y' : ''));
      values.push(rr.elemViolations);
      values.push(rr.elemWarnings);
      values.push(rr.elemManualChecks);
      values.push(rr.elemPassed);
      values.push(rr.elemHidden);

      csv += this.arrayToCSV(values);
    }
    return csv;
  }

  contentCSV(label, info) {
    if (!info) return '';

    let i, item, values, csv = '';

    if (typeof info === 'string') {
      csv += this.arrayToCSV([label, info]);
    } else {
      if (info.length) {
        values = [label];
        for (i = 0; i < info.length; i += 1) {
          item = info[i];
          if (i !== 0) {
            values = [''];
          }
          if (typeof item === 'string') {
              values.push(item);
          } else {
            if (item.url) {
              values.push(item.title);
              values.push(item.url);
            } else {
              values.push(item.title);
            }
          }
          csv += this.arrayToCSV(values);
        }
      }
    }
    return csv;
  }

  getDetailsActionCSV (ruleInfo) {
    let csv = '\n';

    csv += this.arrayToCSV([getMessage('detailsActionLabel')]);
    csv += this.contentCSV('Summary', ruleInfo.summary);
    csv += this.contentCSV('Definition', ruleInfo.definition);
    csv += this.contentCSV('Actions', ruleInfo.action);
    csv += this.contentCSV('Purpose', ruleInfo.purpose);
    csv += this.contentCSV('Techniques', ruleInfo.techniques);
    csv += this.contentCSV('Targets', ruleInfo.targets);
    csv += this.contentCSV('Level', ruleInfo.compliance);
    csv += this.contentCSV('Success Criteria', ruleInfo.sc);
    csv += this.contentCSV('Additional Information', ruleInfo.additionalLinks);
    csv += '\n';

    return csv;
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

