/* utils.js */

export {
  addContentToElement,
  getResultStyle,
  removeTags
}

function  getResultStyle (result) {
  let style = 'not-applicable';

  switch (result){
    case 'MC':
      style = 'manual-check';
      break;
    case 'P':
      style = 'passed';
      break;
    case 'V':
      style = 'violation';
      break;
    case 'W':
      style = 'warning';
      break;
    case 'H':
      style = 'hidden';
      break;
    default:
      break;
  }
  return style;
}

/**
 * @function addContentToElement
 *
 * @desc Parses a text string for the code element and adds the content
 *       to an element node
 *
 * @param {Object}  elem     elem    - Node of element to add content
 * @param {String or number} content - Content to add to node
 * @param {Boolen} clear     clear   - Flag to remove any content from the node before adding
 */

function addContentToElement (elem, content, clear=false) {

  if (clear) {
    while(elem.hasChildNodes()) {
      elem.removeChild(elem.firstChild);
    }
  }

  let n;

  if (typeof content !== 'string') {
    content = content.toString();
  }

  const startTag = '<code>';
  const endTag = '</code>';

  let i = content.indexOf(startTag);
  let j = 0;


  while (i >= 0) {
    n = document.createTextNode(content.substring(j,i));
    elem.appendChild(n);

    j = content.indexOf(endTag, i);

    n = document.createElement(startTag.substring(1, startTag.length-1));
    addContentToElement(n, content.substring((i+startTag.length),j));
    elem.appendChild(n);
    j += endTag.length;

    i = content.indexOf(startTag, j);
  }

  if (j < content.length) {
    n = document.createTextNode(content.substring(j));
    elem.appendChild(n);
  }

}

/*
 * @function removeTags
 *
 * @desc Remove code tags from a string
 *
 * @param {String or number} content - Content to rmeove tags
 *
 * @return {String} see @desc
 */

function removeTags (content) {
  const startTag = '<code>';
  const endTag = '</code>';

  let c = '';
  let i = content.indexOf(startTag);
  let j = content.indexOf(endTag);;

  while ((i >= 0) && (j >= 0)) {
    c += content.substring((i+startTag.length),j);
    j += endTag.length;
    i = content.indexOf(j, startTag);
    if (i >= 0) {
      j = content.indexOf(i, endTag);
    }
  }

  if (j < content.length) {
    c += content.substring(j);
  }

  return c;
}

