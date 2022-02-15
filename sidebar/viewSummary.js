/* viewSummary.js */

import { GUIDELINES, RULE_CATEGORIES, ruleCategoryIds, guidelineIds, getRuleCategoryLabelId, getGuidelineLabelId } from './constants.js';
import ViewSummaryCSV  from './viewSummaryCSV.js';

// Get message strings from locale-specific messages.json file
const getMessage  = browser.i18n.getMessage;
const msg = {};
msg.detailsLabel        = getMessage('detailsLabel');
msg.ruleCategoriesLabel = getMessage('ruleCategoriesLabel');
msg.ruleCategoryLabel   = getMessage('ruleCategoryLabel');
msg.violationsAbbrev    = getMessage('violationsAbbrev');
msg.violationsLabel     = getMessage('violationsLabel');
msg.violationLabel      = getMessage('violationLabel');
msg.warningsAbbrev      = getMessage('warningsAbbrev');
msg.warningsLabel       = getMessage('warningsLabel');
msg.warningLabel        = getMessage('warningLabel');
msg.manualChecksAbbrev  = getMessage('manualChecksAbbrev');
msg.manualChecksLabel   = getMessage('manualChecksLabel');
msg.manualCheckLabel    = getMessage('manualCheckLabel');
msg.passedAbbrev        = getMessage('passedAbbrev');
msg.passedLabel         = getMessage('passedLabel');
msg.guidelinesLabel     = getMessage('guidelinesLabel');
msg.guidelineLabel      = getMessage('guidelineLabel');
msg.landmarksLabel      = getMessage('landmarksLabel');
msg.headingsLabel       = getMessage('headingsLabel');
msg.stylesContentLabel  = getMessage('stylesContentLabel');
msg.imagesLabel         = getMessage('imagesLabel');
msg.formsLabel          = getMessage('formsLabel');
msg.linksLabel          = getMessage('linksLabel');
msg.tablesLabel         = getMessage('tablesLabel');
msg.widgetsScriptsLabel = getMessage('widgetsScriptsLabel');
msg.audioVideoLabel     = getMessage('audioVideoLabel');
msg.keyboardLabel       = getMessage('keyboardLabel');
msg.timingLabel         = getMessage('timingLabel');
msg.siteNavigationLabel = getMessage('siteNavigationLabel');
msg.allRulesLabel       = getMessage('allRulesLabel');
msg.summaryLabel        = getMessage('summaryLabel');
msg.g1_1 = getMessage('g1.1');
msg.g1_2 = getMessage('g1.2');
msg.g1_3 = getMessage('g1.3');
msg.g1_4 = getMessage('g1.4');
msg.g2_1 = getMessage('g2.1');
msg.g2_2 = getMessage('g2.2');
msg.g2_3 = getMessage('g2.3');
msg.g2_4 = getMessage('g2.4');
msg.g3_1 = getMessage('g3.1');
msg.g3_2 = getMessage('g3.2');
msg.g3_3 = getMessage('g3.3');
msg.g4_1 = getMessage('g4.1');

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
    button.textContent = msg.detailsLabel;
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

    this.resultTablist.tabLabel1 = msg.ruleCategoriesLabel;

    this.rcResultGrid.addHeaderCell(msg.ruleCategoryLabel, 'group text');
    this.rcResultGrid.addHeaderCell(msg.violationsAbbrev,    'summ num', msg.violationsLabel);
    this.rcResultGrid.addHeaderCell(msg.warningsAbbrev,      'summ num', msg.warningsLabel);
    this.rcResultGrid.addHeaderCell(msg.manualChecksAbbrev,  'summ num', msg.manualChecksLabel);
    this.rcResultGrid.addHeaderCell(msg.passedAbbrev,        'summ num', msg.passedLabel);

    for (i = 0; i < ruleCategoryIds.length; i += 1 ) {
      id = ruleCategoryIds[i];
      label = msg[getRuleCategoryLabelId(id)];
      // The row ID identifies the row as a rule category rule group and
      // includes which category using its numerical constant
      row = this.rcResultGrid.addRow('rc' + id);
      this.rcResultGrid.addDataCell(row, label, '', 'text');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
      this.rcResultGrid.addDataCell(row, '', '-', 'summ num');
    }

    this.resultTablist.tabLabel2 = msg.guidelinesLabel;
    this.glResultGrid.addHeaderCell(msg.guidelineLabel,     'group text');
    this.glResultGrid.addHeaderCell(msg.violationsAbbrev,   'summ num', msg.violationsLabel);
    this.glResultGrid.addHeaderCell(msg.warningsAbbrev,     'summ num', msg.warningsLabel);
    this.glResultGrid.addHeaderCell(msg.manualChecksAbbrev, 'summ num', msg.manualChecksLabel);
    this.glResultGrid.addHeaderCell(msg.passedAbbrev,       'summ num', msg.passedLabel);

    for (i = 0; i < guidelineIds.length; i += 1 ) {
      id = guidelineIds[i];
      label = msg[getGuidelineLabelId(id).replaceAll('.', '_')];
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

  getNameForNumber(count, messageOne, messageNotOne) {
    if (count === 1) {
      return count + ' ' + messageOne;
    }
    return count + ' ' + messageNotOne;
  }

  updateRow (id, grid, result) {
    let row = grid.getRowById(id);

    let cell = grid.getCellByPosition(row, 1);
    let rowAccName = cell.textContent;

    let celAcclName = this.getNameForNumber(result.violations, msg.violationLabel, msg.violationsLabel)
    rowAccName += ', ' + celAcclName;
    this.rcResultGrid.updateDataCell(row, 2, result.violations, celAcclName);

    celAcclName = this.getNameForNumber(result.warnings, msg.warningLabel, msg.warningsLabel);
    rowAccName += ', ' + celAcclName;
    this.rcResultGrid.updateDataCell(row, 3, result.warnings, celAcclName);

    celAcclName = this.getNameForNumber(result.manual_checks, msg.manualCheckLabel, msg.manualChecksLabel);
    rowAccName += ', ' + celAcclName;
    this.rcResultGrid.updateDataCell(row, 4, result.manual_checks, celAcclName);

    celAcclName = ', ' + result.passed + ' ' + msg.passedLabel;
    rowAccName += ', ' + celAcclName;
    this.rcResultGrid.updateDataCell(row, 5, result.passed, celAcclName);

    // Add accessible name describing the row content
    row.setAttribute('aria-label', rowAccName);
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
      this.updateRow('rc' + gResult.id, this.rcResultGrid, gResult);
    }
    this.updateRow('rc' + RULE_CATEGORIES.ALL, this.rcResultGrid, infoSummary);
    this.rcResultGrid.setSelectedRowUsingLastId();

    this.glResults = infoSummary.glResults;

    for (i = 0; i < this.glResults.length; i += 1) {
      gResult = this.glResults[i];
      this.updateRow('gl' + gResult.id, this.glResultGrid, gResult);
    }
    this.updateRow('gl' + GUIDELINES.ALL, this.glResultGrid, infoSummary);
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
