/* viewSummary.js */

const getMessage  = browser.i18n.getMessage;
const sendMessage = browser.runtime.sendMessage;

import { ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';
import ViewSummaryCSV  from './viewSummaryCSV.js';


// The summary view for AInspector WCAG

export default class ViewSummary {
  constructor (id, handleRowActivation) {

    this.handleRowActivation = handleRowActivation;

    this.summaryNode   = document.getElementById(id);

    this.resultSummary = document.createElement('result-summary');
    this.summaryNode.appendChild(this.resultSummary);

    this.resultTablist = document.createElement('result-tablist');
    this.summaryNode.appendChild(this.resultTablist);

    this.rcResultGrid = document.createElement('result-grid');
    this.rcResultGrid.addClassNameToTable('summary');
    this.resultTablist.tabpanel1.appendChild(this.rcResultGrid);
    this.rcResultGrid.setRowActivationEventHandler(handleRowActivation);

    const div1 = document.createElement('div');
    div1.className = 'buttons';
    const button1 = document.createElement('button');
    button1.id = 'rc-details';
    button1.className = 'details';
    button1.textContent = getMessage('detailsLabel');
    button1.addEventListener('click', this.onDetailsButtonClick.bind(this));
    button1.disabled = true;
    div1.appendChild(button1)
    this.resultTablist.tabpanel1.appendChild(div1);
    this.rcResultGrid.setDetailsButton(button1);

    this.glResultGrid = document.createElement('result-grid');
    this.glResultGrid.addClassNameToTable('summary');
    this.resultTablist.tabpanel2.appendChild(this.glResultGrid);
    this.glResultGrid.setRowActivationEventHandler(handleRowActivation);

    const div2 = document.createElement('div');
    div2.className = 'buttons';
    const button2 = document.createElement('button');
    button2.id = 'gl-details';
    button2.className = 'details';
    button2.textContent = getMessage('detailsLabel');
    button2.addEventListener('click', this.onDetailsButtonClick.bind(this));
    button2.disabled = true;
    div2.appendChild(button2)
    this.resultTablist.tabpanel2.appendChild(div2);
    this.glResultGrid.setDetailsButton(button2);

    this.rcResults = [];
    this.glResults = [];

    this.json = '{}';

    this.initGrids();

  }

  toCSV (options, title, location
    ) {
    let viewCSV = new ViewSummaryCSV(this.rcResults, this.glResults);
    return viewCSV.getCSV(options, title, location);
  }

  toJSON () {
    return this.json;
  }

  resize (size) {
    return false;
  }

  set disabled (value) {
    this.rcResultGrid.disabled = value;
    this.glResultGrid.disabled = value;
  }

  get disabled () {
    let value = this.rcResultGrid.disabled && this.glResultGrid.disabled;
    return value;
  }

  onDetailsButtonClick (event) {
    let tgt = event.currentTarget;
    let rowId = '';

    if (tgt.id) {
      if (tgt.id.indexOf('rc') >= 0) {
        rowId = this.rcResultGrid.getSelectedRowId();
      } else {
        rowId = this.glResultGrid.getSelectedRowId();
      }
      if (this.handleRowActivation && rowId) {
        this.handleRowActivation(rowId);
      }
    }
  }

  initGrids () {
    let i, id, label, row;

    this.resultTablist.tabLabel1 = getMessage("ruleCategoriesLabel");

    this.rcResultGrid.addHeaderCell(getMessage('ruleCategoriesLabel'), 'group text');
    this.rcResultGrid.addHeaderCell(getMessage('violationsAbbrev'),    'summ num', getMessage('violationsLabel'));
    this.rcResultGrid.addHeaderCell(getMessage('warningsAbbrev'),      'summ num', getMessage('warningsLabel'));
    this.rcResultGrid.addHeaderCell(getMessage('manualChecksAbbrev'),  'summ num', getMessage('manualChecksLabel'));
    this.rcResultGrid.addHeaderCell(getMessage('passedAbbrev'),        'summ num', getMessage('passedLabel'));

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      id = ruleCategoryIds[i];
      label = getMessage(getRuleCategoryLabelId(id));
      // The row ID identifies the row as a rule category rule group and
      // includes which category using its numerical constant
      row = this.rcResultGrid.addRow('rc' + id);
      this.rcResultGrid.addDataCell(row, label, '', 'text');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
    }

    this.resultTablist.tabLabel2 = getMessage("guidelinesLabel");
    this.glResultGrid.addHeaderCell(getMessage('guidelinesLabel'),     'group text');
    this.glResultGrid.addHeaderCell(getMessage('violationsAbbrev'),   'summ num', getMessage('violationsLabel'));
    this.glResultGrid.addHeaderCell(getMessage('warningsAbbrev'),     'summ num', getMessage('warningsLabel'));
    this.glResultGrid.addHeaderCell(getMessage('manualChecksAbbrev'), 'summ num', getMessage('manualChecksLabel'));
    this.glResultGrid.addHeaderCell(getMessage('passedAbbrev'),       'summ num', getMessage('passedLabel'));

    for (i = 0; i < guidelineIds.length; i += 1 ) {
      id = guidelineIds[i];
      label = getMessage(getGuidelineLabelId(id));
      // The row ID identifies the row as a guideline rule group and
      // includes which guideline using its numerical constant
      row = this.glResultGrid.addRow('gl' + id);
      this.glResultGrid.addDataCell(row, label, '', 'text');
      this.glResultGrid.addDataCell(row, '', '-', 'summ num');
      this.glResultGrid.addDataCell(row, '', '-', 'summ num');
      this.glResultGrid.addDataCell(row, '', '-', 'summ num');
      this.glResultGrid.addDataCell(row, '', '-', 'summ num');
    }
  }

  getNameForNumber(count, idOne, idNotOne) {
    if (count === 1) {
      return count + ' ' + getMessage(idOne);
    }
    return count + ' ' + getMessage(idNotOne);
  }

  update (infoSummary) {
    let i, gResult, row, rowAccName, cell, celAcclName;

    this.rcResultGrid.enable();
    this.glResultGrid.enable();

    this.resultSummary.violations   = infoSummary.violations;
    this.resultSummary.warnings     = infoSummary.warnings;
    this.resultSummary.manualChecks = infoSummary.manual_checks;
    this.resultSummary.passed       = infoSummary.passed;

    this.json = infoSummary.json;

    this.rcResults = infoSummary.rcResults;

    for (i = 0; i < this.rcResults.length; i += 1) {
      gResult = this.rcResults[i];
      row = this.rcResultGrid.getRowById('rc' + gResult.id);

      cell = this.rcResultGrid.getCellByPosition(row, 1);
      rowAccName = cell.textContent;

      celAcclName = this.getNameForNumber(gResult.violations, 'violationLabel', 'violationsLabel')
      rowAccName += ', ' + celAcclName;
      this.rcResultGrid.updateDataCell(row, 2, gResult.violations, celAcclName);

      celAcclName = this.getNameForNumber(gResult.warnings, 'warningLabel', 'warningsLabel');
      rowAccName += ', ' + celAcclName;
      this.rcResultGrid.updateDataCell(row, 3, gResult.warnings, celAcclName);

      celAcclName = this.getNameForNumber(gResult.manual_checks, 'manualCheckLabel', 'manualChecksLabel')
      rowAccName += ', ' + celAcclName;
      this.rcResultGrid.updateDataCell(row, 4, gResult.manual_checks, celAcclName);

      celAcclName = ', ' + gResult.passed + ' ' + getMessage('passedLabel');
      rowAccName += ', ' + celAcclName;
      this.rcResultGrid.updateDataCell(row, 5, gResult.passed, celAcclName);

      // Add accessible name describing the row content
      row.setAttribute('aria-label', rowAccName);
    }

    this.rcResultGrid.setSelectedRowUsingLastId();

    this.glResults = infoSummary.glResults;

    for (i = 0; i < this.glResults.length; i += 1) {
      gResult = this.glResults[i];
      row = this.glResultGrid.getRowById('gl' + gResult.id);

      cell = this.glResultGrid.getCellByPosition(row, 1)
      rowAccName = cell.textContent;

      celAcclName = this.getNameForNumber(gResult.violations, 'violationLabel', 'violationsLabel')
      rowAccName += ', ' + celAcclName;
      this.glResultGrid.updateDataCell(row, 2, gResult.violations, celAcclName);

      celAcclName = this.getNameForNumber(gResult.warnings, 'warningLabel', 'warningsLabel')
      rowAccName += ', ' + celAcclName;
      this.glResultGrid.updateDataCell(row, 3, gResult.warnings, celAcclName);

      celAcclName = this.getNameForNumber(gResult.manual_checks, 'manualCheckLabel', 'manualChecksLabel')
      rowAccName += ', ' + celAcclName;
      this.glResultGrid.updateDataCell(row, 4, gResult.manual_checks, celAcclName);

      celAcclName = ', ' + gResult.passed + ' ' + getMessage('passedLabel');
      rowAccName += ', ' + celAcclName;
      this.glResultGrid.updateDataCell(row, 5, gResult.passed, celAcclName);

      // Add accessible name describing the row content
      row.setAttribute('aria-label', rowAccName);
    }

    this.glResultGrid.setSelectedRowUsingLastId();

  }

  clear () {
    this.resultSummary.clear();

    this.rcResultGrid.disable();
    ruleCategoryIds.forEach( (id) => {
      this.rcResultGrid.clearRow('rc' + id)
    });

    this.glResultGrid.disable();
    guidelineIds.forEach( (id) => {
      this.glResultGrid.clearRow('gl' + id);
    });

  }
}
