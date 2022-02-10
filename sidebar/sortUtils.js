  /* sortValues.js */

  // returns a number for the sorting the result value
  export function getResultSortingValue (result) {
    return ['', 'N/A', 'P', 'MC', 'W', 'V'].indexOf(result);
  }

  // returns a number used for representing SC for sorting
  export function getSCSortingValue (sc) {
    let parts = sc.split('.');
    let p = parseInt(parts[0], 10);
    let g = parseInt(parts[1], 10);
    let s = parseInt(parts[2], 10);
    return (p * 10000 + g * 100 + s) * -1;
  }

  // returns a number used for representing level value for sorting
  export function getLevelSortingValue (level) {
    return ['', 'AAA', 'AA', 'A'].indexOf(level);
  }

  // returns a number used for representing required value for sorting
  export function getRequiredSortingValue (required) {
    return required ? 2 : 1;
  }

  export function sortRuleResults(ruleResults) {
    return ruleResults.sort((a, b) => {
      let valueA = a.resultValue;
      let valueB = b.resultValue;
      if (valueA === valueB) {
        valueA = getLevelSortingValue(a.level);
        valueB = getLevelSortingValue(b.level);
        if (valueA === valueB) {
          valueA = getRequiredSortingValue(a.required);
          valueB = getRequiredSortingValue(b.required);
          if (valueA === valueB) {
            valueA = getSCSortingValue(a.wcag);
            valueB = getSCSortingValue(b.wcag);
          }
        }
      }
      return valueB - valueA;
    });
  }
