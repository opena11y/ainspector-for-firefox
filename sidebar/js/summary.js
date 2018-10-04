"use strict";

var summaryPanel = {

  rcOptions: [],
  glOptions: [],
  detailsButton: false,
  rcGrid: false,
  glGrid: false,
  tablist: false,

  init: function() {

    this.rcOptions.push({ 'id': 0x0001, 'label': 'Landmarks'});
    this.rcOptions.push({ 'id': 0x0002, 'label': 'Headings'});
    this.rcOptions.push({ 'id': 0x0004, 'label': 'Styles/Content'});
    this.rcOptions.push({ 'id': 0x0008, 'label': 'Images'});
    this.rcOptions.push({ 'id': 0x0010, 'label': 'Links'});
    this.rcOptions.push({ 'id': 0x0020, 'label': 'Tables'});
    this.rcOptions.push({ 'id': 0x0040, 'label': 'Forms'});
    this.rcOptions.push({ 'id': 0x0080, 'label': 'Widgets/Scripts'});
    this.rcOptions.push({ 'id': 0x0100, 'label': 'Audio/Video'});
    this.rcOptions.push({ 'id': 0x0200, 'label': 'Keyboard'});
    this.rcOptions.push({ 'id': 0x0400, 'label': 'Timing'});
    this.rcOptions.push({ 'id': 0x0800, 'label': 'Site Navigation'});
    this.rcOptions.push({ 'id': 0x0FFF, 'label': 'All'});

    this.glOptions.push({ 'id': 0x000010, 'label': '1.1 Text Alternatives'});
    this.glOptions.push({ 'id': 0x000020, 'label': '1.2 Time-based Media'});
    this.glOptions.push({ 'id': 0x000040, 'label': '1.3 Adaptable'});
    this.glOptions.push({ 'id': 0x000080, 'label': '1.4 Distinguishable'});
    this.glOptions.push({ 'id': 0x000100, 'label': '2.1 Keyboard Accessible'});
    this.glOptions.push({ 'id': 0x000200, 'label': '2.2 Enough Time'});
    this.glOptions.push({ 'id': 0x000400, 'label': '2.3 Seizures'});
    this.glOptions.push({ 'id': 0x000800, 'label': '2.4 Navigable'});
    this.glOptions.push({ 'id': 0x001000, 'label': '3.1 Readable'});
    this.glOptions.push({ 'id': 0x002000, 'label': '3.2 Predictable'});
    this.glOptions.push({ 'id': 0x004000, 'label': '3.3 Input Assistance'});
    this.glOptions.push({ 'id': 0x010000, 'label': '4.1 Compatible'});
    this.glOptions.push({ 'id': 0x01FFF0, 'label': 'All'});


    this.rcGrid = new Grid(document.getElementById('rc_grid'));
    this.rcGrid.init();

    this.glGrid = new Grid(document.getElementById('gl_grid'));
    this.glGrid.init();

    this.tablist = new Tablist(document.getElementById('summary_tablist'));
    this.tablist.init();

    this.detailsButton = document.getElementById('details_group');
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

    var row = grid.addRow(id, this.handleAction);

    row.addCell(label, 'text category', '', true);
    row.addCell(v,  'num result');
    row.addCell(w,  'num result');
    row.addCell(mc, 'num result');
    row.addCell(p,  'num result');
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

    this.addGroupResultRow(grid, group + '-' + 0x0FFF, 'All', evaluationResult.violations, evaluationResult.warnings, evaluationResult.manual_checks, evaluationResult.passed);

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
      this.glGrid.setSelectedToRowById('gl-' + messageArgs.groupId);
      this.rcGrid.setSelectedToRowById();
    }
  }

}









// Details button for group




