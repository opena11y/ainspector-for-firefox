/* viewRuleResultCSV.js */

import { cleanCSVItem, commonCSV } from './commonCSV.js';

const getMessage = browser.i18n.getMessage;
const basicProps = ['result', 'tagName', 'position', 'role', 'actionMessage'];

export default class ViewRuleResultCSV extends commonCSV{
  constructor(elementResults) {
    super();
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

  addCSVColumnHeaders(props, flag) {
    if (typeof flag !== 'boolean') {
      flag = true;
    }
    let csv = '';
    for (let i = 0; i < props.length; i += 1) {
      let prop = props[i];
      if ((i !== 0) || flag) {
        csv += ',';
      }
      if (prop.indexOf('_') >= 0) {
        prop = prop.replaceAll('_', ' ');
      }
      if (prop.indexOf('actionMessage') >= 0) {
        prop = 'message';
      }
      if (prop.indexOf('tagName') >= 0) {
        prop = 'element';
      }
      csv += '"' + cleanCSVItem(prop) + '"';
    }
    return csv;
  }


  getCSVFromObject (info, props, flag) {
    if (typeof flag !== 'boolean') {
      flag = true;
    }
    let csv = '', value;
    for (let i = 0; i < props.length; i += 1) {
      value = '';
      if (info) {
        value = info[props[i]];
        if (i != 0 || flag) {
          csv += ',';
        }
      }
      csv += '"' + cleanCSVItem(value) + '"';
    }
    return csv;
  }

  elementResultToCSV (elementInfo, basicProps, accNameProps, ccrProps, visProps, htmlAttrProps, ariaAttrProps) {
    let csv = '';
    csv += this.getCSVFromObject(elementInfo, basicProps, false);
    csv += this.getCSVFromObject(elementInfo.accNameInfo, accNameProps);
    csv += this.getCSVFromObject(elementInfo.ccrInfo, ccrProps);
    csv += this.getCSVFromObject(elementInfo.visibilityInfo, visProps);
    csv += this.getCSVFromObject(elementInfo.htmlAttrInfo, htmlAttrProps);
    csv += this.getCSVFromObject(elementInfo.ariaAttrInfo, ariaAttrProps);
    return csv + '\n';
  }

  getCSV (options, title, location) {

    let accNameProps = this.getAccNameProps();
    let ccrProps     = this.getColorContrastProps();
    let visProps     = this.getVisibilityProps();
    let htmlAttrProps    = this.getHTMLAttributeProps();
    let ariaAttrProps    = this.getARIAAttributeProps();

    let csv = super.getCSV(options, title, location);
    csv += this.addCSVColumnHeaders(basicProps, false);
    csv += this.addCSVColumnHeaders(accNameProps);
    csv += this.addCSVColumnHeaders(ccrProps);
    csv += this.addCSVColumnHeaders(visProps);
    csv += this.addCSVColumnHeaders(htmlAttrProps);
    csv += this.addCSVColumnHeaders(ariaAttrProps);
    csv += '\n';

    for (let er in this.elementResults) {
      let info = this.elementResults[er];
      csv += this.elementResultToCSV(info, basicProps, accNameProps, ccrProps, visProps, htmlAttrProps, ariaAttrProps);
    }
    return csv
  }

}
