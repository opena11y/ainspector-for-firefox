/*
*   utilities.js
*/

/*
**  Returns an item for string for appending to a CSV stream
**  Cleans text for use with exporting as CSV
*/
export function formatItemForCSV (item, last) {
  console.log('\n[formatItemForCSV][A]: ' + item);
  item = item.trim();
  item = item.replace('"', '\"');
  item = item.replace('\n', '');
  item = item.replace('\r', '');
  item = '"' + item + '"';
  if (!last) {
    item += ',';
  }
  console.log('[formatItemForCSV][B]: ' + item);
  return item
}
