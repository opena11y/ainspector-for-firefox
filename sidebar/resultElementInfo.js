/* resultElementInfojs */

const getMessage = browser.i18n.getMessage;

const template = document.createElement('template');
template.innerHTML = `
    <div class="result-element-info">
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
          <h3 id="accname-info-label">Accessible Name</h3>
          <div id="accname"></div>
          <div class="source"><span>Source:</span> <span id="accname-source"><span></div>
        </div>

        <div id="accdesc-info">
          <h3 id="accdesc-info-label">Accessible Description</h3>
          <div id="accdesc"></div>
          <div class="source"><span>Source:</span> <span id="accdesc-source"><span></div>
        </div>

        <div id="errordesc-info">
          <h3 id="errordesc-info-label">Error Description</h3>
          <div id="errordesc"></div>
          <div class="source"><span>Source:</span> <span id="errordesc-source"><span></div>
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
    </div>
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
    this.setHeading('#action-label',     'ruleActionLabel');

    // Create content references
    this.resultElemInfoDiv = this.shadowRoot.querySelector('.result-element-info');

    this.messagesDiv = this.shadowRoot.querySelector('#messages');
    this.message1Div = this.shadowRoot.querySelector('#message1');
    this.message2Div = this.shadowRoot.querySelector('#message2');

    this.infoDiv = this.shadowRoot.querySelector('#info');
    this.actionDiv   = this.shadowRoot.querySelector('#action');
    this.tagNameDiv  = this.shadowRoot.querySelector('#tagname');

    this.accNameInfoDiv    = this.shadowRoot.querySelector('#accname-info');
    this.accNameDiv        = this.shadowRoot.querySelector('#accname');
    this.accNameSourceSpan = this.shadowRoot.querySelector('#accname-source');

    this.accDescInfoDiv    = this.shadowRoot.querySelector('#accdesc-info');
    this.accDescDiv        = this.shadowRoot.querySelector('#accdesc');
    this.accDescSourceSpan = this.shadowRoot.querySelector('#accdesc-source');

    this.errorDescInfoDiv    = this.shadowRoot.querySelector('#errordesc-info');
    this.errorDescDiv        = this.shadowRoot.querySelector('errordesc');
    this.errorDescSourceSpan = this.shadowRoot.querySelector('#errordesc-source');

    this.ccrInfoDiv    = this.shadowRoot.querySelector('#ccr-info');
    this.ccrInfoTbody  = this.shadowRoot.querySelector('#ccr-content');

    this.visInfoDiv    = this.shadowRoot.querySelector('#visibility-info');
    this.visInfoTbody  = this.shadowRoot.querySelector('#visibility-content');

    this.attrsInfoTable = this.shadowRoot.querySelector('#attrs-info');
    this.attrsTbody     = this.shadowRoot.querySelector('#attrs-content');
  }

  resize (size) {
    this.resultElemInfoDiv.style.height = size + 'px';
  }

  setHeading (headingId, messageId) {
    let h = this.shadowRoot.querySelector(headingId);
    let m = getMessage(messageId)
    if (h && m) {
      h.textContent = m;
    }
  }

  // Renders string or object containing attribute name and values
  isSpecialProperty (prop) {
    let flag = false;

    switch (prop) {
      case 'color':
      case 'background_color':
      case 'font_weight':
        flag = true;
        console.log('[SPECIAL_PROP]');
        break;

      default:
        break;
    }

    return flag;
  }

  getSpecialProperyContent (prop, value) {
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
        td.appendChild(span);
        td.appendChild(text);
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
          tr.appendChild(th);
          td = document.createElement('td');
          if (this.isSpecialProperty(property)) {
            td = this.getSpecialProperyContent(property, info[property]);
          } else {
            td.textContent = info[property];
          }
          tr.appendChild(td);
          hasContent = true;
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
    let accNameInfo = elementInfo.accNameInfo;

    // Accessible name information
    if (accNameInfo.name) {
      this.accNameInfoDiv.classList.remove('hide');
      this.accNameDiv.textContent = accNameInfo.name;
      this.accNameSourceSpan.textContent = accNameInfo.name_source;
    } else {
      this.accNameInfoDiv.classList.add('hide');
    }

    if (accNameInfo.desc) {
      this.accDescInfoDiv.classList.remove('hide');
      this.accDescDiv.textContent = accNameInfo.desc;
      this.accDescSourceSpan.textContent = accNameInfo.desc_source;
    } else {
      this.accDescInfoDiv.classList.add('hide');
    }

    if (accNameInfo.error_desc) {
      this.errorDescInfoDiv.classList.remove('hide');
      this.errorDescDiv.textContent = accNameInfo.error_desc;
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
  }

  clear (message1, message2) {
    this.messagesDiv.classList.remove('hide');
    this.infoDiv.classList.add('hide');
    this.message1Div.textContent = '';
    this.message2Div.textContent = '';

    if (typeof message1 === 'string') {
      this.message1Div.textContent = message1;
    }
    if (typeof message2 === 'string') {
      this.message2Div.textContent = message2;
    }
  }
}
