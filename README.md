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
| 1.1.2    |  9/20/21 | Updated WIDGET 13 documentation and included secondary WCAG SC in rule details
| 1.1.1    |  9/16/21 | Updated the extension to support ARIA 1.2 and ARIA in HTML requirements
| 0.96.0   | 10/30/19 | Fixes bug in highlight option not being remembered
