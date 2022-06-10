/* utils.js */

export {
  getResultStyle
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
