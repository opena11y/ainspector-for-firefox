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

    // Rule Category tabpanel
    // create grid for rule category results
    this.rcResultGrid = document.createElement('result-grid');
    this.rcResultGrid.addClassNameToTable('summary');
    this.resultTablist.tabpanel1.appendChild(this.rcResultGrid);
    this.rcResultGrid.setRowActivationEventHandler(handleRowActivation);

    // create a middle section DIV for rule category
    const rcMiddleSectionDiv = document.createElement('div');
    rcMiddleSectionDiv.className = 'middle-section';
    this.resultTablist.tabpanel1.appendChild(rcMiddleSectionDiv);

    // create the rule category rule details buttons
    this.rcDetailsButton = this.createDetailsButton('rc-details', 'd');
    this.rcResultGrid.setDetailsButton(this.rcDetailsButton);
    rcMiddleSectionDiv.appendChild(this.rcDetailsButton);

    // WCAG Guidelines tabpanel
    // create grid for guideline results
    this.glResultGrid = document.createElement('result-grid');
    this.glResultGrid.addClassNameToTable('summary');
    this.resultTablist.tabpanel2.appendChild(this.glResultGrid);
    this.glResultGrid.setRowActivationEventHandler(handleRowActivation);

    // create a middle section DIV for guidelines
    const glMiddleSection = document.createElement('div');
    glMiddleSection.className = 'middle-section';
    this.resultTablist.tabpanel2.appendChild(glMiddleSection);

    // create the guidelines details button
    this.glDetailsButton = this.createDetailsButton('gl-details');
    glMiddleSection.appendChild(this.glDetailsButton)
    this.glResultGrid.setDetailsButton(this.glDetailsButton);

    this.rcResults = [];
    this.glResults = [];

    this.allRuleResults = [];

    this.json = '{}';

    this.initGrids();

  }

  toCSV (options, title, location) {
    let viewCSV = new ViewSummaryCSV(this.resultSummary, this.rcResults, this.glResults, this.allRuleResults);
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

  createDetailsButton (id) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'details';
    button.textContent = getMessage('detailsLabel');
    button.addEventListener('click', this.onDetailsButtonClick.bind(this));
    button.disabled = true;
    return button;
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

    this.rcResultGrid.addHeaderCell(getMessage('ruleCategoryLabel'), 'group text');
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
    this.glResultGrid.addHeaderCell(getMessage('guidelineLabel'),     'group text');
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

    this.allRuleResults = infoSummary.allRuleResults;

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

    if (this.resultTablist.selectedTabId === 'tabpanel-1') {
      this.rcResultGrid.focus();
    } else {
      this.glResultGrid.focus();
    }

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
