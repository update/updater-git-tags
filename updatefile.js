'use strict';

var utils = require('./utils');

module.exports = function(app) {
  if (!utils.isValid(app, 'updater-git-tags')) return;

  /**
   * Update the git tags for a project. This task is an alias for the [git-tags](#git-tags)
   * task, to allow running this updater with the following command:
   *
   * ```sh
   * $ update git-tags
   * ```
   * @name default
   * @api public
   */

  app.task('default', ['git-tags']);

  /**
   * Update the git tags for a project. Also aliased as the [default](#default) task.
   * This will only find missing git tags if there is a git commit with a version number.
   *
   * ```sh
   * $ update git-tags:git-tags
   * ```
   * @name git-tags
   * @api public
   */

  app.task('git-tags', function(cb) {
    var opts = {cwd: app.cwd};
    utils.parseLog(opts, function(err, commits) {
      if (err) return cb(err);
      utils.parseTags(opts, function(err, tags) {
        if (err) return cb(err);
        var missing = commits.filter(function(commit) {
          return tags.indexOf(commit.message.trim()) === -1
        });
        var results = [];
        utils.each(missing, function(commit, next) {
          console.log(utils.log.timestamp, 'Adding tag', utils.log.cyan(commit.message), 'for commit', utils.log.cyan(commit.commit));
          utils.tagCommit(commit, opts, function(err, result) {
            if (err) return next(err);
            results.push(result);
            next();
          });
        }, function(err) {
          if (err) return cb(err);
          console.log(utils.log.timestamp, 'Added', utils.log.cyan(results.length), 'missing tags.');
          cb();
        });
      });
    });
  });
};
