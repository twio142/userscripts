// ==UserScript==
// @name         Automatic Site Scripts
// @namespace    http://tampermonkey.net/
// @version      0.1.1
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
// @match        https://www.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/sspai.com.ico
// @run-at       document-end
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/twio142/userscripts/refs/heads/main/autoScript.user.js
// @downloadURL  https://raw.githubusercontent.com/twio142/userscripts/refs/heads/main/autoScript.user.js
// ==/UserScript==

(() => {
  'use strict';
  let target = document.body; let options = { attributes: false, childList: true, subtree: true }; let callback;
  const u = new URL(location.href);
  if (/.*\.wik(?:ipedia|tionary)\.org/.test(u.host)) { // wikipedia.org, wiktionary.org: select simplified Chinese and use skin
    const needsSkin = u.pathname.startsWith('/w') && !u.searchParams.get('useskin');
    if (u.host === 'zh.wikipedia.org' && !u.pathname.startsWith('/zh-cn') && /^\/(?:wiki|zh(?:-[a-z]+)?)\//.test(u.pathname)) {
      u.pathname = u.pathname.replace(/^\/[^/]+\//, '/zh-cn/');
    }
    if (needsSkin) u.searchParams.set('useskin', 'timeless');
    const url = u.toString();
    if (url !== location.href) {
      location.href = url;
    }
  } else if (u.host === 'weibo.com') {
    window.$CONFIG.enablePopLogin = false;
    callback = () => document.querySelector('button[class*=LoginPop]')?.click();
  } else if (/(?:^|\.)sspai\.com$/.test(u.host)) { // sspai.com: remove redirect url
    callback = () => document.querySelectorAll('a[href*="sspai.com/link?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (u.host === 'juejin.cn') { // juejin.cn: remove redirect url
    callback = () => document.querySelectorAll('a[href*="link.juejin.cn?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (u.host === 'www.themoviedb.org') { // themoviedb.org: remove redirect url
    callback = () => document.querySelectorAll('a[href*="click.justwatch.com/a?"]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('r');
      });
  } else if (u.host === 'gitee.com') { // gitee.com: remove redirect url
    callback = () => document.querySelectorAll('a[href*="gitee.com/link?target="]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('target');
      });
  } else if (u.host === 'www.iyf.tv' && u.pathname.startsWith('/play/')) { // iyf.tv: keep video from hiding
    options = { attributes: true, childList: false, subtree: true };
    callback = () => document.querySelector('#main-player')?.classList.contains('controls-hidden') && document.querySelector('#main-player').classList.remove('controls-hidden');
  } else if (/(?:^|\.)inoreader\.com$/.test(u.host)) { // inoreader: remove referrer
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.getElementsByTagName('head')[0].appendChild(meta);
  } else if (u.host === 'gemini.google.com' && u.pathname.startsWith('/app/')) { // google gemini
    options = { attributes: true, childList: false, subtree: true };
    callback = () => document.querySelectorAll('a[href*="www.google.com/search?q=https://"]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('q');
      });
  } else if (u.host === 'localhost:2718') { // marimo notebook: change terminal font
    const css = `.xterm-dom-renderer-owner-1 .xterm-rows { font-family: "FiraCode Nerd Font", monospace !important; }`;
    if (typeof GM_addStyle !== 'undefined') {
      GM_addStyle(css);
    } else {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  } else if (/(?:^|\.)bilibili\.com$/.test(u.host)) { // bilibili: remove url tracker
    callback = () => document.querySelectorAll('a[href*="/video/"]')
      .forEach((y) => {
        const u = new URL(y.href);
        u.searchParams.delete('spm_id_from');
        u.searchParams.delete('trackid');
        y.href = u.toString();
      });
  } else if (u.host === 'www.youtube.com') { // youtube: remove redirect url
    callback = () => document.querySelectorAll('a[href*="www.youtube.com/redirect?"]')
      .forEach((y) => {
        y.href = new URL(y.href).searchParams.get('q');
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
