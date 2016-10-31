'use strict';

var isValid = require('is-valid-app');

module.exports = function(app) {
  if (!isValid(app, 'updater-git-tags')) return;

  /**
   * Plugins
   */

  app.use(rqeuire('generate-project'));

  /**
   * Scaffold out a new gitTags project. This task is an alias for the [gitTags](#gitTags)
   * task, to allow running this updater with the following command:
   *
   * ```sh
   * $ gen gitTags
   * ```
   * @name default
   * @api public
   */

  app.task('default', ['gitTags']);

  /**
   * Scaffold out an [Update][] updater project. Also aliased as the [default](#default) task.
   *
   * ```sh
   * $ gen updater:updater
   * ```
   * @name updater
   * @api public
   */

  app.task('gitTags', ['files']);

  /**
   * Write a `updater.js` file to the current working directory.
   *
   * ```sh
   * $ gen updater:file
   * ```
   * @name file
   * @api public
   */

  task(app, 'updater', 'templates/updater.js');
  task(app, 'index', 'templates/index.js');

  /**
   * Generate the files in the `templates` directory.
   *
   * ```sh
   * $ gen updater:templates
   * ```
   * @name templates
   * @api public
   */

  task(app, 'templates', 'templates/templates/*');
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, pattern) {
  app.task(name, function() {
    var dest = app.options.dest || app.cwd;
    return app.src(pattern, {cwd: __dirname})
      .pipe(app.renderFile('*'))
      .pipe(app.conflicts(dest))
      .pipe(app.dest(dest));
  });
}
