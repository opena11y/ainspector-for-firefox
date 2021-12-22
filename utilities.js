/*
*   utilities.js
*/

/*
**  Returns an item for string for appending to a CSV stream
**  Cleans text for use with exporting as CSV
*/
export function formatItemForCSV (item, last) {
  item = item.trim();
  item = item.replace('"', '\"');
  item = item.replace('\n', '');
  item = item.replace('\r', '');
  item = '"' + item + '"';
  if (!last) {
    item += ',';
  }
  return item
}
