/*
*  Shared validatePrefix for use in exportButton.js and options.js
*
*   File: validatePrefix.js
*/

export function isCharacterAllowed(c) {
  if ((c.charCodeAt(0) <= 32) || ('<>:"/\\|?*[]'.indexOf(c) >= 0)) {
    return false;
  }
  return true;
}

export function validatePrefix (value) {
  if (typeof value !== 'string') {
    value = '';
  }

  let v = '';
  for(let i = 0; i < value.length; i += 1) {
    const c = value[i];
    if (isCharacterAllowed(c)) {
      v += c;
    }
  };
  v = v.substring(0, 16);
  return v;
}

export function validateShortcut (value) {
  if (typeof value !== 'string') {
    value = '';
  }
  let v = value;
  return v;
}
