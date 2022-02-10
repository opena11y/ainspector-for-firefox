/*
*  Shared constants for use in both panel.js, content.js and evaluate.js to
*  identify rule category and guideline constants for filtering evaluation
*  results and provding localized human readible labels in the sidebar
*
*   File: constants.js
*/

/*
*  GUIDELINES constant is a copy of the constants from the OpenAjax library
*  and is used so the entire OpenAjax library does not need to be in the
*  sidebar.
*/

const GUIDELINES =  {
  G_1_1: 0x000010,
  G_1_2: 0x000020,
  G_1_3: 0x000040,
  G_1_4: 0x000080,
  G_2_1: 0x000100,
  G_2_2: 0x000200,
  G_2_3: 0x000400,
  G_2_4: 0x000800,
  G_2_5: 0x001000,
  G_3_1: 0x002000,
  G_3_2: 0x004000,
  G_3_3: 0x008000,
  G_4_1: 0x010000,
  ALL  : 0x01FFF0
};

/*
*  RULE_CATEGORY constant is a copy of the constants from the OpenAjax
*  library and is used so the entire OpenAjax library does not need to
*  be in the sidebar.
*/

const RULE_CATEGORIES = {
  UNDEFINED              : 0x0000,
  LANDMARKS              : 0x0001,
  HEADINGS               : 0x0002,
  STYLES_READABILITY     : 0x0004,
  IMAGES                 : 0x0008,
  LINKS                  : 0x0010,
  FORMS                  : 0x0020,
  TABLES                 : 0x0040,
  WIDGETS_SCRIPTS        : 0x0080,
  AUDIO_VIDEO            : 0x0100,
  KEYBOARD_SUPPORT       : 0x0200,
  TIMING                 : 0x0400,
  SITE_NAVIGATION        : 0x0800,
  // Composite categories
  ALL                    : 0x0FFF
};

export const ruleCategoryIds = [
  RULE_CATEGORIES.LANDMARKS,
  RULE_CATEGORIES.HEADINGS,
  RULE_CATEGORIES.STYLES_READABILITY,
  RULE_CATEGORIES.IMAGES,
  RULE_CATEGORIES.LINKS,
  RULE_CATEGORIES.FORMS,
  RULE_CATEGORIES.TABLES,
  RULE_CATEGORIES.WIDGETS_SCRIPTS,
  RULE_CATEGORIES.AUDIO_VIDEO,
  RULE_CATEGORIES.KEYBOARD_SUPPORT,
  RULE_CATEGORIES.TIMING,
  RULE_CATEGORIES.SITE_NAVIGATION
];

export const guidelineIds = [
  GUIDELINES.G_1_1,
  GUIDELINES.G_1_2,
  GUIDELINES.G_1_3,
  GUIDELINES.G_1_4,
  GUIDELINES.G_2_1,
  GUIDELINES.G_2_2,
  GUIDELINES.G_2_3,
  GUIDELINES.G_2_4,
  GUIDELINES.G_3_1,
  GUIDELINES.G_3_2,
  GUIDELINES.G_3_3,
  GUIDELINES.G_4_1
];

export function getRuleCategoryLabelId (id) {
  switch (id) {
  case RULE_CATEGORIES.LANDMARKS:
    return 'landmarksLabel';
  case RULE_CATEGORIES.HEADINGS:
    return 'headingsLabel';
  case RULE_CATEGORIES.STYLES_READABILITY:
    return 'stylesContentLabel';
  case RULE_CATEGORIES.IMAGES:
    return 'imagesLabel';
  case RULE_CATEGORIES.LINKS:
    return 'linksLabel';
  case RULE_CATEGORIES.FORMS:
    return 'tablesLabel';
  case RULE_CATEGORIES.TABLES:
    return 'formsLabel';
  case RULE_CATEGORIES.WIDGETS_SCRIPTS:
    return 'widgetsScriptsLabel';
  case RULE_CATEGORIES.AUDIO_VIDEO:
    return 'audioVideoLabel';
  case RULE_CATEGORIES.KEYBOARD_SUPPORT:
    return 'keyboardLabel';
  case RULE_CATEGORIES.TIMING:
    return 'timingLabel';
  case RULE_CATEGORIES.SITE_NAVIGATION:
    return 'siteNavigationLabel';
  case RULE_CATEGORIES.ALL:
    return 'allRulesLabel';
  default:
    return '';
  }
};

export function getRuleCategoryFilenameId (id) {
  switch (id) {
  case RULE_CATEGORIES.LANDMARKS:
    return 'landmarks';
  case RULE_CATEGORIES.HEADINGS:
    return 'headings';
  case RULE_CATEGORIES.STYLES_READABILITY:
    return 'styles-content';
  case RULE_CATEGORIES.IMAGES:
    return 'images';
  case RULE_CATEGORIES.LINKS:
    return 'links';
  case RULE_CATEGORIES.FORMS:
    return 'tables';
  case RULE_CATEGORIES.TABLES:
    return 'forms';
  case RULE_CATEGORIES.WIDGETS_SCRIPTS:
    return 'widgets-scripts';
  case RULE_CATEGORIES.AUDIO_VIDEO:
    return 'audio-video';
  case RULE_CATEGORIES.KEYBOARD_SUPPORT:
    return 'keyboard';
  case RULE_CATEGORIES.TIMING:
    return 'timing';
  case RULE_CATEGORIES.SITE_NAVIGATION:
    return 'site-navigation'
  case RULE_CATEGORIES.ALL:
    return 'all-rules';
  default:
    return 'undefined';
  }
};

export function getGuidelineLabelId (id) {

  switch(id) {

  case GUIDELINES.G_1_1:
    return 'g1.1';
  case GUIDELINES.G_1_2:
    return 'g1.2';
  case GUIDELINES.G_1_3:
    return 'g1.3';
  case GUIDELINES.G_1_4:
    return 'g1.4';
  case GUIDELINES.G_2_1:
    return 'g2.1';
  case GUIDELINES.G_2_2:
    return 'g2.2';
  case GUIDELINES.G_2_3:
    return 'g2.3';
  case GUIDELINES.G_2_4:
    return 'g2.4';
  case GUIDELINES.G_2_5:
    return 'g2.5';
  case GUIDELINES.G_3_1:
    return 'g3.1';
  case GUIDELINES.G_3_2:
    return 'g3.2';
  case GUIDELINES.G_3_3:
    return 'g3.3';
  case GUIDELINES.G_4_1:
    return 'g4.1';
  case GUIDELINES.ALL:
    return 'allRulesLabel';
  default:
    return GUIDELINES.UNDEFINED;

  }
};

export function getGuidelineFilenameId (id) {

  switch(id) {

  case GUIDELINES.G_1_1:
    return 'g1-1';
  case GUIDELINES.G_1_2:
    return 'g1-2';
  case GUIDELINES.G_1_3:
    return 'g1-3';
  case GUIDELINES.G_1_4:
    return 'g1-4';
  case GUIDELINES.G_2_1:
    return 'g2-1';
  case GUIDELINES.G_2_2:
    return 'g2-2';
  case GUIDELINES.G_2_3:
    return 'g2-3';
  case GUIDELINES.G_2_4:
    return 'g2-4';
  case GUIDELINES.G_2_5:
    return 'g2-5';
  case GUIDELINES.G_3_1:
    return 'g3-1';
  case GUIDELINES.G_3_2:
    return 'g3-2';
  case GUIDELINES.G_3_3:
    return 'g3-3';
  case GUIDELINES.G_4_1:
    return 'g4-1';
  case GUIDELINES.ALL:
    return 'all-rules';
  default:
    return GUIDELINES.UNDEFINED;

  }
};
