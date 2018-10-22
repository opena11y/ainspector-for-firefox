"use strict";

var rulePanel = {

  init: function () {

    this.ruleGrid = new Grid(document.getElementById('rule_grid'));
    this.ruleGrid.init();

    this.tablist = new Tablist(document.getElementById('rule_tablist'));
    this.tablist.init();
    this.tablist.updateTabContentAndTitle(0, i18n('labelDetailsAction'), '');
    this.tablist.updateTabContentAndTitle(1, i18n('labelElementResults'), '');

    window.addEventListener('resize', function() {
      rulePanel.ruleGrid.resize();
    });

  },

  hide: function () {
    hide('rule_panel');
  },

  show: function () {
    show('rule_panel');
    this.ruleGrid.resize();
    backButton.disabled = false;
  },

  handleAction: function (type, position) {

    messageArgs.position = position;

    switch (type) {
      case 'activate':
        handleGetRule(messageArgs.ruleId, position);
        break;

      case 'click':
        break;

      case 'doubleClick':
        handleGetRule(messageArgs.ruleId, position);
        break;

      case 'focus':

        messageArgs.option = 'highlight';

        browser.tabs.query({
            currentWindow: true,
            active: true
        }).then(sendMessageToTabs).catch(onError);

        break;

    }
  },

  addElementResultRow: function (element, result, position, actionMessage) {

    function getAccNameResult(result) {
      var accName = '';

      switch (result) {
        case 'V':
          accName = i18n('labelViolation');
          break;

        case 'W':
          accName = i18n('labelWarning');
          break;

        case 'MC':
          accName = i18n('labelManualCheck');
          break;

        case 'P':
          accName = i18n('labelPassed');
          break;

        default:
          break;

      }

      return accName;
    }

    var row = this.ruleGrid.addRow(position, this.handleAction);

    // Trim element length if too long
    if (element.length > 50) {
      element = element.substring(0, 47) + '...';
    }

    var cell = row.addCell(element, 'text element', '', true);

    cell = row.addCell(result, 'value result ' + result.toLowerCase());
    cell.setAccessibleName(getAccNameResult(result));

    cell = row.addCell(position, 'num position');
    cell.setAccessibleName(i18n('labelPosition') + ' ' + position);

    cell = row.addCell(actionMessage, 'text action');
    var id = position + '_element';
    cell.setId(id);
    cell.setLabelledby(id);

    return row;

  },

  clear: function () {
    var cells = document.querySelectorAll('tbody#element_results tr > *');

    for (let i = 0; i < cells.length; i++) {
      cells[i].textContent = '-';
    }
  },

  update: function (evaluationResult) {

    var firstRow = false;

    updateDetailsAction('da', evaluationResult.detailsAction);

    this.updateRulePanelSummaryResult(evaluationResult);

    var elementResults = evaluationResult.elementResults;

    this.ruleGrid.clearRows();

    elementResults.sort(function (a, b) {
      return b.resultValue - a.resultValue;
    });

    if (elementResults.length) {
      for (let i = 0; i < elementResults.length; i++) {
        var er = elementResults[i];
        var row = this.addElementResultRow(er.element, er.result, er.position, er.actionMessage);

        if (i === 0) {
          firstRow = row;
        }
      }
    }
    else {
      firstRow = this.addElementResultRow('No results', '', '', '');
    }
    if (firstRow) {
      firstRow.domNode.tabIndex = 0;
    }
  },

  updateRulePanelSummaryResult: function (evaluationResult) {

    document.getElementById('rule_panel_summary').innerHTML = evaluationResult.ruleResult.summary;
    var node = document.getElementById('rule_panel_result');
    node.textContent = evaluationResult.ruleResult.result;
    node.className = 'right ' + evaluationResult.ruleResult.result.toLowerCase();
  }

}





function updateDetailsAction(id, detailsAction) {

  function getDetails(items) {

    if (typeof items === 'string') {
      return items;
    }

    if (items.length === 1) {
      if(typeof items[0]  === 'string') {
        return items[0];
      }
      else {
        return items[0].title;
      }
    }

    var html = '<ul class="details">';
    for (let i=0; i < items.length; i++) {
      var item = items[i];
      if (typeof item === 'string') {
        html += '<li>' + items[i] + '</li>';
      }
      else {
        html += '<li><a href="' + items[i].url +'">' + items[i].title + '</li>';
      }
    }
    html += '</ul>';

    return html;

  }

  document.getElementById(id + '_definition').innerHTML      = getDetails(detailsAction.definition);
  document.getElementById(id + '_action').innerHTML          = getDetails(detailsAction.action);
  document.getElementById(id + '_purpose').innerHTML         = getDetails(detailsAction.purpose);
  document.getElementById(id + '_techniques').innerHTML      = getDetails(detailsAction.techniques);
  document.getElementById(id + '_target_elements').innerHTML = getDetails(detailsAction.targetElements);
  document.getElementById(id + '_compliance').innerHTML      = getDetails(detailsAction.compliance);
  document.getElementById(id + '_wcag').innerHTML            = getDetails(detailsAction.wcagPrimary);
  document.getElementById(id + '_information').innerHTML     = getDetails(detailsAction.informationalLinks);

  if (id === 'rr') {
    document.getElementById('rr_none_selected').style.display = 'none';
    document.getElementById('rr_rule_selected').style.display = 'block';
  }

};




window.addEventListener('resize', function() {

  function resize(id) {
    var node = document.getElementById(id);

    var totalWidth = refNode.getBoundingClientRect().right - node.getBoundingClientRect().left;

    node.style.width = totalWidth + 'px';

  }

  var refNode = document.getElementById('view_options_button');

  resize('rr_details_action');
  resize('da_tabpanel');

  repositionFooter('id_highlight_section');

});
