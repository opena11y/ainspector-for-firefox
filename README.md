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
It includes a summary of the total number of rules that resulted in
violations, warnings, manual checks or have passed at the top of the
page using a small table.  It includes two tabs for showing groups of
rules organized by Rule Categories or WCAG Guidlelines.  The groups of
rule results are shown in a grid (i.e. interactive table).  Activating a
row chnages to the "Rule Group View" showing the summary results for the
group of rules.

The Summary view uses the following custom web components:
* `resultSummary`: Summary table of all rule results at top of sidepanel
* `resultTablist`: Switching between Rule Category and WCAG Guidelines grids
* `resultGrid`: Grids of rule group results for Rule Category and WCAG Guidelines

#### `viewRuleGroup.js`

The "Rule Group View" provides information on rule results for a web page.
It includes a summary of the total number of rules that resulted in
violations, warnings, manual checks or have passed at the top of the
page using a small table.  It includes two tabs for showing groups of
rules organized by Rule Categories or WCAG Guidlelines.  The groups of
rule results are shown in a grid (i.e. interactive table).  Activating a
row chnages to the "Rule Group View" showing the summary results for the
group of rules.

The Rule Group view uses the following custom web components:
* `resultSummary`: Summary table of all rule results at top of sidepanel
* `resultGrid`: Grid of rule results for a rule group
* `resultRuleInfo`: Details on the rule currently selected in the rule results

#### `viewRuleResult.js`

The "Rule Result View" provides information on rule results for a web page.
It includes a summary of the total number of rules that resulted in
violations, warnings, manual checks or have passed at the top of the
page using a small table.  It includes two tabs for showing groups of
rules organized by Rule Categories or WCAG Guidlelines.  The groups of
rule results are shown in a grid (i.e. interactive table).  Activating a
row chnages to the "Rule Group View" showing the summary results for the
group of rules.

The Rule Result view uses the following custom web components:
* `resultGrid`: Grid of element results for a rule result
* `resultRuleInfo`: Details on the rule currently selected in the rule results
* Select box for choosing highlight option


#### `resultTablist.js`

#### `resultSummary.js`

#### `resultGrid.js`

#### `resultRuleInfo.js`

#### `commonModule.js`

### Content Page

#### `content.js`

#### `evaluate.js`

### Other

#### `background.js`

#### `storage.js`

#### OpenAjax Evaluation Library
