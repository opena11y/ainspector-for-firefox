/* resultElementInfojs */

// Get message strings from locale-specific messages.json file
const getMessage = browser.i18n.getMessage;
const msg = {};
msg.elementSelectedLabel         = getMessage('elementSelectedLabel');
msg.elementResultAction          = getMessage('elementResultAction');
msg.elementResultTagName         = getMessage('elementResultTagName');
msg.elementResultAccName         = getMessage('elementResultAccName');
msg.elementResultAccDesc         = getMessage('elementResultAccDesc');
msg.elementResultErrorDesc       = getMessage('elementResultErrorDesc');
msg.elementResultCCR             = getMessage('elementResultCCR');
msg.elementResultVisibility      = getMessage('elementResultVisibility');
msg.elementResultAttributeHeader = getMessage('elementResultAttributeHeader');
msg.elementResultValueHeader     = getMessage('elementResultValueHeader');
msg.ruleActionLabel              = getMessage('ruleActionLabel');
msg.elementResultAccNameRequired = getMessage('elementResultAccNameRequired');
msg.elementResultAccNameProhibited = getMessage('elementResultAccNameProhibited');

const template = document.createElement('template');
template.innerHTML = `
    <section class="result-element-info" aria-label="Selected Element">
      <div id="messages">
        <div id="message1" class="message"></div>
        <div id="message2" class="message"></div>
      </div>
      <div id="info" class="hide">
        <h3  id="action-label" class="first">Action</h3>
        <div id="action"></div>

        <h3  id="tagname-label">Tag Name</h3>
        <div id="tagname"></div>

        <div id="accname-info">
          <h3><span id="accname-info-label">Accessible Name</span> <span id="accname-info-label-more"></span></h3>
          <div class="source"><span>Text:</span> <span id="accname"></span></div>
          <div class="source"><span>Source:</span> <span id="accname-source"></span></div>
        </div>

        <div id="accdesc-info">
          <h3 id="accdesc-info-label">Accessible Description</h3>
          <div class="source"><span>Text:</span> <span id="accdesc"></span></div>
          <div class="source"><span>Source:</span> <span id="accdesc-source"></span></div>
        </div>

        <div id="errordesc-info">
          <h3 id="errordesc-info-label">Error Description</h3>
          <div class="source"><span>Text:</span> <span id="errordesc"></span></div>
          <div class="source"><span>Source:</span> <span id="errordesc-source"></span></div>
        </div>

        <div id="ccr-info">
          <h3 id="ccr-info-label">Color Contrast</h3>
          <table  aria-labelledby="ccr-info-label" class="ccr-info">
            <tbody id="ccr-content">
            </tbody>
          </table>
        </div>

        <div id="visibility-info">
          <h3 id="visibility-info-label">Visibility</h3>
          <table  aria-labelledby="visibility-info-label" class="visibility-info">
            <tbody id="visibility-content">
            </tbody>
          </table>
        </div>

        <table id="attrs-info" aria-label="Attribute Information" class="attrs-info">
          <thead>
            <tr>
              <th id="attrs-info-name">Attribute</th>
              <th id="attrs-info-value">Value</th>
            </tr>
          </thead>
          <tbody id="attrs-content">
          </tbody>
        </table>
      </div>
    </section>
`;

export default class ResultElementInfo extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });

    // Use external CSS stylesheet
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'resultElementInfo.css');
    this.shadowRoot.appendChild(link);

    // Add DOM tree from template
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Initialize headings
    this.setHeading('#action-label', msg.ruleActionLabel);

    // Create content references
    this.resultElemInfoSect = this.shadowRoot.querySelector('.result-element-info');

    this.messagesDiv = this.shadowRoot.querySelector('#messages');
    this.message1Div = this.shadowRoot.querySelector('#message1');
    this.message2Div = this.shadowRoot.querySelector('#message2');

    this.infoDiv = this.shadowRoot.querySelector('#info');
    this.actionDiv   = this.shadowRoot.querySelector('#action');
    this.tagNameDiv  = this.shadowRoot.querySelector('#tagname');

    this.accNameInfoLabelMoreSpan = this.shadowRoot.querySelector('#accname-info-label-more');
    this.accNameInfoDiv    = this.shadowRoot.querySelector('#accname-info');
    this.accNameSpan       = this.shadowRoot.querySelector('#accname');
    this.accNameSourceSpan = this.shadowRoot.querySelector('#accname-source');

    this.accDescInfoDiv    = this.shadowRoot.querySelector('#accdesc-info');
    this.accDescSpan       = this.shadowRoot.querySelector('#accdesc');
    this.accDescSourceSpan = this.shadowRoot.querySelector('#accdesc-source');

    this.errorDescInfoDiv    = this.shadowRoot.querySelector('#errordesc-info');
    this.errorDescSpan       = this.shadowRoot.querySelector('errordesc');
    this.errorDescSourceSpan = this.shadowRoot.querySelector('#errordesc-source');

    this.ccrInfoDiv    = this.shadowRoot.querySelector('#ccr-info');
    this.ccrInfoTbody  = this.shadowRoot.querySelector('#ccr-content');

    this.visInfoDiv    = this.shadowRoot.querySelector('#visibility-info');
    this.visInfoTbody  = this.shadowRoot.querySelector('#visibility-content');

    this.attrsInfoTable = this.shadowRoot.querySelector('#attrs-info');
    this.attrsTbody     = this.shadowRoot.querySelector('#attrs-content');

    this.copyText = '';

    this.initLabels();

    // Update accessible name for the region

    this.resultElemInfoSect.setAttribute('aria-label', msg.elementSelectedLabel);

  }

  initLabels () {
    const actionLabel = this.shadowRoot.querySelector('#action-label');
    actionLabel.textContent = msg.elementResultAction;

    const tagNameLabel = this.shadowRoot.querySelector('#tagname-label');
    tagNameLabel.textContent = msg.elementResultTagName;

    const accNameLabel = this.shadowRoot.querySelector('#accname-info-label');
    accNameLabel.textContent = msg.elementResultAccName;

    const accDescLabel = this.shadowRoot.querySelector('#accdesc-info-label');
    accDescLabel.textContent = msg.elementResultAccDesc;

    const errorDescLabel = this.shadowRoot.querySelector('#errordesc-info-label');
    errorDescLabel.textContent = msg.elementResultErrorDesc;

    const ccrInfoLabel = this.shadowRoot.querySelector('#ccr-info-label');
    ccrInfoLabel.textContent = msg.elementResultCCR;

    const visibilityInfoLabel = this.shadowRoot.querySelector('#visibility-info-label');
    visibilityInfoLabel.textContent = msg.elementResultVisibility;

    const attrInfoLabel = this.shadowRoot.querySelector('#attrs-info-name');
    attrInfoLabel.textContent = msg.elementResultAttributeHeader;

    const valueInfoLabel = this.shadowRoot.querySelector('#attrs-info-value');
    valueInfoLabel.textContent = msg.elementResultValueHeader;

  }

  resize (size) {
    this.resultElemInfoSect.style.height = size + 'px';
  }

  focus () {
    this.resultElemInfoSect.focus();
  }

  setHeading (headingId, message) {
    let h = this.shadowRoot.querySelector(headingId);
    if (h && message) {
      h.textContent = message;
    }
  }

  // Renders string or object containing attribute name and values
  isSpecialProperty (prop) {
    let flag = false;

    switch (prop) {
      case 'color':
      case 'background_color':
      case 'color_hex':
      case 'background_color_hex':
      case 'font_weight':
        flag = true;
        break;

      default:
        break;
    }

    return flag;
  }

  getSpecialProperyContent (info, prop) {
    let value = info[prop];
    let td = document.createElement('td');
    let span = document.createElement('span');
    let text = document.createTextNode(value);

    switch (prop) {
      case 'color':
      case 'background_color':
        span.textContent   = '■';
        span.style.display = 'inline-block';
        span.style.color   = value;
        span.style.backgroundColor   = value;
        span.style.border  = '1px solid black';
        span.style.paddingLeft = '2px';
        span.style.paddingRight = '2px';
        span.style.marginRight = '4px';
        span.setAttribute('aria-hidden', true);
        td.title = info[prop + '_hex'];
        td.appendChild(span);
        td.appendChild(text);
        break;

      case 'color_hex':
      case 'background_color_hex':
        td.textContent = value;
        td = false;
        break;

      case 'font_weight':
        td.textContent = value;
        if (value === 400) {
          td.textContent = value + ' (normal)';
        }
        if (value === 700) {
          td.textContent = value + ' (bold)';
        }
        break;

      default:
        break;
    }

    return td;
  }

  renderContent(elem, info) {
    let tr, th, td, a, item, hasContent = false;
    if (typeof info === 'string') {
      elem.textContent = info;
      if (info.length) {
        hasContent = true;
      }
    } else {
      if (typeof info === 'object') {
        for (const property in info) {
          tr = document.createElement('tr');
          elem.appendChild(tr);
          th = document.createElement('th');
          item = property.replaceAll('_', ' ');
          th.textContent = item;
          if (this.isSpecialProperty(property)) {
            td = this.getSpecialProperyContent(info, property);
          } else {
            td = document.createElement('td');
            td.textContent = info[property];
          }
          if (td) {
            tr.appendChild(th);
            tr.appendChild(td);
            hasContent = true;
          }
        }
      }
    }
    return hasContent;
  }

  clearContent(elem) {
    while (elem.firstChild) {
       elem.removeChild(elem.firstChild);
    }
  }

  updateActionAndTagName(elementInfo) {
    let tagName = elementInfo.tagName;
    if (elementInfo.role) {
      tagName += '[role=' + elementInfo.role + ']';
    }
    this.renderContent(this.actionDiv, elementInfo.actionMessage);
    this.renderContent(this.tagNameDiv, tagName);
  }

  updateAccessibleNameInfo(elementInfo) {
    const accNameInfo = elementInfo.accNameInfo;

    this.accNameInfoLabelMoreSpan.textContent = '';
    if (accNameInfo.name_required) {
      this.accNameInfoLabelMoreSpan.textContent = msg.elementResultAccNameRequired;
    } else {
      if (accNameInfo.name_prohibited) {
        this.accNameInfoLabelMoreSpan.textContent = msg.elementResultAccNameProhibited;
      }
    }

    // Accessible name information
    if (accNameInfo.name) {
      this.accNameInfoDiv.classList.remove('hide');
      this.accNameSpan.textContent = accNameInfo.name;
      this.accNameSourceSpan.textContent = accNameInfo.name_source;
    } else {
      if (accNameInfo.name_required && accNameInfo.name_possible) {
        this.accNameInfoDiv.classList.remove('hide');
        this.accNameSpan.textContent = 'none';
        this.accNameSourceSpan.textContent = 'none';
      } else {
        this.accNameInfoDiv.classList.add('hide');
      }
    }

    if (accNameInfo.desc) {
      this.accDescInfoDiv.classList.remove('hide');
      this.accDescSpan.textContent = accNameInfo.desc;
      this.accDescSourceSpan.textContent = accNameInfo.desc_source;
    } else {
      this.accDescInfoDiv.classList.add('hide');
    }

    if (accNameInfo.error_desc) {
      this.errorDescInfoDiv.classList.remove('hide');
      this.errorDescSpan.textContent = accNameInfo.error_desc;
      this.errorDescSourceSpan.textContent = accNameInfo.error_desc_source;
    } else {
      this.errorDescInfoDiv.classList.add('hide');
    }

  }

  updateCCRInfo(elementInfo) {
    let hasInfo = false;

    this.clearContent(this.ccrInfoTbody);
    let ccrInfo = elementInfo.ccrInfo;
    hasInfo = this.renderContent(this.ccrInfoTbody, ccrInfo);

    if (hasInfo) {
      this.ccrInfoDiv.classList.remove('hide');
    } else {
      this.ccrInfoDiv.classList.add('hide');
    }
  }

  updateVisibilityInfo(elementInfo) {let hasInfo = false;

    this.clearContent(this.visInfoTbody);
    let visInfo = elementInfo.visibilityInfo;
    hasInfo = this.renderContent(this.visInfoTbody, visInfo);

    if (hasInfo) {
      this.visInfoDiv.classList.remove('hide');
    } else {
      this.visInfoDiv.classList.add('hide');
    }
  }

  updateAttributeInformation(elementInfo) {
    this.clearContent(this.attrsTbody);
    let htmlAttrInfo = elementInfo.htmlAttrInfo;
    let hasAttrs1 = this.renderContent(this.attrsTbody, htmlAttrInfo);
    let ariaAttrInfo = elementInfo.ariaAttrInfo;
    let hasAttrs2 = this.renderContent(this.attrsTbody, ariaAttrInfo);

    if (hasAttrs1 || hasAttrs2) {
      this.attrsInfoTable.classList.remove('hide');
    } else {
      this.attrsInfoTable.classList.add('hide');
    }
  }

  update(elementInfo) {
    this.messagesDiv.classList.add('hide');
    this.infoDiv.classList.remove('hide');

    // Action and tag name Information
    this.updateActionAndTagName(elementInfo);

    // Accessible name and description information
    this.updateAccessibleNameInfo(elementInfo);

    // Color contrast information
    this.updateCCRInfo(elementInfo);

    // Visibility information
    this.updateVisibilityInfo(elementInfo);

    // Attribute information
    this.updateAttributeInformation(elementInfo);

    this.updateCopyText(elementInfo);
  }

  clear (message1, message2) {
    this.messagesDiv.classList.remove('hide');
    this.infoDiv.classList.add('hide');
    this.message1Div.textContent = '';
    this.message2Div.textContent = '';
    this.copyText = '';

    if (typeof message1 === 'string') {
      this.message1Div.textContent = message1;
    }
    if (typeof message2 === 'string') {
      this.message2Div.textContent = message2;
    }
  }

  updateCopyText (elementInfo) {
    this.copyText = '';

    this.copyText += msg.elementResultAction + '\n';
    this.copyText += elementInfo.actionMessage + '\n\n';

    this.copyText += msg.elementResultTagName + '\n';
    if (elementInfo.role) {
      this.copyText += elementInfo.tagName + '[role=' + elementInfo.role+ ']\n\n';
    } else {
      this.copyText += elementInfo.tagName + '\n\n';
    }

    const visText = this.appendToCopyText(elementInfo.visibilityInfo);
    if (visText) {
      this.copyText += msg.elementResultVisibility + '\n';
      this.copyText += visText + '\n\n';;
    }

    const accNameInfo = elementInfo.accNameInfo;
    if (accNameInfo.name) {
      this.copyText += msg.elementResultAccName + '\n';
      this.copyText += 'text: ' + accNameInfo.name + '\n';
      this.copyText += 'source: ' + accNameInfo.name_source + '\n\n';
    } else {
      if (accNameInfo.name_required && accNameInfo.name_possible) {
        this.copyText += msg.elementResultAccName + '\n';
      this.copyText += 'text: none' + '\n';
      this.copyText += 'source: none' + '\n\n';
      }
    }

    if (accNameInfo.desc) {
      this.copyText += msg.elementResultAccDesc + '\n';
      this.copyText += 'text: ' + accNameInfo.desc + '\n';
      this.copyText += 'source: ' + accNameInfo.desc_source + '\n\n';
    }

    if (accNameInfo.error_desc) {
      this.copyText += msg.elementResultErrorDesc + '\n';
      this.copyText += 'text: ' + accNameInfo.error_desc + '\n';
      this.copyText += 'source: ' + accNameInfo.error_desc_source + '\n\n';
    }

    const ccrText = this.appendToCopyText(elementInfo.ccrInfo);
    if (ccrText) {
      this.copyText += msg.elementResultCCR + '\n';
      this.copyText += ccrText + '\n\n';
    }

    const htmlAttrText = this.appendToCopyText(elementInfo.htmlAttrInfo);
    const ariaAttrText = this.appendToCopyText(elementInfo.ariaAttrInfo);
    if (htmlAttrText || ariaAttrText) {
      this.copyText += msg.elementResultAttributeHeader + '\n';
      this.copyText += htmlAttrText;
      this.copyText += ariaAttrText;
    }

  }

  // if the info is a string just use textContent
  // if the info is an array, create a list of items
  // Some items maybe an object containing a 'url' and 'title' properties
  appendToCopyText(info) {
    let content = '', item;
    if (!info) return '';

    if (typeof info === 'string') {
      content += info + '\n';;
    } else {
      if (typeof info === 'object') {
        for (const property in info) {
          item = property.replaceAll('_', ' ');
          content += item + ': ' + info[property] + '\n';
        }
      }
    }
    return content;
  }

  getText () {
    return this.copyText;
  }
}
