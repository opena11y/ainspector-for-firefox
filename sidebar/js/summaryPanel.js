"use strict";

var summaryPanel = {

  rcOptions: [],
  glOptions: [],
  detailsButton: false,
  rcGrid: false,
  glGrid: false,
  tablist: false,

  init: function() {


    this.rcOptions.push({ 'id': 0x0001, 'label': 'labelLandmarks'});
    this.rcOptions.push({ 'id': 0x0002, 'label': 'labelHeadings'});
    this.rcOptions.push({ 'id': 0x0004, 'label': 'labelStylesContent'});
    this.rcOptions.push({ 'id': 0x0008, 'label': 'labelImages'});
    this.rcOptions.push({ 'id': 0x0010, 'label': 'labelLinks'});
    this.rcOptions.push({ 'id': 0x0020, 'label': 'labelTables'});
    this.rcOptions.push({ 'id': 0x0040, 'label': 'labelForms'});
    this.rcOptions.push({ 'id': 0x0080, 'label': 'labelWidgetsScripts'});
    this.rcOptions.push({ 'id': 0x0100, 'label': 'labelAudioVideo'});
    this.rcOptions.push({ 'id': 0x0200, 'label': 'labelKeyboard'});
    this.rcOptions.push({ 'id': 0x0400, 'label': 'labelTiming'});
    this.rcOptions.push({ 'id': 0x0800, 'label': 'labelSiteNavigation'});
    this.rcOptions.push({ 'id': 0x0FFF, 'label': 'labelAll'});

    this.glOptions.push({ 'id': 0x000010, 'label': 'g1.1'});
    this.glOptions.push({ 'id': 0x000020, 'label': 'g1.2'});
    this.glOptions.push({ 'id': 0x000040, 'label': 'g1.3'});
    this.glOptions.push({ 'id': 0x000080, 'label': 'g1.4'});
    this.glOptions.push({ 'id': 0x000100, 'label': 'g2.1'});
    this.glOptions.push({ 'id': 0x000200, 'label': 'g2.2'});
    this.glOptions.push({ 'id': 0x000400, 'label': 'g2.3'});
    this.glOptions.push({ 'id': 0x000800, 'label': 'g2.4'});
    this.glOptions.push({ 'id': 0x001000, 'label': 'g3.1'});
    this.glOptions.push({ 'id': 0x002000, 'label': 'g3.2'});
    this.glOptions.push({ 'id': 0x004000, 'label': 'g3.3'});
    this.glOptions.push({ 'id': 0x010000, 'label': 'g4.1'});
    this.glOptions.push({ 'id': 0x01FFF0, 'label': 'labelAll'});

    this.rcGrid = new Grid(document.getElementById('rc_grid'));
    this.rcGrid.init();
    this.rcGrid.updateCellContentAndTitle(0, 0, i18n('labelCategories'), '');
    this.rcGrid.updateCellContentAndTitle(0, 1, i18n('labelV'),  i18n('labelViolations'));
    this.rcGrid.updateCellContentAndTitle(0, 2, i18n('labelW'),  i18n('labelWarnings'));
    this.rcGrid.updateCellContentAndTitle(0, 3, i18n('labelMC'), i18n('labelManualChecks'));
    this.rcGrid.updateCellContentAndTitle(0, 4, i18n('labelP'),  i18n('labelPass'));

    this.glGrid = new Grid(document.getElementById('gl_grid'));
    this.glGrid.init();
    this.glGrid.updateCellContentAndTitle(0, 0, i18n('labelGuidelines'), '');
    this.glGrid.updateCellContentAndTitle(0, 1, i18n('labelV'),  i18n('labelViolations'));
    this.glGrid.updateCellContentAndTitle(0, 2, i18n('labelW'),  i18n('labelWarnings'));
    this.glGrid.updateCellContentAndTitle(0, 3, i18n('labelMC'), i18n('labelManualChecks'));
    this.glGrid.updateCellContentAndTitle(0, 4, i18n('labelP'),  i18n('labelPass'));

    this.tablist = new Tablist(document.getElementById('summary_tablist'));
    this.tablist.init();
    this.tablist.updateTabContentAndTitle(0, i18n('labelRuleCategories'), '');
    this.tablist.updateTabContentAndTitle(1, i18n('labelGuidelines'), '');

    this.detailsButton = document.getElementById('details_group');
    this.detailsButton.innerHTML = i18n('labelDetails');
    this.detailsButton.addEventListener('click', this.handleDetailsButton.bind(this));
    this.detailsButton.disabled = true;

    window.addEventListener('resize', this.resize.bind(this));

    this.clear();

  },

  resize: function () {
    this.rcGrid.resize();
    this.glGrid.resize();
  },

  handleDetailsButton: function (event) {

    var id;

    switch (this.tablist.getSelectedTabId()) {
      case 'gl_tab':
        id = this.glGrid.getSelectedId();
        break;

      default:
        id = this.rcGrid.getSelectedId();
        break;
    }

    if (id) {
      handleGetGroup(id);
    }
  },

  hide: function() {
    hide('summary_panel');
  },

  show: function() {
    show('summary_panel');
    this.resize();
    backButton.disabled = true;
  },

  handleAction: function(type, id) {

    switch (type) {
      case 'activate':
        handleGetGroup(id);
        break;

      case 'click':
        break;

      case 'doubleClick':
        handleGetGroup(id);
        break;

      case 'focus':
        summaryPanel.detailsButton.disabled = false;
        break;

      default:
        break;

    }
  },

  addGroupResultRow: function (grid, id, label, v, w, mc, p) {

    function getAccName(value, singular, plural) {
      var accName = '';

      if (typeof value === 'number') {
        switch (value) {
          case 0:
            accName = i18n('labelNo') + ' ' + plural + '; ';
            break;

          case 1:
            accName = '1 ' + singular + '; ';
            break;

          default:
            accName = value + ' ' + plural + '; ';
            break;
        }
      }
      return accName;
    }

    var row = grid.addRow(id, this.handleAction);

    row.addCell(i18n(label), 'text category', '', '', true);
    row.addCell(v,  'num result', getAccName(v,  i18n('labelViolation'),   i18n('labelViolations')));
    row.addCell(w,  'num result', getAccName(w,  i18n('labelWarning'),     i18n('labelWarnings')));
    row.addCell(mc, 'num result', getAccName(mc, i18n('labelManualCheck'), i18n('labelManualChecks')));
    row.addCell(p,  'num result', getAccName(p,  i18n('labelPassed'),      i18n('labelPassed')));
  },

  clear: function () {
    // update Rule Summary
    document.getElementById("summary_violations").innerHTML      = '-';
    document.getElementById("summary_warnings").innerHTML        = '-';
    document.getElementById("summary_manual_checks").innerHTML   = '-';
    document.getElementById("summary_passed").innerHTML          = '-';

    // Update Group Results

    this.rcGrid.clearRows();
    for (let i = 0; i < this.rcOptions.length; i++) {
      this.addGroupResultRow(this.rcGrid, '', this.rcOptions[i].label, '-', '-', '-', '-');
    }


    this.glGrid.clearRows();
    for (let i = 0; i < this.glOptions.length; i++) {
      this.addGroupResultRow(this.glGrid, '', this.glOptions[i].label, '-', '-', '-', '-');
    }

    this.rcGrid.resize();
    this.glGrid.resize();
  },

  updateGroupResults: function(group, groupResults, evaluationResult) {

    var grid = this.rcGrid;

    if (group === 'gl') {
      grid = this.glGrid;
    }

    grid.clearRows();

    for (let i = 0; i < groupResults.length; i++) {
      var gr = groupResults[i];
      this.addGroupResultRow(grid, group + '-' + gr.id, gr.label, gr.violations, gr.warnings, gr.manual_checks, gr.passed);
    }

    this.addGroupResultRow(grid, group + '-' + 0x0FFF, 'labelAll', evaluationResult.violations, evaluationResult.warnings, evaluationResult.manual_checks, evaluationResult.passed);

  },

  update: function(evaluationResult) {

    // update Rule Summary
    document.getElementById("summary_violations").innerHTML      = evaluationResult.violations;
    document.getElementById("summary_warnings").innerHTML        = evaluationResult.warnings;
    document.getElementById("summary_manual_checks").innerHTML   = evaluationResult.manual_checks;
    document.getElementById("summary_passed").innerHTML          = evaluationResult.passed;

    // Update Group Results

    this.updateGroupResults('rc', evaluationResult.rcResults, evaluationResult);
    this.updateGroupResults('gl', evaluationResult.glResults, evaluationResult);

  },

  setFocus: function () {
    if (messageArgs.groupType === 'rc') {
      this.tablist.setSelectedById('rc_tab', false);
      this.rcGrid.setSelectedToRowById('rc-' + messageArgs.groupId);
      this.glGrid.setSelectedToRowById();
    }
    else {
      this.tablist.setSelectedById('gl_tab', false);
      this.rcGrid.setSelectedToRowById();
      this.glGrid.setSelectedToRowById('gl-' + messageArgs.groupId);
    }
  }

}



