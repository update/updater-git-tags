'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var update = require('update');
var npm = require('npm-install-global');
var del = require('delete');
var copy = require('copy');

var utils = require('../utils');
var git = require('./support/git');
var pkg = require('../package');
var updater = require('..');
var app;

var isTravis = process.env.CI || process.env.TRAVIS;
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var actual = path.resolve.bind(path, __dirname, 'actual');
var expected = ['0.1.0', '0.2.0', '0.3.0', 'v0.4.0'];

function exists(tags, cb) {
  return function(err) {
    if (err) return cb(err);
    utils.parseTags({cwd: actual()}, function(err, results) {
      if (err) return cb(err);
      assert.deepEqual(tags, results);
      del(actual(), cb);
    });
  };
}

describe('updater-git-tags', function() {
  this.slow(250);

  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('update', cb);
    });
  }

  beforeEach(function(cb) {
    app = update({silent: true});
    app.cwd = actual();
    copy(fixtures('*'), actual(), function(err) {
      if (err) return cb(err);
      git({cwd: actual()}, cb);
    });
  });

  // afterEach(function(cb) {
  //   del(actual(), cb);
  // });

  describe('tasks', function() {
    it('should extend tasks onto the instance', function() {
      app.use(updater);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('git-tags'));
    });

    it.only('should run the `default` task with .build', function(cb) {
      app.use(updater);
      app.build('default', exists(expected, cb));
    });

    it('should run the `default` task with .update', function(cb) {
      app.use(updater);
      app.update('default', exists(expected, cb));
    });
  });

  describe('git-tags (CLI)', function() {
    it('should run the default task using the `updater-git-tags` name', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.use(updater);
      app.update('updater-git-tags', exists(expected, cb));
    });

    it('should run the default task using the `updater` updater alias', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.use(updater);
      app.update('git-tags', exists(expected, cb));
    });
  });

  describe('git-tags (API)', function() {
    it('should run the default task on the updater', function(cb) {
      app.register('git-tags', updater);
      app.update('git-tags', exists(expected, cb));
    });

    it('should run the `git-tags` task', function(cb) {
      app.register('git-tags', updater);
      app.update('git-tags:git-tags', exists(expected, cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('git-tags', updater);
      app.update('git-tags:default', exists(expected, cb));
    });
  });

  describe('sub-updater', function() {
    it('should work as a sub-updater', function(cb) {
      app.register('foo', function(foo) {
        foo.register('git-tags', updater);
      });
      app.update('foo.git-tags', exists(expected, cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('git-tags', updater);
      });
      app.update('foo.git-tags', exists(expected, cb));
    });

    it('should run the `updater:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('git-tags', updater);
      });
      app.update('foo.git-tags:default', exists(expected, cb));
    });

    it('should run the `updater:git-tags` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('git-tags', updater);
      });
      app.update('foo.git-tags:git-tags', exists(expected, cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', updater)
        .register('bar', updater)
        .register('baz', updater);
      app.update('foo.bar.baz', exists(expected, cb));
    });
  });
});
