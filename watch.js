var async = require('async');
var chokidar = require('chokidar');
var cp = require('child_process');

var docker_ip;

function getdockerip (cb) {
  cp.exec('boot2docker ip 2>/dev/null', function (err, stdout) {
    if (err) {
      return cb(err);
    }
    docker_ip = stdout;
    cb();
  });
}

function install_rsync (cb) {
  cp.exec('boot2docker ssh "tce-load -wi rsync"', function (err, stdout) {
    cb();
  });
}

function rsync (cb) {
  var child = cp.spawn('rsync', [
    '-av',
     process.cwd() + '/',
     '--exclude-from',
     '.gitignore',
     'docker@' + docker_ip + ':' + process.cwd()
  ]);
  child.stderr.on('data', function (data) {
    console.error(data.toString());
  });
  child.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  child.on('exit', function () {
    cb();
  });
}

function mkdirp (cb) {
  cp.exec('boot2docker ssh "sudo mkdir -p ' + process.cwd() + ' && sudo chown docker ' + process.cwd() + '"', function() {
    cb();
  });
}

async.series([
  mkdirp,
  getdockerip,
  install_rsync,
  rsync
], function (err) {
  var watcher = chokidar.watch(process.cwd(), { persistent: true });
  watcher.on('change', function () {
    rsync(function (cb) {
      console.log('refreshing');
    });
  });
});
