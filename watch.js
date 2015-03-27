var async = require('async');
var chokidar = require('chokidar');
var osenv = require('osenv');
var cp = require('child_process');
var nconf = require('nconf');
var docker_ip;

nconf.env().argv().file('bdsync.json');

nconf.defaults({
  'targetPath': process.cwd(),
  'ignoreFile' : '.gitignore'
});

function getdockerip (cb) {
  cp.exec('boot2docker ip 2>/dev/null', function (err, stdout) {
    if (err) {
      return cb(err);
    }
    docker_ip = stdout.trim();
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
    '--rsh=ssh -i ' + osenv.home() + '/.ssh/id_boot2docker -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no',
    '--delete',
     process.cwd() + '/',
     '--exclude-from',
     nconf.get('ignoreFile'),
     'docker@' + docker_ip + ':' + nconf.get('targetPath')
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
  cp.exec('boot2docker ssh "sudo mkdir -p ' + nconf.get('targetPath') + ' && sudo chown -R docker:staff ' + nconf.get('targetPath') + '"', function() {
    cb();
  });
}

console.log('Sync with ' + nconf.get('targetPath') + ", exclude from " + nconf.get('ignoreFile'));

async.series([
  mkdirp,
  getdockerip,
  install_rsync,
  rsync
], function (err) {
  var watcher = chokidar.watch(process.cwd(), { persistent: true, ignoreInitial: true });
  watcher.on('all', function () {
    rsync(function (cb) {
      console.log('refreshing');
    });
  });
});
