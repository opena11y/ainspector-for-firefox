/* viewRuleResult.js */

const getMessage = browser.i18n.getMessage;
const basicProps = ['result', 'tagName', 'position', 'role', 'actionMessage'];

import { getOptions } from '../storage.js';

export default class ViewRuleResult {
  constructor(id, handleRowSelection) {

    this.handleRowSelection = handleRowSelection;

    this.ruleResultDiv = document.getElementById(id);
    this.elementSummary = document.createElement('element-summary');
    this.ruleResultDiv.appendChild(this.elementSummary);

    this.resultTablist = document.createElement('result-tablist');
    this.ruleResultDiv.appendChild(this.resultTablist);

    this.resultRuleInfo = document.createElement('result-rule-info');
    this.resultTablist.tabpanel1.appendChild(this.resultRuleInfo);

    this.elementResultGrid = document.createElement('result-grid');
    this.elementResultGrid.addClassNameToTable('rule');
    this.resultTablist.tabpanel2.appendChild(this.elementResultGrid);
    this.elementResultGrid.setRowSelectionEventHandler(this.onRowSelectionCallback.bind(this));

    this.highlightSelect = document.createElement('highlight-select');
    this.highlightSelect.setChangeEventCallback(this.onSelectChangeCallback.bind(this));
    this.resultTablist.tabpanel2.appendChild(this.highlightSelect);

    // Create container DIV with heading for rule information
    const div = document.createElement('div');
    div.className = 'element-info';
    this.resultTablist.tabpanel2.appendChild(div);

    const h2 = document.createElement('h2');
    h2.className = 'selected';
    h2.textContent = getMessage('elementSelectedLabel');
    div.appendChild(h2);

    this.resultElementInfo = document.createElement('result-element-info');
    div.appendChild(this.resultElementInfo);

    this.elementResults = {};

    this.initGrid();
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
  // objects will
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
      if ((i !== 0) || flag) {
        csv += ',';
      }
      csv += '"' + props[i] + '"';
    }
    console.log('[addSCVColumnHeader][csv]: ' + csv);
    return csv;
  }

  toCSV () {

    let accNameProps = this.getAccNameProps();
    let ccrProps     = this.getColorContrastProps();
    let visProps     = this.getVisibilityProps();
    let htmlAttrProps    = this.getHTMLAttributeProps();
    let ariaAttrProps    = this.getARIAAttributeProps();

    let csv = '';
    csv += this.addCSVColumnHeaders(basicProps, false);
    csv += this.addCSVColumnHeaders(accNameProps);
    csv += this.addCSVColumnHeaders(ccrProps);
    csv += this.addCSVColumnHeaders(visProps);
    csv += this.addCSVColumnHeaders(htmlAttrProps);
    csv += this.addCSVColumnHeaders(ariaAttrProps);
    csv += '\n';

    for (let er in this.elementResults) {
      let info = this.elementResults[er];
      csv += this.resultElementInfo.toCSV(info, basicProps, accNameProps, ccrProps, visProps, htmlAttrProps, ariaAttrProps);
    }
    return csv
  }

  resize (mainHeight) {
    const adjustment = 160;
    const highlightHeight = this.highlightSelect.offsetHeight;
    const h = (mainHeight - highlightHeight - adjustment);

    this.elementResultGrid.resize((h/2));
    this.resultElementInfo.resize((h/2));
    this.resultRuleInfo.resize(h);
  }

  initGrid () {

    this.resultTablist.tabLabel1 = getMessage('detailsActionLabel');
    this.resultTablist.tabLabel2 = getMessage('elementResultsLabel');
    // Make element results the deafult tab
    this.resultTablist.showTabpanel('tabpane-2');

    this.elementResultGrid.addHeaderCell(getMessage('elementLabel'), 'element-info');
    this.elementResultGrid.addHeaderCell(getMessage('resultLabel'), 'result');
    this.elementResultGrid.addHeaderCell(getMessage('positionAbbrev'), 'position', getMessage('positionLabel'));
    this.elementResultGrid.addHeaderCell(getMessage('actionLabel'), 'action');

  }

  getResultStyle(result) {
    let style = 'not-applicable';

    switch (result){
      case 'MC':
        style = 'manual-check';
        break;
      case 'P':
        style = 'passed';
        break;
      case 'V':
        style = 'violation';
        break;
      case 'W':
        style = 'warning';
        break;
      case 'H':
        style = 'hidden';
        break;
      default:
        break;
    }
    return style;
  }

  // returns a number for the sorting the result value
  getResultSortingValue(result) {
    return ['', 'H', 'P', 'MC', 'W', 'V'].indexOf(result);
  }

  getRowId (position) {
    return 'er-' + position;
  }

  getResultAccessibleName (result) {
    let accName = getMessage('notApplicableLabel');

    switch (result){
      case 'MC':
        accName = getMessage('manualCheckLabel');
        break;
      case 'P':
        accName = getMessage('passedLabel');
        break;
      case 'V':
        accName = getMessage('violationLabel');
        break;
      case 'W':
        accName = getMessage('warningLabel');
        break;
      default:
        break;
    }
    return accName;
  }

  update (infoRuleResult) {
    let i, id, pos, row, er, rowId, style, sortValue, label, rowAccName, cellAccName = '', elemName;
    let count = 0;


    this.elementsResults = {};

    this.elementSummary.violations   = infoRuleResult.violations;
    this.elementSummary.warnings     = infoRuleResult.warnings;
    this.elementSummary.manualChecks = infoRuleResult.manual_checks;
    this.elementSummary.passed       = infoRuleResult.passed;
    this.elementSummary.hidden       = infoRuleResult.hidden;

    this.elementResultGrid.deleteDataRows();

    getOptions().then( (options) => {
      for (i = 0; i < infoRuleResult.elementResults.length; i += 1) {
        er = infoRuleResult.elementResults[i];

        // check to exclude pass and not applicable rules
        if (options.resultsIncludePassNa ||
            (['', 'V', 'W', 'MC'].indexOf(er.result) > 0)) {

          rowId = this.getRowId(er.position);

          // convert JSON strings to objects
          if (er.accNameInfo) {
            er.accNameInfo = JSON.parse(er.accNameInfo);
          }
          if (er.crrInfo) {
            er.ccrInfo = JSON.parse(er.ccrInfo);
          }
          if (er.ccrInfo) {
            er.ccrInfo = JSON.parse(er.ccrInfo);
          }

          if (er.visibilityInfo) {
            er.visibilityInfo = JSON.parse(er.visibilityInfo);
          }

          if (er.htmlAttrInfo) {
            er.htmlAttrInfo = JSON.parse(er.htmlAttrInfo);
          }

          if (er.ariaAttrInfo) {
            er.ariaAttrInfo = JSON.parse(er.ariaAttrInfo);
          }

          // Save element result object
          this.elementResults[rowId] = er;
          row = this.elementResultGrid.addRow(rowId);

          // Add element information cell (column 1)

          elemName = er.element;
          if (er.tagName) {
            elemName = er.tagName;
          }

          rowAccName = elemName;
          this.elementResultGrid.addDataCell(row, elemName, '', 'element-info');

          // Add result information cell (column 2)
          style = 'result ' + this.getResultStyle(er.result);
          sortValue = this.getResultSortingValue(er.result);
          cellAccName = this.getResultAccessibleName(er.result);
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, er.result, cellAccName, style, sortValue);

          // Add position information cell (column 3)
          cellAccName = er.position + ' ' + getMessage('domPositionLabel');
          rowAccName += ', ' + cellAccName;
          this.elementResultGrid.addDataCell(row, er.position, cellAccName, 'position', (-1 * er.position));

          // Add action information cell (column 4)
          rowAccName += ', ' + er.actionMessage;
          this.elementResultGrid.addDataCell(row, er.actionMessage, '', 'action');
          row.setAttribute('aria-label', rowAccName);

          count += 1;
        }
      }

      if (count > 0) {
        this.elementResultGrid.sortGridByColumn(2, 3, 0, 'descending');
        id = this.elementResultGrid.setSelectedRowUsingLastId();
        this.resultElementInfo.update(this.elementResults[id]);
        this.resultRuleInfo.update(infoRuleResult.detailsAction);
      } else {
        if (infoRuleResult.elementResults.length === 0) {
          label = getMessage('noResultsMsg');
        } else {
          label = getMessage('noViolationsWarningsMCResultsMsg');
        }
        console.log('[label]: ' + label);
        this.elementResultGrid.deleteDataRows(label);
        this.resultRuleInfo.clear(label);
        this.resultElementInfo.clear(label);
      }
    });
  }

  clear (message1, message2) {
    this.elementResultGrid.deleteDataRows(message1, message2);
    this.resultRuleInfo.clear(message1, message2);
    this.resultElementInfo.clear(message1, message2);
  }

  onRowSelectionCallback (id) {
    let position = false;
    if (id) {
      this.resultElementInfo.update(this.elementResults[id]);
      position = parseInt(id.substring(3));
      if (position && typeof position === 'number') {
        if (this.handleRowSelection) {
          this.handleRowSelection(position);
        }
      }
    }
  }

  onSelectChangeCallback () {
    let id = this.elementResultGrid.getSelectedRowId();
    if (id) {
      this.onRowSelectionCallback(id);
    }
  }
}
