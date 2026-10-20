/*
 * Movian fshare Plugin
 * (c) 2022 Robert Nguyen All rights reserved
 */

var PREFIX = 'fshare';
var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.41';
var page = require('showtime/page');
var http = require('movian/http');
var api = require('./lib/api');

// Side-effect: registers the settings page (proxyUrl, …)
var settings = require('./settings');

// Create the service (icon on home screen)
require('showtime/service').create(
  'fshare',
  PREFIX + ':start',
  'video',
  true,
  Plugin.path + 'logo.png'
);

// Landing page — Collections
new page.Route(PREFIX + ':start', function (page) {
  page.type = 'directory';
  page.metadata.title = 'Collections';

  page.loading = true;
  var list = JSON.parse(
    http.request(settings.proxyBase() + '/collection').toString()
  );
  page.loading = false;

  list.forEach(function (item) {
    page.appendItem(
      'https://www.fshare.vn/folder/' + item['code'],
      'directory',
      { title: item['name'] }
    );
  });
});

// Routes for video playback
new page.Route(PREFIX + ':video:([A-Z0-9]+)', api.file);

// file
new page.Route('.*\\.fshare\\.vn/file/([A-Za-z0-9]*)', api.file);

// folder
new page.Route('.*\\.fshare\\.vn/folder/([A-Za-z0-9]*(/\\d+)?)', function (page, code, pageNum) {
  if (!pageNum) {
    pageNum = 0;
  }
  return api.folder(page, code, pageNum);
});
