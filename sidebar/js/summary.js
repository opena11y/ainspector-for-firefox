"use strict";

var rcOptions = [];
rcOptions.push({ 'id': 0x0001, 'label': 'Landmarks'});
rcOptions.push({ 'id': 0x0002, 'label': 'Headings'});
rcOptions.push({ 'id': 0x0004, 'label': 'Styles/Content'});
rcOptions.push({ 'id': 0x0008, 'label': 'Images'});
rcOptions.push({ 'id': 0x0010, 'label': 'Links'});
rcOptions.push({ 'id': 0x0020, 'label': 'Tables'});
rcOptions.push({ 'id': 0x0040, 'label': 'Forms'});
rcOptions.push({ 'id': 0x0080, 'label': 'Widgets/Scripts'});
rcOptions.push({ 'id': 0x0100, 'label': 'Audio/Video'});
rcOptions.push({ 'id': 0x0200, 'label': 'Keyboard'});
rcOptions.push({ 'id': 0x0400, 'label': 'Timing'});
rcOptions.push({ 'id': 0x0800, 'label': 'Site Navigation'});
rcOptions.push({ 'id': 0x0FFF, 'label': 'All'});

var glOptions = [];
glOptions.push({ 'id': 0x000010, 'label': '1.1 Text Alternatives'});
glOptions.push({ 'id': 0x000020, 'label': '1.2 Time-based Media'});
glOptions.push({ 'id': 0x000040, 'label': '1.3 Adaptable'});
glOptions.push({ 'id': 0x000080, 'label': '1.4 Distinguishable'});
glOptions.push({ 'id': 0x000100, 'label': '2.1 Keyboard Accessible'});
glOptions.push({ 'id': 0x000200, 'label': '2.2 Enough Time'});
glOptions.push({ 'id': 0x000400, 'label': '2.3 Seizures'});
glOptions.push({ 'id': 0x000800, 'label': '2.4 Navigable'});
glOptions.push({ 'id': 0x001000, 'label': '3.1 Readable'});
glOptions.push({ 'id': 0x002000, 'label': '3.2 Predictable'});
glOptions.push({ 'id': 0x004000, 'label': '3.3 Input Assistance'});
glOptions.push({ 'id': 0x010000, 'label': '4.1 Compatible'});
glOptions.push({ 'id': 0x01FFF0, 'label': 'All'});

function hideSummaryPanel() {
  hide('summary_panel');
}

function showSummaryPanel() {
  show('summary_panel');
}

function addGroupResultRow(grid, id, label, v, w, mc, p) {

  var row = grid.addRow(id, handleSummaryPanelAction);

  row.addCell(label, 'text category', '', true);
  row.addCell(v,  'num result');
  row.addCell(w,  'num result');
  row.addCell(mc, 'num result');
  row.addCell(p,  'num result');
}

function clearSummaryPanel() {
  // update Rule Summary
  document.getElementById("summary_violations").innerHTML      = '-';
  document.getElementById("summary_warnings").innerHTML        = '-';
  document.getElementById("summary_manual_checks").innerHTML   = '-';
  document.getElementById("summary_passed").innerHTML          = '-';

  // Update Group Results

  rcGrid.clearRows();
  for (let i = 0; i < rcOptions.length; i++) {
    addGroupResultRow(rcGrid, '', rcOptions[i].label, '-', '-', '-', '-');
  }


  glGrid.clearRows();
  for (let i = 0; i < glOptions.length; i++) {
    addGroupResultRow(glGrid, '', glOptions[i].label, '-', '-', '-', '-');
  }

}

function updateSummaryPanel(evaluationResult) {

  // update Rule Summary
  document.getElementById("summary_violations").innerHTML      = evaluationResult.violations;
  document.getElementById("summary_warnings").innerHTML        = evaluationResult.warnings;
  document.getElementById("summary_manual_checks").innerHTML   = evaluationResult.manual_checks;
  document.getElementById("summary_passed").innerHTML          = evaluationResult.passed;

  // Update Group Results

  function updateGroupResults(group, groupResults) {

    var grid = rcGrid;

    if (group === 'gl') {
      grid = glGrid;
    }

    grid.clearRows();

    for (let i = 0; i < groupResults.length; i++) {
      var gr = groupResults[i];
      addGroupResultRow(grid, group + '-' + gr.id, gr.label, gr.violations, gr.warnings, gr.manual_checks, gr.passed);
    }

    addGroupResultRow(grid, group + '-' + 0x0FFF, 'All', evaluationResult.violations, evaluationResult.warnings, evaluationResult.manual_checks, evaluationResult.passed);

  }

  updateGroupResults('rc', evaluationResult.rcResults);
  updateGroupResults('gl', evaluationResult.glResults);

}

function setSummaryPanelFocus() {
  if (messageArgs.groupType === 'rc') {
    summaryTablist.setSelectedById('rc_tab', false);
    rcGrid.setSelectedToRowById('rc-' + messageArgs.groupId);
    glGrid.setSelectedToRowById();
  }
  else {
    summaryTablist.setSelectedById('gl_tab', false);
    glGrid.setSelectedToRowById('gl-' + messageArgs.groupId);
    rcGrid.setSelectedToRowById();
  }
};

function updateViewMenu() {
  viewMenu.removeAllOptions();

  viewMenu.addOption('summary', 'menuitem', 'Summary', function() {handleGetSummary();});

  viewMenu.addOption('', 'separator', '-------------');

  for (let i = 0; i < (rcOptions.length-1); i++) {
    viewMenu.addOption(rcOptions[i].id, 'menuitem', rcOptions[i].label, function() {var id = 'rc-' + rcOptions[i].id; handleGetGroup(id);});
  }

  viewMenu.addOption('', 'separator', '-------------');

  for (let i = 0; i < (glOptions.length-1); i++) {
    viewMenu.addOption(glOptions[i].id, 'menuitem', glOptions[i].label, function() {var id = 'gl-' + glOptions[i].id; handleGetGroup(id);});
  }

  viewMenu.addOption('', 'separator', '-------------');

  var last = rcOptions.length-1;

  viewMenu.addOption(rcOptions[last].id, 'menuitem', rcOptions[last].label, function() {var id = 'rc-' + rcOptions[last].id; handleGetGroup(id);});

};

function handleSummaryPanelAction(type, id) {


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
      detailsGroupButton.disabled = false;
      break;

  }
};

// Details button for group

function handleDetailsGroup(event) {

  var id;

  switch (summaryTablist.getSelectedTabId()) {
    case 'gl_tab':
      id = glGrid.getSelectedId();
      break;

    default:
      id = rcGrid.getSelectedId();
      break;
  }

  if (id) {
    handleGetGroup(id);
  }
};

var detailsGroupButton = document.getElementById('details_group');
detailsGroupButton.addEventListener('click', handleDetailsGroup);
