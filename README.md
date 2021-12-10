# AInspector WCAG

AInspector WCAG is a port of [AInspector Sidebar](https://ainspector.github.io/) to use the web extension APIs for the Firefox browser.  Firefox was choosen to port to first, since Firefox supports the the sidebar API and Chrome does not.  The extension is available in the Firefox add-ons page.

[Install AInspector WCAG](https://addons.mozilla.org/en-US/firefox/addon/ainspector-wcag)

## Compatibility
* Firefox Version 60 or newer

## Keyboard Shortcuts

### Windows and Linux

| Function | Key | Notes |
|----------|:---:|-------|
| Open sidebar | ALT+ Shift + I | Opens sidebar
| Move focus to sidebar | F6 | <ul><li>F6 moves focus between the address bar, HTML content and the sidebar, visual focus is often difficult to see visually</li><li>Use the TAB key to move focus to sidbar controls</li></ul> |

### Mac OSX

| Function | Key | Notes |
|----------|:---:|-------|
| Open sidebar | Command + Shift + I | Opens sidebar
| Move focus to sidebar | Command + L and Tab | Keys move focus first to the address bar and then uses tab key to move focus to the controls in the sidebar  |

## Issues and Features
* Please use the [Github issues list](https://github.com/ainspector/webextensions-firefox/issues) to report problems or suggest new features

## Version History

| Version  | Date | Notes |
|----------|:----:|-------|
| 2.0      |  12/09/21 | Updated code to use web components and fix long standing bugs
| 1.2      |  11/19/21 | Updated evaluation library to version 1.3
| 1.1.3    |  10/7/21  | Updated references in documentation to use WCAG 2.1 for techniques
| 1.1.2    |  9/20/21  | Updated WIDGET 13 documentation and included secondary WCAG SC in rule details
| 1.1.1    |  9/16/21  | Updated the extension to support ARIA 1.2 and ARIA in HTML requirements
| 0.96.0   | 10/30/19  | Fixes bug in highlight option not being remembered


## Major To Do's for Version 2.0

* ViewsMenu: Using web compontent
* Preferences: Using storage
* Delay feature for re-run button
* Element highlight feature

## Code Documentation

### Sidebar

#### `panel.js`
* Sidebar views and features are created and initialized.
  * Summary View: Overall rule results and rule grouping results
  * Rule Group View: The rule results for either a rule category or WCAG guideline group of rules
  * Rule Result View: The element results for a specific rule
* Exchanges inform with the `content.js` in the web page to using messaging.
* Includes initializing and responding to common controls used in all views:
  * Back button
  * Views menu button
  * Preferences button
  * Re-run evaluation button, includes option for delayed evaluation

#### `viewSummary.js`

The "Summary View" provides information on rule results for a web page.
The view includes a summary of the total number of rules that resulted in
violations, warnings, manual checks or have passed at the top of the
sidebar using a table.  It includes two tabs for showing groups of
rules organized by Rule Categories or WCAG Guidlelines.  The groups of
rule results are shown in a grid (i.e. interactive table).  Activating a
row changes to the "Rule Group View" showing the summary results for the
group of rules.

The Summary view uses the following custom web components:
* `resultSummary`: Summary table of all rule results at top of sidepanel
* `resultTablist`: Switching between Rule Category and WCAG Guidelines grids
* `resultGrid`: Grids of rule group results for Rule Category and WCAG Guidelines

#### `viewRuleGroup.js`

The "Rule Group View" provides information on rule results for a group of rules.
Ihe view includes a summary of the number of rules in the group that resulted in
violations, warnings, manual checks or have passed at the top of the
sidebar using a table.  The rule results are shown in a grid (i.e. interactive table).
Activating a row changes to the "Rule Result View" showing the summary results for the
group of rules.  Changing the row selection updates the details/action information.

The Rule Group view uses the following custom web components:
* `resultSummary`: Summary table of all rule results at top of sidepanel
* `resultGrid`: Grid of rule results for a rule group
* `resultRuleInfo`: Details and actions for the rule results currently selected in the grid

#### `viewRuleResult.js`

The "Rule Result View" provides information on element results for a rule result.
The view includes two tabs for showing the details/actions and the element results.
The element results are shown in a grid (i.e. interactive table).  Selecting a
row can highlight the element on the web page. The other tab has details/action about the
rule and actions associated with the rule result.  The select box is used for choosing
highlighting options.

The Rule Result view uses the following custom web components and form controls:
* `resultGrid`: Grid of element results for a rule result
* `resultRuleInfo`: Details on the rule currently selected in the rule results
* Standard HTML `select` element for choosing highlight option


#### `resultTablist.js`

The "ResultTablist" custom web component is used to switch the rendering between two tabs.
The web component is used in the "Summary" and "Rule Result" views.

#### `resultSummary.js`

The "ResultSummary" custom web component is used to display a summary of rule results for a
group of rules, including all rule results.  The summary uses a table to provide context for
the number of rules violations, warnings, manual checks or have passed.  The numbers have
background colors related to severity of the rule results.

#### `resultGrid.js`

The "ResultGrid" custom web component is used to display an interactive table of rule and element
result details.
The result grid provides keyboard navigation, row sorting and supports the handling of row activation
and selection events.  Activation events change to a more detailed view and selection
events update rule result details/action in the rule group view and element highlighting in the
rule result view.

#### `resultRuleInfo.js`

The "ResultRuleInfo" is used to render the details/actions related to a rule result.  It is used
in the Rule Group and Rule Result views.

#### `highlightSelect.js`

The "HighlightSelect" custom web compnent is used to choose the element results highlighting option in the rule results view.

#### `constants.js`

Constants used for constucting the initial grid for the summary view and the views menu.

### Content Page

#### `content.js`

The content script receives commands from the panel.js script and returns information objects
associated with the Summary, Rule Group and Rule Results views.

#### `evaluate.js`

The evalute script is the interface between the evaluation library and the content script.
The functions in the script evecute and evaluation and then constucts data objects for sending
information to the panel script for rendering in the sidebar.

### Other

#### `background.js`

The background script is used to show and hide the sidebar when the button is selected in the address bar or from a menu option.

#### `storage.js`

The stoage script is used to manage extension options and preferences.
#### OpenAjax Evaluation Library
