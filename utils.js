'use strict';

var fs = require('fs');
var path = require('path');

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('async-each', 'each');
require('cross-spawn', 'spawn');
require('extend-shallow', 'extend');
require('fs-exists-sync', 'exists');
require('is-valid-app', 'isValid');
require('log-utils', 'log');
require('parse-git-log');
require = fn;

utils.parseLog = function(options, cb) {
  var re = /^(v?\d*\.\d*\.\d*)/i;
  utils.parseGitLog(options)
    .then(function(results) {
      results = results.filter(function(commit) {
        if (!commit || !commit.message) {
          return false;
        }

        var m = commit.message.match(re);
        if (m && m[1]) {
          return true;
        }
      });
      cb(null, results);
    }, function(err) {
      cb(err);
    });
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
    var child = utils.spawn.sync('git', ['tag', '-a', commit.message, '-m', commit.message]);
    process.chdir(cwd);

    if (child.stderr && child.stderr.toString()) {
      cb(new Error(child.stderr.toString()));
      return;
    }
  }
  cb(null, child.stdout.toString());
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
