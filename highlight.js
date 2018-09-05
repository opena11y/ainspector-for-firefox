/**
 * @file highlight.js
 *
 * @desc Module that provides data structures and functions for highlighting
 *       elements on the current page.
 *
 * @external OpenAjax.a11y.RULE_SCOPE
 * @external OpenAjax.a11y.ELEMENT_RESULT_VALUE
 * @external OpenAjax.a11y.VISIBILITY
 */





/* ---------------------------------------------------------------- */
/*                      Highlight Module                            */
/* ---------------------------------------------------------------- */

var highlightModule = {

  /**
   * @function initHighlight
   *
   * @desc Initialize helper objects
   */
  initHighlight: function (properties) {
    var stringBundle = window.document.getElementById(properties.stringBundleId);
    this.highlightDivClass = properties.highlightDivClass;
    this.offScreenDivClass = properties.offScreenDivClass;
    this.offScreenDivId    = properties.offScreenDivId;

    this.show_element_manual_check = true;
    this.show_page_manual_check    = true;
    this.show_pass                 = true;
    this.show_hidden               = true;

    this.STRINGS = {
      violations:   stringBundle.getString('violations'),
      warnings:     stringBundle.getString('warnings'),
      manualChecks: stringBundle.getString('manualChecks'),
      passes:       stringBundle.getString('passes'),
      hidden:       stringBundle.getString('hidden'),
      offScreen:    stringBundle.getString('offScreen'),
      notVisible:   stringBundle.getString('notVisible'),
      noResults:    stringBundle.getString('noResults')
    };

    this.STYLES = {
      violations:   'border-collapse: separate; border: 2px solid crimson;',
      warnings:     'border-collapse: separate; border: 2px solid gold;',
      manualChecks: 'border-collapse: separate; border: 2px solid mediumblue;',
      passes:       'border-collapse: separate; border: 2px solid seagreen;',
      hidden:       'border-collapse: separate; border: 2px dotted grey;',
      noResults:    'border-collapse: separate; border: 2px dotted black;',

      visibleDiv:   'position: relative; height: 100%; padding: 2px;',

      offScreen:    'width: 40%; padding: 10px; margin: 2px; opacity: 0.85; ' +
                    'background-color: white; color: black; font-size: 12pt; ' +
                    'position: fixed; top: 2em; left: 2em; z-index: 100;' ,

      iconImage:    'background-color: transparent; border: 0; ' +
                    'position: absolute; top: 2px; right: 2px; ' +
                    'width: 16px; height: 16px;'
    };

    this.elementsWithoutContent = [
      'applet', 'area', 'dl', 'embed', 'frame', 'img', 'input',
      'object', 'ol', 'select', 'textarea', 'table', 'ul'
    ];

    this.infoImageBase64_v = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB2klEQVQ4EZVTyytEURj/nTt3iAkL8khGjI1HFsiKKRQpW/+BiNhYS0pWSl4pslOyVJJSJknZ2JhGUx5ThlLyKBmaO+Me33fm4ZrRxF3c853f9/t955zvIaSUsH7Bss766Gd0gOBuCDiVTyIoBPZ1m77uvPecW/kiGaBlyH4d9M8RMEIhNSspYQvAlEKsuJy14zhdjTAeC0DiwI1/T0J2JciZVgFxUF1Z28tB1El88l/FHJi5rGFb3JR21EejEa/12mVbs7CVFOGuZxAw1E1ROD2GnLYmvCxsILTtofTA1HV7o6YSlvJmaUpkN9TAXlXOhyCL7IKhfmj5DrzvHSuMD2StprKtoO+f4btUmyxXhVoLJ4chqAxPUyuQYSNJZK2WLFUSBsLnV2pnr3Eip70ZuR2t+Dg5Q2jn0MIik8qs/0RiO8MXD1BdAUdvO6Rp4nFiMZ1KPaBTSoPkqbN6I4E7mKEPOPrcsBXk4XVzF4b3wkqJ2+JW4w5L89DjDH9Aic23dzzPrKVRGGCtxu3JJUllhOOJfJnfwOfDc6o7VkbWcitfF7uXIOVoGisTIMSy6+FoTHUi9za3Zya+1cdcNQ8ExoaGelr1NkX97TkJsfIRJzEHjH9PY5z133H+AoP7xxWGaaVLAAAAAElFTkSuQmCC";

    this.infoImageBase64_w = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABrklEQVQ4Ea1Tu0pDQRA9u3mgicYHCgo+UvhCCxv/QHz9hYU2wTTiB1iKhSBGKz/APxCEVJY2igoRrGJtBPGBRLOeubMbY6EYcJrduTPnzJm5s8Y5h292a6bwgRU4zPP7kI+VYXCCGA4x4q4b880XgUmghB0m5gi2jUn1u0GNsQNMYB1wVfnuCQi+wTGDs/Xk3y4GRYxjSUi0klT+K1iIJVcwNAvpWWSL9WwC2XMg1h+5SFGQ+L1b6tsMMHwGDJ5Qu80J1vqB+Z55tEwDiQEFdG+on5xUv2MZaJ0BXk6pohZhLeXItNWqZT3jfSQZA9IL6ts0TwN0rQG1Z+BhX78TG+ct/CqgTsAWUnMMcdCvbMG2kWwRSI4ClV2SVJSAWC/d++9egVQXuY9HwNuVEnTlKfudBNHsFGDghMCjeKveaaBzlYNs1+QPVktkVYEQhiKS6XBn2RpH6s2xPwHEMsBzkdUv6N9TQYoj4Awq2yFTT2JttJ6yYcHCHILU0O/TMQkvQ5bMtCZY3cSS2WOEI27KCphw+X9aZXkY0W6jEEn7SYi2WgjvQNIaXqNHNfmcPwFafJrgyp1/fQAAAABJRU5ErkJggg==";

    this.infoImageBase64_m = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB3ElEQVQ4Ea1Tu0pDQRA960ViEgW/wEKIhRbxprZSEGz9ARsr0UbsLMQfUNAQLNLYWVjZBAIW+YDkRjCgSBAj8YES3xoNyTgz9y6JhaJg4GZ2ds6cPTM7a4gInT9jDkaA5ixgJnl/IIhVAMoCTpooXvqCtwTGoBvw1jg4x+CuTlB7bVq8TgHuIp/bkH0jBEFyhhMn2uCfVmafSaaEJDhJTv5tshALVtWKU+SaC00gT9PTZSoWX2hp6Zx2d2tUqzUom32gvj6PVlcvqFyuk+e90NjYETdOciQX+XVJlm9j45orIvr4aNH29i2dntbVF5vLPVImc6/+3t6d4iWXS9BuixQkEhG1y8tVzMycYWfnTv1qtYHx8ROsrFyqH4nYHptJWelVdfEqHg+j2SRsbd0qMBYLqU2lbngfGB7uUf/4+F0t/w1YKgi4t9fB4eEbnp7ktrjPrq8ol3tW3yosFF7V52bqfVfEs8F83g/29zsYHAzh6qoBKaET0yYw56xAJqx9mg26bliTrC8ljo6GwQ1GqVTXmOTytpPmRrYSCZvwpkGryBIMDYUQjUqJdSaR8ZepdNLBJHqbzDYf0P7SmCSRu/A/o+w/DHeKZSV9ad+JENmC8d+BoFRBJ/yvz/kTYO78YEkFRNMAAAAASUVORK5CYII=";

    this.infoImageBase64_p = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACL0lEQVQ4Ea1TTUhUURg998174+TYpEOjDYam9DMzbjSGoGgRWFK0aFEEtRaLqCAXrVq3NCIQDLNFELkoJAphShKKqDCaqBaJQmUhlDQyDpXNz+18d+bhG6gg6Fu8d+93zzn3+7tKaw2vdV442qGLpV6l0MOTFjlTwAfCUspnDafPXH/jxStXIHn5mFPIZQd0CScAbXlBK2tVUhYG7bpQ/1TfUF78RkDI+aXsOLTuXgH/ZaXUhLM6tE9EbIHJzV7y7k3b0Lf9ICZnp5BoasfW9THMLnzEufFBvM/MM0DdbTjAKd/YmukOhj1CHaZatsOde7BrYxJdzTHMLMzBYkES69oRa2rD2OvJMkir5NDTWzdtKRg9VTkLWOzqs9u49OgGamwHD09eoeAWBGw/fhR+8lRbuqh7RbzHoCsfcWyOtJrdted3zX+5kC+Hzl0oEKwgGTK5ltsq19sWbsYqpwaZb1ksfl8ybhFtqY9imTd/yS26UAi3KnQ5STBPsYbaECLBBrPeH9+JgONH+tNbkkhzjRvbDAl5ri9eEZD9wIF+PH73Eke69rLwmvUYdWHmz8DmLJkwrzfOtomdvz+CaGgtju84JLni7J2LeDU/44VSFClbxpPVPC1VVexkrHEDCqUi2/UAo+kUGuvCzDtTHbqR4VT61LAlsy3jKb7WcBS1/oAZGqm82Ofc19+Q2QFyhGuKKLPNOCciwXq8YKHuTT8x5D9+iDUcAv7PY/Le9K/P+Refku1NobDFbQAAAABJRU5ErkJggg==";

    this.infoImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAByklEQVQ4EZVTvWoCQRCeW5JCC386GwNWItGIrdpIQExlpb0QEFIo5glELCWdgnD4ABaihUYEO58gmgfQ2IqNVgdn5lvcY6M2WTh29vuZnb2dNU6nE+kjnU4/2rb9yljWMIwHcKzZ8DQTQpiLxeIbmBqGSlAul++Xy+UHE2/8CSXAzEnJ7/fTdDq1LcvqxGKx9263a4GTCWBerVafnOwZoD6SySS1Wi0JmaZJvV6PuLJ5NBp9QRK5E3a+ZYbL7XY7+Vwul4yhPVdLRiqVwpm/mPlTtnLxuSmXy5HP56PRaETH41FRNnNPd+cfdtMMJfM0mUyUSZ8FvDBmdVTFgUCAms0mjcdjqlarCr6cs0Jdlc7E43Fqt9sUDofl3y8Wi+TxeHSJjOG9WXo+n6dKpSLLh3K329HhcLhKwMBJ8B/dXDKNRoMikQgFg0FJ9ft9J5muZe8PKpjpIGIujUqlkoSx82AwuJSoNbpTmLyyFYI5k8lQKBSS0HA4lFfo9Xp1CWJcoynOvd3R2UKh4CxhrNfrxGIHOwcdeCWK3uay50qBu8fgM0pjrVaj/X6vaNnK8AC4+Zi4fUUikaD1ek3b7dYxcoDM149JV/z3Of8CSFrKn7VA+jwAAAAASUVORK5CYII=";

  },

  /**
   * @function setHighlightPreferences
   *
   * @desc Set module properties that control highlighting according to
   *       user preferences
   *
   * @param {Boolean} show_element_manual_check
   * @param {Boolean} show_page_manual_check
   * @param {Boolean} show_pass
   * @param {Boolean} show_hidden
   */
  setHighlightPreferences: function (show_element_manual_check,
                                     show_page_manual_check,
                                     show_pass,
                                     show_hidden) {

    this.show_element_manual_check = show_element_manual_check;
    this.show_page_manual_check    = show_page_manual_check;
    this.show_pass                 = show_pass;
    this.show_hidden               = show_hidden;
  },

  getRuleScope: function (elementResult) {
    return elementResult.getRuleResult().getRuleScope();
  },

  isElementScopeRule: function (elementResult) {
    return (this.getRuleScope(elementResult) === OpenAjax.a11y.RULE_SCOPE.ELEMENT);
  },

  isPageScopeRule: function (elementResult) {
    return (this.getRuleScope(elementResult) === OpenAjax.a11y.RULE_SCOPE.PAGE);
  },

  /**
   * @function scopePageCount
   *
   * @desc Calculate the number of element results in the list that are from rules
   *       with a scope property set to page.
   *
   * @param {Array} element_results - List of ElementResult objects
   *
   * @return {Number} Number of element results with page scope
   */
  scopePageCount: function(element_results) {
    var count = 0;
    for (var i = 0; i < element_results.length; i++)
      if (this.isPageScopeRule(element_results[i])) count++;
    return count;
  },

  /**
   * @function scopeElementCount
   *
   * @desc Calculate the number of element results in the list that are from rules
   *       with a scope property set to element.
   *
   * @param {Array} element_results - List of ElementResult objects
   *
   * @return {Number} Number of element results with element scope
   *
   */
  scopeElementCount: function (element_results) {
    var count = 0;
    for (var i = 0; i < element_results.length; i++)
      if (this.isElementScopeRule(element_results[i])) count++;
    return count;
  },

  /**
   * @function highlightElementResults
   *
   * @desc Highlights a set of nodes on a page, uses the element result value
   *       for highlighting style
   *
   * @param {Object} document - the DOM to apply highlight operation
   * @param {Array} element_results  - An array of OAA element results to highlight
   *                (i.e. from rule results of filtered rule results)
   */

  highlightElementResults: function (document, element_results) {

    var RESULT_VALUE = OpenAjax.a11y.ELEMENT_RESULT_VALUE;
    var VISIBILITY   = OpenAjax.a11y.VISIBILITY;

    // counters
    var v = 0; // violations
    var w = 0; // warnings
    var m = 0; // manual checks
    var p = 0; // passes
    var h = 0; // hidden


    this.removeHighlight(document);

    if (typeof element_results !== 'object') return;

    // if not an array assume it is a element result object
    if (typeof element_results.length !== 'number') element_results = [element_results];

    var element_results_len = element_results.length;
    var first_visible_node = null;
    var off_screen_elements = [];

    for (var i = 0; i < element_results_len; i++) {

      var element_result = element_results[i];
      var dom_element = element_result.getDOMElement();
      var computed_style = dom_element.computed_style;
      var tag_name = dom_element.tag_name;

      // The node property of DOMElement is a reference to the DOM node in
      // the actual DOM of the current web page.
      var node = dom_element.node;

      if (node) {

        // check if the node is off-screen or hidden from assistive technologies
        if (computed_style.is_visible_onscreen === VISIBILITY.HIDDEN) {

          // always do this...
          off_screen_elements.push(element_result);

          // then increment corresponding counter
          switch (element_result.getResultValue()) {
          case RESULT_VALUE.VIOLATION:
            v += 1;
            break;

          case RESULT_VALUE.WARNING:
            w += 1;
            break;

          case RESULT_VALUE.MANUAL_CHECK:
            if (this.show_page_manual_check) m += 1;
            break;

          case RESULT_VALUE.PASS:
            if (this.show_pass) p += 1;
            break;

          case RESULT_VALUE.HIDDEN:
            if (this.show_hidden) h += 1;
            break;

          default:
            break;
          }
        }
        else {
          // store reference to first visible node
          if (first_visible_node === null) first_visible_node = node;

          switch (element_result.getResultValue()) {
          case RESULT_VALUE.VIOLATION:
            this.insertDIV(document, node, tag_name, this.STYLES.violations, 1, 0, 0, 0, 0);
            break;

          case RESULT_VALUE.WARNING:
            this.insertDIV(document, node, tag_name, this.STYLES.warnings, 0, 1, 0, 0, 0);
            break;

          case RESULT_VALUE.MANUAL_CHECK:
            if (this.isElementScopeRule(element_result) && !this.show_element_manual_check)
              continue;
            if (this.isPageScopeRule(element_result) && !this.show_page_manual_check)
              continue;
            this.insertDIV(document, node, tag_name, this.STYLES.manualChecks, 0, 0, 1, 0, 0);
            break;

          case RESULT_VALUE.PASS:
            if (this.show_pass)
              this.insertDIV(document, node, tag_name, this.STYLES.passes, 0, 0, 0, 1, 0);
            break;

          case RESULT_VALUE.HIDDEN:
            if (this.show_hidden)
              this.insertDIV(document, node, tag_name, this.STYLES.hidden, 0, 0, 0, 0, 1);
            break;

          default:
            break;
          }
        }
      }
    } //end for

    // scroll the first node in the list into view
    if (first_visible_node) {
      // scroll into view aligned with top of viewport
      first_visible_node.scrollIntoView(true);

      // add an offset between top of viewport and div border
      if (window.content.scrollY) {
        var offset = window.content.scrollY - 10;
        window.content.scroll(0, offset);
      }
    }

    if (off_screen_elements.length > 0)
      this.showOffScreenElementResults(document, off_screen_elements, v, w, m, p, h);
  },

  /**
   * @function pluralForm
   *
   * @desc
   *
   * @param {value}  value  -
   * @param {String}  stringId  -
   */
  pluralForm: function (value, stringId) {


  }

  /**
   * @function removeHighlight
   *
   * @desc Unhighlights the nodes that were highlighted earlier and
   *       removes the informational message added to a page if the
   *       element is hidden from assistive technologies.
   *
   * @param {Object}  document  - the DOM to which highlight operation is applied
   */
  removeHighlight: function (document) {
    var highlightClass = this.highlightDivClass;

    function removeFromDocument(document) {
      var elements = document.getElementsByClassName(highlightClass);

      while (elements[0]) {
        var element = elements[0];

        if (element) {
          var parent_node = element.parentNode;

          while(element.firstChild) {
            parent_node.insertBefore(element.firstChild, element);
          }

          parent_node.removeChild(element);
        }
      }

      // remove highlighting inside iframes
      var iframes = document.getElementsByTagName( "iframe" );

      for (var i = 0; i < iframes.length; i++) {
        var doc = iframes[i].contentDocument;
        if (doc) removeFromDocument(doc);
      }

    }

    function removeFromFrames(frames) {

      if (typeof frames !== 'object' || typeof frames.length !== 'number') return;

      for (var i=0; i < frames.length; i++) {
        var frame = frames[i];
        if (frame.document) removeFromDocument(frame.document);
        removeFromFrames(frame.frames);
      }
    }

    removeFromDocument(document);  //unhighlighting in the actual document

    var frames = window.frames;
    removeFromFrames(frames);

    var off_screen_elements = document.getElementsByClassName(this.offScreenDivClass);

    for (var j = 0; j < off_screen_elements.length; j++) {
      if (off_screen_elements[j])
        document.body.removeChild(off_screen_elements[j]);
    }

  },

  /**
   * @function showOffScreenElementResults
   *
   * @desc Display information about a list of element results of a rule
   *       Designed to provide information about element results that are not
   *       visible on screen
   *
   * @param {Object} document - the DOM to remove highlighting from
   * @param {Array} element_results - List of ElementResult objects that are off screen
   * @param {Number} v - number of violations in the list of element results
   * @param {Number} w - number of warnings in the list of element results
   * @param {Number} m - number of manual checks in the list of element results
   * @param {Number} p - number of passes in the list of element results
   * @param {Number} h - number of hidden in the list of element results
   */
  showOffScreenElementResults: function (document, element_results, v, w, m, p, h) {

    var element_results_plural =
      this.pluralForm.get(element_results.length, this.STRINGS.offScreen);
    var str = element_results.length + ' ' + element_results_plural;
    var style = this.STYLES.offScreen + ' ';

    if (v > 0) style += this.STYLES.violations;
    else if (w > 0) style += this.STYLES.warnings;
    else if (m > 0) style += this.STYLES.manualChecks;
    else if (p > 0) style += this.STYLES.passes;
    else if (h > 0) style += this.STYLES.hidden;

    if (v > 0) str +=  ': ' + v + ' ' + this.pluralForm.get(v, this.STRINGS.violations);
    if (w > 0) str +=  ': ' + w + ' ' + this.pluralForm.get(w, this.STRINGS.warnings);
    if (m > 0) str +=  ': ' + m + ' ' + this.pluralForm.get(m, this.STRINGS.manualChecks);
    if (p > 0) str +=  ': ' + p + ' ' + this.pluralForm.get(p, this.STRINGS.passes);
    if (h > 0) str +=  ': ' + h + ' ' + this.pluralForm.get(h, this.STRINGS.hidden);

    this.positionDIV(document, style, str);
  },

  /**
   * @function positionDIV
   *
   * @desc Create a div element to position at top left of the web page to
   *       display a message re. off-screen elements and their severities,
   *       outlined with the worst result value styling.
   *
   * @param {Object} document - the DOM in which to position DIV
   * @param {String} style - the DIV CSS style
   * @param {String} result_value_message - message to show inside the DIV
   */
  positionDIV : function (document, style, result_value_message) {

    var div_element = document.createElement('div');
    div_element.id = this.offScreenDivId;

    div_element.setAttribute("class", this.offScreenDivClass);
    div_element.setAttribute("style", style);

    var text_node = document.createTextNode(result_value_message);
    div_element.appendChild(text_node);

    document.body.insertBefore(div_element, document.body.childNodes[0]);

    // scroll into view aligned with top of viewport
    div_element.scrollIntoView(true);

  },

  /**
   * @function insertDIV
   *
   * @desc Create a DIV element styled as specified, insert the DIV just
   *       before the node and then move the node inside the DIV.
   *
   * @param {Object} document - the DOM that contains the node to highlight
   * @param {Object} node - the node to highlight
   * @param {Object} tagName - tag name of the node
   * @param {String} style - CSS styling properties for DIV
   * @param {Number} v - violations
   * @param {Number} w - warnings
   * @param {Number} m - manual checks
   * @param {Number} p - passed
   * @param {Number} h - hidden
   */
  insertDIV: function (document, node, tagName, style, v, w, m, p, h) {

    var parentNode = null;
    var title = this.getResultValueMessage(v, w, m, p, h);
    var divStyle = this.STYLES.visibleDiv + ' ';

    // Create the div element
    var divElement = document.createElement('div');
    divElement.setAttribute("class", this.highlightDivClass);
    divElement.setAttribute("style", divStyle + style);
    divElement.setAttribute("title", title);

    // Get the corresponding info icon
    var imageData = this.infoImageBase64;
    if (v > 0) imageData = this.infoImageBase64_v;
    else if (w > 0) imageData = this.infoImageBase64_w;
    else if (m > 0) imageData = this.infoImageBase64_m;
    else if (p > 0) imageData = this.infoImageBase64_p;

    // Create the info image
    var iconImage = document.createElement('img');
    iconImage.setAttribute("src", "data:image/png;base64," + imageData);
    iconImage.setAttribute("class", this.highlightDivClass);
    iconImage.setAttribute("style", this.STYLES.iconImage);

    // Determine method of inserting div based on tagName
    var index = this.elementsWithoutContent.indexOf(tagName);

    if (index != -1) { // node is a member of elementsWithoutContent...
      // In this method, the div becomes a container for the node itself;
      // insert the div just before the node and then move the node
      // into the div.
      parentNode = node.parentNode;
      parentNode.insertBefore(divElement, node);
      divElement.appendChild(node);
    }
    else { // node may have content...
      // In this method, the div becomes the container for all child elements
      // of the node; move all of the node's children into the div and then
      // insert the div as a child of the node.
      while (node.firstChild) {
        divElement.appendChild(node.firstChild);
      }
      node.appendChild(divElement);
    }
    divElement.appendChild(iconImage);

  },

  /**
   * @function getWorstResultValueStyle
   *
   * @desc Return a CSS formatted string to be used for highlighting a DOM node.
   *       Result is based on the worst element result value associated with the node.
   *
   * @param {Object} dom_element - OAA DOM element object
   *
   * @return {String} Returns a CSS string that can be used with a style property of a DOM node
   */
  getWorstResultValueStyle: function (dom_element) {

    if (dom_element.rules_violations.length > 0)
      return this.STYLES.violations;
    else if (dom_element.rules_warnings.length  > 0 )
      return this.STYLES.warnings;
    else if (this.show_page_manual_check  && (this.scopePageCount(dom_element.rules_manual_checks) > 0))
      return this.STYLES.manualChecks;
    else if (this.show_element_manual_check && (this.scopeElementCount(dom_element.rules_manual_checks) > 0))
      return this.STYLES.manualChecks;
    else if (this.show_pass &&  (dom_element.rules_passed.length  > 0))
      return this.STYLES.passes;
    else if (this.show_hidden &&  (dom_element.rules_hidden.length  > 0))
      return this.STYLES.hidden;
    else
      return this.STYLES.noResults;
  },

  /**
   * @function getResultValueMessage
   *
   * @desc Create value for title attribute of div element to provide summary
   *       of number of violations, warnings, manual checks and passes
   *
   * @param {Number} v_count - Number of violations
   * @param {Number} w_count - Number of warnings
   * @param {Number} m_count - Number of manual checks
   * @param {Number} p_count - Number of pass
   * @param {Number} h_count - Number of hidden
   *
   * @return {String} title
   */
  getResultValueMessage: function (v_count, w_count, m_count, p_count, h_count) {

    var title = '';

    if (v_count > 0)
      title += v_count + ' ' + this.pluralForm.get(v_count, this.STRINGS.violations) + ' ';
    if (m_count > 0)
      title += m_count + ' ' + this.pluralForm.get(m_count, this.STRINGS.manualChecks) + ' ';
    if (w_count > 0)
      title += w_count + ' ' + this.pluralForm.get(w_count, this.STRINGS.warnings) + ' ';
    if (p_count > 0)
      title += p_count + ' ' + this.pluralForm.get(p_count, this.STRINGS.passes) + ' ';
    if (h_count > 0)
      title += h_count + ' ' + this.pluralForm.get(h_count, this.STRINGS.hidden) + ' ';

    if (title.length === 0)
      title = this.STRINGS.noResults;

    return title;
  }

};


