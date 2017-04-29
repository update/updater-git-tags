'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('async-each-series', 'each');
require('cross-spawn', 'spawn');
require('extend-shallow', 'extend');
require('is-valid-app', 'isValid');
require('log-utils', 'log');
require = fn;

utils.parseLog = function(options, cb) {
  var cwd = process.cwd();

  if (typeof options === 'function') {
    cb = options;
    options = undefined;
  }

  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');
  var results = [];

  if (fs.existsSync(fp)) {
    process.chdir(fp);
    // formats logs to look like
    // 793cfa5db68794e5f77951f9e5abb4e9ef6cd41a first commit
    var child = utils.spawn.sync('git', ['log', '--pretty=%H %s']);
    var gitLog = child.stdout.toString();
    process.chdir(cwd);

    var regex = /^(v?\d+\.\d+(\.\d+)?)/i;
    var commits = gitLog.split('\n');
    for (var i = 0; i < commits.length; i++) {
      var commit = commits[i];
      if (commit && commit.trim()) {
        var segs = commit.split(' ');
        if (regex.test(segs[1])) {
          if (segs.length === 2) {
            results.push({commit: segs[0], message: segs[1]});
          }
        }
      }
    }
  }

  cb(null, results);
};

utils.parseTags = function(options, cb) {
  git(['tag'], options, cb);
};

utils.tagCommit = function(commit, options, cb) {
  var msg = commit.message;
  var commands = ['tag', '-a', commit.message, '-m', commit.message, commit.commit];
  git(commands, options, cb);
};

function git(commands, options, cb) {
  var cwd = process.cwd();
  if (typeof options === 'function') {
    cb = options;
    options = undefined;
  }
  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');
  var res = [];
  if (fs.existsSync(fp)) {
    process.chdir(fp);
    var child = utils.spawn.sync('git', commands);
    res = child.stdout.toString();
    if (res.error || (res.stderr && res.stderr.toString())) {
      cb(new Error(res.error || res.stderr.toString()));
      return;
    }
    res = res.split('\n').filter(Boolean);
    process.chdir(cwd);
  }
  cb(null, res);
}

/**
 * Expose `utils` modules
 */

module.exports = utils;
