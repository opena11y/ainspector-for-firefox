# AInspector 3.0

[AInspector](https://ainspector.disability.illinois.edu) uses the web extension APIs for the Firefox browser to create a sidebar for evaluating web accessibility and the user interface is based on [AInspector Sidebar](https://ainspector.github.io/) using XUL.  Firefox support for the sidebar API is ideal for allowing evaluation information to always be visible and updated as links are followed and new tabs and windows are opened.  AInspector is available from the Firefox add-ons page:

[Install AInspector for Firefox](https://addons.mozilla.org/en-US/firefox/addon/ainspector-wcag)

## Compatibility
* Firefox Version 60 or newer

## Keyboard Shortcuts

### Windows and Linux

| Function | Key | Notes |
|----------|:---:|-------|
| Open sidebar | ALT+ Shift + U | Opens sidebar
| Move focus to sidebar | F6 | <ul><li>F6 moves focus between the address bar, HTML content and the sidebar, visual focus is often difficult to see visually</li><li>Use the TAB key to move focus to sidbar controls</li></ul> |

### Mac OSX

| Function | Key | Notes |
|----------|:---:|-------|
| Open sidebar | Command + Shift + U | Opens sidebar
| Move focus to sidebar | Command + L and Tab | Keys move focus first to the address bar and then uses tab key to move focus to the controls in the sidebar  |

## Issues and Features
* Please use the [Github issues list](https://github.com/ainspector/webextensions-firefox/issues) to report problems or suggest new features

## Version History

### 3.0.b1
* Updated to use OpenA11y Evaluation Library 2.0 to support;
  * WCAG 2.1
  * ARIA 1.2
  * ARIA in HTML
  * Improved accessible name computation
  * Improved table rules
  * Updated keyboard rules
  * Fixed minor bugs
* New ruleset and rule scope filtering options
  * New First Step Rules option
* Improved element result level information
* Improved element highlighting

### 2.2.1
* Updated info icon and dialog labeling
* Added information icon activation animation

### 2.2.0
* Added information button to rule summary and element summary grids to provide documentation on the meaning of the symbols
* Updating labeling of views to improve orientation to information in each view

### 2.1.2
* Updated evaluation library to fix the ccr calculation bug for rgba values
* Updated CCR details to include computed hex colors for foreground and background

### 2.1.1
* Fixed bug rerunning evaluations
* Rerun evaluation is now initialized with delay option enabled
* Added home page link to manifest file

### 2.1
* Updated Summary tabpanel labeling to improve consistency (Rule Categories/WCAG Guidelines)
* Updated position and labeling of "Export Data" button
* Fixed bug in highlighting module that prevented some evaluations from being completed

### 2.0.1
* Provides a message in the title and location information for pages that do not allow evaluation
