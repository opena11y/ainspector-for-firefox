/* viewRuleResultCSV.js */

import { getOptions } from '../storage.js';

const getMessage = browser.i18n.getMessage;

import commonCSV from './commonCSV.js';

export default class ViewSummaryCSV extends commonCSV {
  constructor() {
    super();
  }

  getCSV (options, title, location) {
    let csv = super.getCSV(options, title, location);
    return csv;
  }

}
