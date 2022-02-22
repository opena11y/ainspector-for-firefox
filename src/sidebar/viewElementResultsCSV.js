/* viewElementResultsCSV.js */

import { cleanCSVItem, commonCSV } from './commonCSV.js';

const basicProps = ['result', 'tagName', 'position', 'role', 'actionMessage'];

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {
  elementResultsLabel : getMessage('elementResultsLabel')
};
export default class ViewElementResultsCSV extends commonCSV{
  constructor(detailsAction, elementResults) {
    super();
    this.detailsAction = detailsAction;
    this.elementResults = elementResults;
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

        if (info.accNameInfo.error_desc) {
          if (props.indexOf('error_desc') < 0) {
            props.push('error_desc');
            props.push('error_desc_source');
          }
        }
      }
    }
    return props;
  }

  // If one element information object has
  // CCR information all element information
  // objects will also include them
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

  elementResultToCSV (elementInfo, basicProps, accNameProps, ccrProps, visProps, htmlAttrProps, ariaAttrProps) {
    let values = this.getValuesFromObject(elementInfo, basicProps);
    values = values.concat(this.getValuesFromObject(elementInfo.accNameInfo, accNameProps));
    values = values.concat(this.getValuesFromObject(elementInfo.ccrInfo, ccrProps));
    values = values.concat(this.getValuesFromObject(elementInfo.visibilityInfo, visProps));
    values = values.concat(this.getValuesFromObject(elementInfo.htmlAttrInfo, htmlAttrProps));
    values = values.concat(this.getValuesFromObject(elementInfo.ariaAttrInfo, ariaAttrProps));
    return this.arrayToCSV(values);
  }

  getCSV (options, title, location) {

    let accNameProps = this.getAccNameProps();
    let ccrProps     = this.getColorContrastProps();
    let visProps     = this.getVisibilityProps();
    let htmlAttrProps    = this.getHTMLAttributeProps();
    let ariaAttrProps    = this.getARIAAttributeProps();

    let csv = super.getCSV(options, title, location);

    csv += this.getDetailsActionCSV(this.detailsAction);

    csv += this.arrayToCSV([msg.elementResultsLabel]);

    let cols = this.getColumnHeaders(basicProps);
    cols = cols.concat(this.getColumnHeaders(accNameProps));
    cols = cols.concat(this.getColumnHeaders(ccrProps));
    cols = cols.concat(this.getColumnHeaders(visProps));
    cols = cols.concat(this.getColumnHeaders(htmlAttrProps));
    cols = cols.concat(this.getColumnHeaders(ariaAttrProps));

    csv += this.arrayToCSV(cols);

    for (let er in this.elementResults) {
      let info = this.elementResults[er];
      if (options.resultsIncludePassNa ||
          (['', 'V', 'W', 'MC'].indexOf(info.result) > 0)) {
        csv += this.elementResultToCSV(info, basicProps, accNameProps, ccrProps, visProps, htmlAttrProps, ariaAttrProps);
      }
    }
    return csv
  }

}
