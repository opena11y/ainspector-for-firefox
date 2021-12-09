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
  * Summary view: Overall rule results and rule grouping results
  * Rule Group view: The rule results for either a rule category or WCAG guideline group of rules
  * Rule Result: The element results for a specific rule
* Exchanges inform with the `content.js` in the web page to using messaging.

#### `viewSummary.js`

#### `viewGroup.js`

#### `viewRule.js`

#### `resultTablist.js`

#### `resultSummary.js`

#### `resultGrid.js`

#### `resultRuleInfo.js`

#### 'commonModule.js'

### Content

### Background
