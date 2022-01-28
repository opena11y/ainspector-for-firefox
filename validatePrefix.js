/*
*  Shared validatePrefix for use in exportButton.js and options.js
*
*   File: validatePrefix.js
*/

function isCharacterAllowed(c) {
  if ((c <= 32) || ('<>:"/\\|?*[]'.indexOf(c) >= 0)) {
    return false;
  }
  return true;
}

export default function validatePrefix (value) {
  let value1 = '';

  if (typeof value !== 'string') {
    value = '';
  }
  if (value.length > 16) {
    value = value.substring(0, 16);
  }

  for (let i = 0; i < value.length; i += 1) {
    if (isCharacterAllowed(value[i])) {
      value1 += value[i];
    }
  }

  return value1;
}
