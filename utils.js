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
require('fs-exists-sync', 'exists');
require('is-valid-app', 'isValid');
require('log-utils', 'log');
require = fn;

utils.parseLog = function(options, cb) {
  var re = /^(v?\d*\.\d*\.\d*)/i;
  var cwd = process.cwd();
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');
  var results = [];
  if (utils.exists(fp)) {
    process.chdir(fp);
    // formats logs to look like
    // 793cfa5db68794e5f77951f9e5abb4e9ef6cd41a first commit
    var child = utils.spawn.sync('git', ['log', '--pretty=%H %s']);
    var output = child.stdout.toString();
    process.chdir(cwd);

    results = output
      .split('\n')
      .filter(Boolean)
      .map(function(line) {
        var idx = line.indexOf(' ');
        if (idx === -1) {
          return;
        }

        return {
          commit: line.slice(0, idx),
          message: line.slice(idx + 1)
        };
      }).filter(Boolean)
      .filter(function(commit) {
        if (!commit || !commit.message) {
          return false;
        }

        var m = commit.message.match(re);
        if (m && m[1]) {
          return true;
        }
      });
  }

  cb(null, results);
};

utils.parseTags = function(options, cb) {
  var cwd = process.cwd();
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');
  var res = [];
  if (utils.exists(fp)) {
    process.chdir(fp);
    var child = utils.spawn.sync('git', ['tag']);
    res = child.stdout.toString()
      .split('\n')
      .filter(Boolean);
    process.chdir(cwd);
  }
  cb(null, res);
};

utils.tagCommit = function(commit, options, cb) {
  var cwd = process.cwd();
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');
  if (utils.exists(fp)) {
    process.chdir(fp);
    var results = utils.spawn.sync('git', ['tag', '-a', commit.message, '-m', commit.message, commit.commit]);
    process.chdir(cwd);

    if (results.error || (results.stderr && results.stderr.toString())) {
      cb(new Error(results.error || results.stderr.toString()));
      return;
    }
  }
  cb(null, (results.stdout && results.stdout.toString()) || '');
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
