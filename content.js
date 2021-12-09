/*
*   content.js
*/
var headingRefs;
var currentHeading;

var highlightClass = 'structureExtensionHighlight';
var highlightProperties = `{
  position: absolute;
  overflow: hidden;
  box-sizing: border-box;
  border: 3px solid cyan;
  pointer-events: none;
  z-index: 10000;
}`;

var focusClass = 'structureExtensionFocus';
var focusProperties = `{
  outline: 3px dotted purple;
}`;

/*
*   Add highlighting stylesheet to document.
*/
(function () {
  let sheet = document.createElement('style');
  sheet.innerHTML = `.${highlightClass} ${highlightProperties} .${focusClass}:focus ${focusProperties}`;
  document.body.appendChild(sheet);
})();

/*
*   Send 'info' message with evaluation information to sidebar script.
*/

(function () {

  let view      = infoAInspectorEvaluation.view;
  let groupType = infoAInspectorEvaluation.groupType;
  let groupId   = infoAInspectorEvaluation.groupId;
  let ruleId    = infoAInspectorEvaluation.ruleId;
  let rulesetId = infoAInspectorEvaluation.rulesetId;

  console.log('[content.js][     view]: ' + view);
  console.log('[content.js][groupType]: ' + groupType);
  console.log('[content.js][  groupId]: ' + groupId + ' (' + typeof groupId + ')');
  console.log('[content.js][   ruleId]: ' + ruleId);
  console.log('[content.js][rulesetId]: ' + rulesetId);

  let info = {};
  info.id       = 'info';
  info.title    = document.title;
  info.location = document.location.href
  info.ruleset  = rulesetId;

  switch(view) {
    case 'summary':
      info.infoSummary = getSummaryInfo();
      break;

    case 'rule-group':
      info.infoRuleGroup = getRuleGroupInfo(groupType, groupId);
      break;

    case 'rule-result':
      info.view = 'rule';
      info.infoRuleResult = getRuleResultInfo(ruleId);
      break;

    default:
    break;
  }

  browser.runtime.sendMessage(info);

})();


/*
*   Respond to 'find' and 'clear' messages by highlighting and scrolling to
*   the element specified or removing the highlighting
*/
browser.runtime.onMessage.addListener (
  function (message, sender) {
    switch (message.id) {
      case 'find':
        let element = headingRefs[message.index];
        if (isInPage(element)) {
          addHighlightBox(element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          currentHeading = element;
          document.addEventListener('focus', focusListener);
          document.addEventListener('blur', blurListener);
        }
        else {
          console.log('Element was removed from DOM: ' + element)
        }
        break;

      case 'clear':
        removeOverlays();
        document.removeEventListener('focus', focusListener);
        document.removeEventListener('blur', blurListener);
        break;

      case 'eval':
        console.log('[eval]');
        break;

    }
});

function focusListener (event) {
  setFocus(currentHeading);
}

function blurListener (event) {
  addHighlightBox(currentHeading);
}

/*
*   setFocus: Used by 'focus' event handler for the document after selected
*   heading has been highlighted and page has been scrolled to bring it into
*   view. When the user changes focus from the sidebar to the page, add CSS
*   class for focus styling and set focus to specified heading element.
*/
function setFocus (element) {
  removeOverlays();
  element.classList.add(focusClass);
  element.setAttribute('tabindex', -1);
  element.focus({
    preventScroll: false
  });
}

/*
*   addHighlightBox: Clear previous highlighting and add highlight border box
*   to specified element.
*/
function addHighlightBox (element) {
  let boundingRect = element.getBoundingClientRect();
  removeOverlays();

  let overlayNode = createOverlay(boundingRect);
  document.body.appendChild(overlayNode);
}

/*
*   createOverlay: Use bounding client rectangle and offsets to create an element
*   that appears as a highlighted border around element corresponding to 'rect'.
*/
function createOverlay (rect) {
  const MIN_WIDTH = 68;
  const MIN_HEIGHT = 27;
  const OFFSET = 5;

  let node = document.createElement('div');
  node.setAttribute('class', highlightClass);

  node.style.left   = Math.round(rect.left - OFFSET + window.scrollX) + 'px';
  node.style.top    = Math.round(rect.top  - OFFSET + window.scrollY) + 'px';

  node.style.width  = Math.max(rect.width  + OFFSET * 2, MIN_WIDTH)  + 'px';
  node.style.height = Math.max(rect.height + OFFSET * 2, MIN_HEIGHT) + 'px';

  return node;
}

/*
*   removeOverlays: Utilize 'highlightClass' to remove highlight overlays created
*   by previous calls to 'addHighlightBox'.
*/
function removeOverlays () {
  let selector = 'div.' + highlightClass;
  let elements = document.querySelectorAll(selector);
  Array.prototype.forEach.call(elements, function (element) {
    document.body.removeChild(element);
  });
}

/*
*   isInPage: This function checks to see if an element is a descendant of
*   the page's body element. Because 'contains' is inclusive, isInPage returns
*   false when the argument is the body element itself.
*   MDN: https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
*/
function isInPage (element) {
  if (element === document.body) return false;
  return document.body.contains(element);
}
