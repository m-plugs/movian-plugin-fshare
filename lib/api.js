var http = require('movian/http');
var settings = require('../settings');

var PREFIX = 'fshare';

exports.file = function (page, id) {
  page.type = 'video';
  page.loading = true;
  showtime.print('Fetching file ID: ' + id);

  var base = settings.proxyBase();
  var url = http.request(base + '/file/', {
    postdata: { file: id }
  }).toString();

  page.loading = false;

  var name = url.substring(url.lastIndexOf('/') + 1);
  page.source = 'videoparams:' + JSON.stringify({
    title: decodeURIComponent(name),
    canonicalUrl: PREFIX + ':video:' + id,
    sources: [{ url: url }]
  });
};

function getFolder(code, pageNum) {
  var base = settings.proxyBase();
  return JSON.parse(
    http.request(base + '/folder/' + code + '/' + pageNum).toString()
  );
}

/**
 * Render a folder listing with metadata suitable for the custom
 * views/folder.view layout:
 *   - title       → primary line (file / folder name)
 *   - description → secondary line (modified · downloads)
 *   - duration    → right-aligned size (or "Folder")
 */
function renderList(page, list) {
  if (list.length === 0) return;

  page.metadata.title = shortenPath(list[0]['path']);

  list.forEach(function(item) {
      var isFolder = item.type == 0;
      var type     = isFolder ? 'directory' : 'video';
      var linktype = isFolder ? 'folder'    : 'file';
      var size     = isFolder ? '—'         : formatSize(item.size);
      var modified = formatDate(item.modified);

      var label = item.name + '\n' + modified;

      var lastdl = formatDate(item.lastdownload);
      var desc = '<p><b>' + item.name + '</b></p>'
          + '<p>Size: '          + size                     + '</p>'
          + '<p>Downloads: '     + item.downloadcount       + '</p>'
          + '<p>Modified: '      + modified                 + '</p>'
          + '<p>Last download: ' + lastdl                   + '</p>'
          + '<p>Created: '       + formatDate(item.created) + '</p>';

      page.appendItem('https://www.fshare.vn/' + linktype + '/' + item.linkcode, type, {
          title:       label,
          description: new showtime.RichText(desc),
          duration:    size
      });
  });
}

function shortenPath(path) {
  return path.substr(path.lastIndexOf('/') + 1);
}

function populatePage(page, folder, pageNum) {
  if (pageNum == 0 && folder && folder.length === 0) {
    page.type = 'empty';
  } else {
    renderList(page, folder);
  }
  return folder.length === 100;
}

exports.folder = function (page, code, pageNum) {
  page.type = 'directory';
  page.metadata.title = code;

  function loader() {
    page.loading = true;
    var folder = getFolder(code, pageNum);
    page.loading = false;
    return populatePage(page, folder, pageNum++);
  }

  loader();
  page.paginator = loader;
};

function formatSize(bytes) {
  var b = parseInt(bytes, 10);
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB';
  if (b >= 1048576)    return (b / 1048576).toFixed(1)    + ' MB';
  return                      (b / 1024).toFixed(0)       + ' KB';
}

function formatDate(ts) {
  var d = new Date(parseInt(ts, 10) * 1000);
  return d.getFullYear()
    + '-' + ('0' + (d.getMonth() + 1)).slice(-2)
    + '-' + ('0' + d.getDate()).slice(-2);
}
