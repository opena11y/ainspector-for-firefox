/* viewRuleResultCSV.js */

import { removeTags } from '../utils.js';

import {
  cleanCSVItem,
  commonCSV
} from '../commonCSV.js';


const basicProps = ['tagName', 'result',  'resultValue', 'position', 'role', 'actionMessage'];

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  elementResultsLabel : getMessage('elementResultsLabel'),
  pageResultLabel:      getMessage('pageResultLabel'),
  websiteResultLabel:   getMessage('websiteResultLabel')
};
export default class ViewRuleResultCSV extends commonCSV{
  constructor(detailsAction, elementResults, elementSummary) {
    super();
    this.detailsAction  = detailsAction;
    this.elementResults = elementResults;
    this.elementSummary = elementSummary;
  }

  // Not all element information objects
  // will define accessible names, descriptions
  // or error descriptions
  getAccNameProps () {
    let props = [];
    for (let er in this.elementResults) {
      let info = this.elementResults[er];
      if (info.accNameInfo) {
        if (info.accNameInfo.name) {
          if (props.indexOf('name') < 0) {
            props.push('name');
            props.push('name_source');
          }
        }

        if (info.accNameInfo.desc) {
          if (props.indexOf('desc') < 0) {
            props.push('desc');
            props.push('desc_source');
          }
        }

        if (info.accNameInfo.error) {
          if (props.indexOf('error') < 0) {
            props.push('error');
            props.push('error_source');
          }
        }
      }
    }
    return props;
  }

  // Get properties
  getVisibilityProps () {
    let props = [];
    if (this.elementResults) {
      let id = Object.keys(this.elementResults)[0]
      if (id) {
        let info = this.elementResults[id];
        if (info) {
          for (let item in info.visibilityInfo) {
            props.push(item);
          }
        }
      }
    }
    return props;
  }

  // If one element information object has
  // visibility information all
  // element information objects will
  getColorContrastProps () {
    let props = [];
    if (this.elementResults) {
      let id = Object.keys(this.elementResults)[0]
      if (id) {
        let info = this.elementResults[id];
        if (info) {
          for (let item in info.ccrInfo) {
            props.push(item);
          }
        }
      }
    }
    return props;
  }

  // table properties
  // All elements in elements array must have the properties
  getTableProps () {
    let props = [];
    for (const id in this.elementResults) {
      if (id) {
        let info = this.elementResults[id];
        if (info) {
          if (info.tableInfo.type) {
            if (props.length == 0) {
              for (let item in info.tableInfo) {
                props.push(item);
              }
            }
          }
          else {
            // if any element doesn't have table properties, return empty array
            return [];
          }
        }
      }
    }
    return props;
  }

  // tablecell properties
  // All elements in elements array must have the properties
  getTableCellProps () {
    let props = [];
    for (const id in this.elementResults) {
      if (id) {
        let info = this.elementResults[id];
        if (info) {
          if (typeof info.tableCellInfo.headers === 'string') {
            if (props.length == 0) {
              for (let item in info.tableCellInfo) {
                props.push(item);
              }
            }
          }
          else {
            // if any element doesn't have header properties, return empty array
            return [];
          }
        }
      }
    }
    return props;
  }


  // Check all element information objects,
  // since not all elements use the same
  // HTML attributes
  getHTMLAttributeProps () {
    let props = [];
    for (let id in this.elementResults) {
      let info = this.elementResults[id];
      if (info.htmlAttrInfo) {
        for (let item in info.htmlAttrInfo) {
          if (props.indexOf(item) < 0) {
            props.push(item);
          }
        }
      }
    }
    return props;
  }

  // Check all element information objects,
  // since not all elements use the same
  // ARIA attributes
  getARIAAttributeProps () {
    let props = [];
    for (let id in this.elementResults) {
      let info = this.elementResults[id];
      if (info.ariaAttrInfo) {
        for (let item in info.ariaAttrInfo) {
          if (props.indexOf(item) < 0) {
            props.push(item);
          }
        }
      }
    }
    return props;
  }

  getColumnHeaders(props) {
    let values = [];
    for (let i = 0; i < props.length; i += 1) {
      let prop = props[i];
      if (prop.indexOf('_') >= 0) {
        prop = prop.replaceAll('_', ' ');
      }
      if (prop.indexOf('actionMessage') >= 0) {
        prop = 'action';
      }
      if (prop.indexOf('tagName') >= 0) {
        prop = 'element';
      }
      values.push(prop);
    }
    return values;
  }

  getValuesFromObject (info, props) {
    let values = [], value;
    for (let i = 0; i < props.length; i += 1) {
      value = '';
      if (info) {
        value = info[props[i]];
      }
      values.push(value);
    }
    return values;
  }

  otherResultToCSV (otherInfo) {
    const values = [];
    const label = otherInfo.isPageResult ? msg.pageResultLabel : msg.websiteResultLabel;
    values.push(label);    
    values.push(otherInfo.resultLong);    
    values.push(otherInfo.actionMessage);    
    return this.arrayToCSV(values);
  }

  elementResultToCSV (elementInfo, basicProps, accNameProps, ccrProps, tableProps, tableCellProps, visProps, htmlAttrProps, ariaAttrProps) {
    let values = this.getValuesFromObject(elementInfo, basicProps);
    values = values.concat(this.getValuesFromObject(elementInfo.accNameInfo,    accNameProps));
    values = values.concat(this.getValuesFromObject(elementInfo.ccrInfo,        ccrProps));
    values = values.concat(this.getValuesFromObject(elementInfo.tableInfo,      tableProps));
    values = values.concat(this.getValuesFromObject(elementInfo.tableCellInfo,  tableCellProps));
    values = values.concat(this.getValuesFromObject(elementInfo.visibilityInfo, visProps));
    values = values.concat(this.getValuesFromObject(elementInfo.htmlAttrInfo,   htmlAttrProps));
    values = values.concat(this.getValuesFromObject(elementInfo.ariaAttrInfo,   ariaAttrProps));
    return this.arrayToCSV(values);
  }

  getElementResultsArray (elementResults) {

    const elemResults = [];

    for (let er in elementResults) {
      if (elementResults[er].isElementResult) {
        elemResults.push(elementResults[er]);
      }
    }

    elemResults.sort((a, b) => {
      if (a.result === b.result) {
        return a.position - b.position;
      } else {
        return b.resultValue - a.resultValue;
      }
    });

    return elemResults;
  }

  getOtherResult (elementResults) {
    for (let er in elementResults) {
      if (!elementResults[er].isElementResult) {
        return elementResults[er];
      }
    }
    return null;
  }

  getCSV (options, title, location, rulesetLabel) {

    let accNameProps   = this.getAccNameProps();
    let ccrProps       = this.getColorContrastProps();
    let tableProps     = this.getTableProps();
    let tableCellProps = this.getTableCellProps();
    let visProps       = this.getVisibilityProps();
    let htmlAttrProps  = this.getHTMLAttributeProps();
    let ariaAttrProps  = this.getARIAAttributeProps();

    let csv = super.getCSV(options, title, location, rulesetLabel);

    csv += this.getRuleTitle(this.detailsAction);
    csv += this.getBlankRow();
    csv += this.getElementSummary(this.elementSummary);

    const otherResult = this.getOtherResult(this.elementResults);
    if (otherResult) {
      csv += this.otherResultToCSV(otherResult);
      csv += this.getBlankRow();
    }

    csv += this.arrayToCSV([msg.elementResultsLabel]);

    let cols = this.getColumnHeaders(basicProps);
    cols = cols.concat(this.getColumnHeaders(accNameProps));
    cols = cols.concat(this.getColumnHeaders(ccrProps));
    cols = cols.concat(this.getColumnHeaders(tableProps));
    cols = cols.concat(this.getColumnHeaders(tableCellProps));
    cols = cols.concat(this.getColumnHeaders(visProps));
    cols = cols.concat(this.getColumnHeaders(htmlAttrProps));
    cols = cols.concat(this.getColumnHeaders(ariaAttrProps));

    csv += this.arrayToCSV(cols);

    const elemResults = this.getElementResultsArray(this.elementResults);

    for (const info of elemResults) {
      if (options.resultsIncludePassNa ||
          (['', 'V', 'W', 'MC'].indexOf(info.result) > 0)) {
        csv += this.elementResultToCSV(info, basicProps, accNameProps, ccrProps, tableProps, tableCellProps, visProps, htmlAttrProps, ariaAttrProps);
      }
    }
    return csv
  }

}
