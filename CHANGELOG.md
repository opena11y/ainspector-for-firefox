# AInsprctor WCAG Version History

## Summary

| Version  |    Date    | Notes |
|----------|:----------:|--------------------------------------------|
| 2.0.0    |   1/28/22  | Rewrote code to use web components, added element result details view and export evaluation results
| 1.1.3    |   10/7/21  | Updated references in documentation to use WCAG 2.1 for techniques
| 1.1.2    |   9/20/21  | Updated WIDGET 13 documentation and included secondary WCAG SC in rule details
| 1.1.1    |   9/16/21  | Updated the extension to support ARIA 1.2 and ARIA in HTML requirements
| 0.96.0   |  10/30/19  | Fixes bug in highlight option not being remembered


## Version 2.0 — 2/4/22

* Rewrote the entire code base to use web components for creating user interface controls
* Used event and direct port model used in [a11ytools/addons/structure-3](https://github.com/a11y-tools/addons/tree/main/structure-3) to automatically update the evaluation based on tab changes and following links to fix long standing problems updating.
* Export evaluation result in either CSV or JSON file formats
* Added element results details view in Rule Result view to provide more details on a particular element result
* Added copy rule information button to copy tule information to the clipboard
* Added copy element information button to copy tule information to the clipboard
* Added user configurable keyboard shortcuts for common functions
* Updated to A11y Evaluation Library 1.3 to support custom elements and provide additional element result information
* Used event and direct port model used in [a11ytools/addons/structure-3](https://github.com/a11y-tools/addons/tree/main/structure-3) to automatically update the evaluation based on tab changes and following links
* Updated the preferences to use the storage uility used in [a11ytools/addons/structure-3](https://github.com/a11y-tools/addons/blob/main/structure-3/storage.js)
* Improved element highlight feature in rule result view
* Improved keyboard focus styling indicator to supprt high contrast modes
* Copy button provides temporal feedback if copy was successful
* The header section with the title, back and view buttons is now sticky, so always visible as browser height changes
