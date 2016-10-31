'use stirct';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var utils = require('../../utils');

module.exports = function(options, cb) {
  var cwd = process.cwd();
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  var opts = utils.extend({cwd: cwd}, options);
  var fp = path.join(opts.cwd, '.git');

  if (utils.exists(fp)) {
    return cb();
  }

  mkdirp.sync(opts.cwd);
  var commands = [
    {cmd: 'git', args: ['init']},
    {cmd: 'git', args: ['status']},
    {cmd: 'git', args: ['add', '.']},
    {cmd: 'git', args: ['commit', '-m', 'init']},

    {cmd: echo('line one')},
    {cmd: 'git', args: ['status']},
    {cmd: 'git', args: ['add', '.']},
    {cmd: 'git', args: ['commit', '-m', '0.1.0']},
    {cmd: 'git', args: ['tag', '-a', '0.1.0', '-m', '0.1.0']},

    {cmd: echo('line two')},
    {cmd: 'git', args: ['status']},
    {cmd: 'git', args: ['add', '.']},
    {cmd: 'git', args: ['commit', '-m', '0.2.0']},

    {cmd: echo('line three')},
    {cmd: 'git', args: ['status']},
    {cmd: 'git', args: ['add', '.']},
    {cmd: 'git', args: ['commit', '-m', '0.3.0']},
    {cmd: 'git', args: ['tag', '-a', '0.3.0', '-m', '0.3.0']},

    {cmd: echo('line four')},
    {cmd: 'git', args: ['status']},
    {cmd: 'git', args: ['add', '.']},
    {cmd: 'git', args: ['commit', '-m', 'v0.4.0']}
  ];

  process.chdir(opts.cwd);
  utils.each(commands, function(command, next) {
    if (typeof command.cmd === 'function') {
      command.cmd(next);
      return;
    }

    exec(command.cmd, command.args, function(err, result) {
      console.log(arguments);
      next(err, result);
    });
  }, function(err) {
    process.chdir(cwd);
    if (err) return cb(err);
    cb();
  });
}

function exec(cmd, args, cb) {
  var results = utils.spawn.sync(cmd, args);
  if (results.error || (results.stderr && results.stderr.toString())) {
    cb(new Error(results.error || results.stderr.toString()));
    return;
  }
  cb(null, (results.stdout && results.stdout.toString()) || '');
}

function echo(message) {
  return function(cb) {
    fs.appendFile('temp.txt', message, 'utf8', cb);
  };
}
