# AInspector Version History

## Summary

| Version      |    Date     | Notes |
|--------------|:-----------:|-----------------------------------------------------|
| 3.0.4        |   3/4/24   | Updated evaluation library to version 2.0.4
| 3.0.2        |   2/29/24   | Updated evaluation library to version 2.0.3
| 3.0.1        |   2/7/24    | Updated evaluation library
| 3.0          |   1/25/24   | Fixed bugs and add additional WCGA 2.1 and 2.2 rules
| 2.99.6       |   12/15/23  | Fixed bugs and add target size rules
| 2.99.5       |   11/17/23  | Fixed bugs and add target size rules
| 2.99.0       |   9/7/23    | Updated to OpenA11y Evaluation Library 2.0 and some UI features
| 2.2.1        |   3/12/23   | Updated info icon labeling and activation feedback
| 2.2.0        |   2/10/23   | Added information button and updated view labeling
| 2.1.2        |   12/17/22  | Updated evaluation library to fix CCR bug
| 2.1.1        |   11/21/22  | Fixed bug rerunning evaluations
| 2.1.0        |   10/31/22  | Fixed bug in evaluations not completing and updated labeling of some user interface  components in the options panel
| 2.0.0        |   3/30/22   | Rewrote code to use web components, added element result details view and export evaluation results
| 1.1.3        |   10/7/21   | Updated references in documentation to use WCAG 2.1 for techniques
| 1.1.2        |   9/20/21   | Updated WIDGET 13 documentation and included secondary WCAG SC in rule details
| 1.1.1        |   9/16/21   | Updated the extension to support ARIA 1.2 and ARIA in HTML requirements
| 0.96.0       |  10/30/19   | Fixes bug in highlight option not being remembered

=======
### 3.04
* Evaluation library update fixes bug in widget rule for required parent roles

### 3.02
* Update includes fixed bug in color contrast calculation

### 3.01
* Updated evaluation library to versino 2.0.2 with improved support of row role in table, grid and treegrid; and color contrast rule

### 3.0
* Updated video and audio rules
* Fixed some bugs in table rules
* Added additional WCAG 2.1 and 2.2 rules

### 2.99.6 (Beta of version 3.0)
* Updated evaluation library to add addition WCAG 2.1 and 2.2 Level A rules
  * 2.5.1 Pointer Gestures
  * 2.5.2 Pointer Cancellation
  * 2.5.3 Label in Name
  * 2.5.4 Motion Actuation
  * 2.1.4 Character Key Shortcuts
  * 3.2.6 Consistent Help
* Fixed some bugs in evaluation library

### 2.99.5 (Beta of version 3.0)
* Fixed some bugs in color contrast calculation
* Added target size rules
* Other smaller updates to rules and documentation

### 2.99.0 (Beta of version 3.0)
* Updated to use OpenA11y Evaluation Library 2.0 to support WCAG 2.1 requirements
* New ruleset and rule scope filtering options
* Improved element result level information

### 2.2.1
* Updated info icon and dialog labeling
* Added information icon activation animation

### 2.2.0
* Added information button to rule summary and element summary grids to provide documentation on the meaning of the symbols
* Updating labeling of views to improve orientation to information in each view

### 2.1.2
* Updated evaluation library to fix the ccr calculation bug for rgba values
* Updated CCR details to include computed hex colors for foreground and background

## Version 2.1.1 — 11/21/22
* Fixed bug rerunning evaluations
* Rerun evaluation is now initialized with delay option enabled
* Added home page link to manifest file

## Version 2.1 — 10/31/22
* Updated Summary tabpanel labeling to improve consistency (Rule Categories/WCAG Guidelines)
* Updated position and labeling of "Export Data" button
* Fixed bug in highlighting module that prevented some evaluations from being completed

## Version 2.0 — 3/30/22

* Renamed extension from "AInspector WCAG" to "AInspector", since most people just call it AInspector
* Rewrote the entire code base to use web components for creating user interface controls
* Removed ARIA Transitional ruleset from the options, since the reduced requirement are no relevant to modern web design.  This change simplies the user interface.
* Used event and direct port model used in [a11ytools/addons/structure-3](https://github.com/a11y-tools/addons/tree/main/structure-3) to automatically update the evaluation based on tab changes and following links to fix long standing problems updating.
* Updated the preferences to use the storage.js uility in [a11ytools/addons/structure-3](https://github.com/a11y-tools/addons/blob/main/structure-3/storage.js)
* Export evaluation result in either CSV or JSON file formats
* Added element results details view in Rule Result view to provide more information on a particular element result
* Removed the "Details/Action" tab from the element results view
* Enabled text in the selected rule or element information areas "selectable" for copying to the clipboard
* Added copy rule information button to copy information to the clipboard
* Added copy element information button to copy information to the clipboard
* Added user keyboard shortcuts for Back, View, Export, Rerun and Copy buttons
* Keyboard shortcuts for View, Export, Rerun and Copy can be configured
* Keyboard shortcuts can be disable
* Updated to A11y Evaluation Library 1.3 to support custom elements and provide additional element result information
  * Note the evaluation library update also deprecates the ROLE_* rules (14) in favor of the new HTML_3 rule on role restrictions using the ARIA in HTML specification
* Improved element highlight feature in rule result view
* Improved keyboard focus styling indicator to supprt high contrast modes
* Copy button provides temporal feedback if copy was successful
* The header section with the title, back and view buttons is now sticky, so always visible as browser height changes
* Reorganized the code repository to create "dist" and "src" directories
