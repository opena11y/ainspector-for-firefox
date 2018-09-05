"use strict";

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
  var node = document.getElementById('title');

  if (node) {
    node.innerHTML = title;
  }
}

