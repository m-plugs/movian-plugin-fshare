/**
 * settings.js — registers the plugin's user-configurable settings
 * and exposes current values as a plain object other modules read from.
 *
 * Pattern follows the RAP plugin (settings.globalSettings is a constructor;
 * Plugin.title/synopsis are not native properties — read from Plugin.manifest).
 */

var settingsModule = require('movian/settings');

exports.settings = {
  // Default proxy base (no trailing slash). May be stored with or without scheme.
  proxyUrl: 'https://example.com'
};

var manifest = JSON.parse(Plugin.manifest);

var group = new settingsModule.globalSettings(
  Plugin.id,
  manifest.title,
  Plugin.path + 'logo.png',
  manifest.synopsis
);

group.createString(
  'proxyUrl',
  'Proxy URL (with or without https://)',
  'https://example.com',
  function (v) {
    exports.settings.proxyUrl = v;
  }
);

/**
 * Return a normalized base URL for the proxy.
 * Accepts both "example.com" and "https://example.com" (or http://).
 * Always returns a string ending without a trailing slash.
 */
exports.proxyBase = function () {
  var u = (exports.settings.proxyUrl || '').trim();
  if (!u) u = 'https://example.com';
  if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u;
  }
  // strip trailing slash
  return u.replace(/\/+$/, '');
};
