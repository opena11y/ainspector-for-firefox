"use strict";

var i18n = browser.i18n.getMessage;

function hide(id) {
  var node = document.getElementById(id);

  if (node) {
    node.style.display = 'none';
  }
}

function show(id) {
  var node = document.getElementById(id);

  if (node) {
    node.style.display = 'block';
  }
}

function updateTitle(title) {
  var node  = document.getElementById('title');

  var t = i18n(title);

  // if i18n string available use that as the title
  if (typeof t === 'string' && t.length) {
    title = t;
  }

  if (node) {
    node.textContent = title;
  }
}

