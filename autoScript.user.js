// ==UserScript==
// @name         Automatic Site Scripts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       twio142
// @match        https://*.sspai.com/*
// @match        https://juejin.cn/*
// @match        https://www.themoviedb.org/*
// @match        https://theinitium.com/*
// @match        https://*.wikipedia.org/*
// @match        https://*.wiktionary.org/*
// @match        https://weibo.com/*
// @match        https://www.iyf.tv/play/*
// @match        https://*.inoreader.com/*
// @match        https://gitee.com/*
// @match        https://gemini.google.com/app/*
// @match        http://localhost:2718/*
// @match        https://*.bilibili.com/*
// @icon         https://icons.duckduckgo.com/ip2/sspai.com.ico
// @run-at       document-end
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/twio142/userscripts/refs/heads/main/autoScript.user.js
// @downloadURL  https://raw.githubusercontent.com/twio142/userscripts/refs/heads/main/autoScript.user.js
// ==/UserScript==

(() => {
  'use strict';
  let url = window.location.href; let target = document.body; let options = { attributes: false, childList: true, subtree: true }; let callback;
  if (url.match(/https?:\/\/.*\.wik(ipedia|tionary)\.org\//)) { // wikipedia.org, wiktionary.org: select simplified Chinese and use skin
    if (url.match(/zh\.wikipedia\.org\/(?!zh-cn)/) && url.match(/zh\.wikipedia\.org\/.+?\/(?!index.php)/)) {
      url = url.replace(/(.org)\/.+?\//, '$1/zh-cn/');
    }
    if (!url.match(/[?&]useskin=.+/)) {
      url = url.replace(/(\?[^/]+)?$/, (...x) => `${x[0]}${x[1] ? '&' : '?'}useskin=timeless`);
    }
    if (url !== window.location.href) {
      window.location.href = url;
    }
  } else if (url.match(/https?:\/\/weibo\.com\//)) {
    window.$CONFIG.enablePopLogin = false;
    callback = () => document.querySelector('button[class*=LoginPop]')?.click();
  } else if (url.match(/https?:\/\/.*sspai\.com\//)) { // sspai.com: remove redirect url
    callback = () => document.querySelectorAll('a[href*="sspai.com/link?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (url.match(/https?:\/\/juejin\.cn\//)) { // juejin.cn: remove redirect url
    callback = () => document.querySelectorAll('a[href*="link.juejin.cn?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (url.match(/https?:\/\/www\.themoviedb\.org\//)) { // themoviedb.org: remove redirect url
    callback = () => document.querySelectorAll('a[href*="click.justwatch.com/a?"]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('r');
      });
  } else if (url.match(/https?:\/\/gitee\.com\//)) { // gitee.com: remove redirect url
    callback = () => document.querySelectorAll('a[href*="gitee.com/link?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (url.match(/https?:\/\/www\.iyf\.tv\/play\//)) { // iyf.tv: keep video from hiding
    options = { attributes: true, childList: false, subtree: true };
    callback = () => document.querySelector('#main-player')?.classList.contains('controls-hidden') && document.querySelector('#main-player').classList.remove('controls-hidden');
  } else if (url.match(/https?:\/\/(.+\.)?inoreader\.com/)) { // inoreader: remove referrer
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.getElementsByTagName('head')[0].appendChild(meta);
  } else if (url.match(/https?:\/\/gemini.google\.com\/app\//)) { // google gemini
    options = { attributes: true, childList: false, subtree: true };
    callback = () => document.querySelectorAll('a[href*="www.google.com/search?q=https://"]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('q');
      });
  } else if (url.includes('http://localhost:2718')) { // marimo notebook: change terminal font
    const css = `.xterm-dom-renderer-owner-1 .xterm-rows { font-family: "FiraCode Nerd Font", monospace !important; }`;
    if (typeof GM_addStyle !== 'undefined') {
      GM_addStyle(css);
    } else {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  } else if (url.match(/bilibili\.com\//)) { // bilibili: remove url tracker
    callback = () => document.querySelectorAll('a[href*="/video/"]')
      .forEach((y) => {
        const u = new URL(y.href);
        u.searchParams.delete('spm_id_from');
        u.searchParams.delete('trackid');
        y.href = u.toString();
      });
  }
  if (callback) {
    if (target) {
      const observer = new MutationObserver(callback);
      observer.observe(target, options);
    } else {
      console.error('target node not found!');
    }
  }
})();
