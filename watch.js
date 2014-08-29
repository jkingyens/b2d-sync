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

function rsync (cb) { 
  var child = cp.spawn('rsync', [ 
    '-av',
     process.cwd() + '/',
     'docker@' + docker_ip + ':' + process.cwd()
  ]);
  child.on('exit', cb);
}

function mkdirp (cb) { 
  cp.exec('boot2docker ssh "sudo mkdir -p ' + process.cwd() + ' && sudo chown docker ' + process.cwd() + '"', cb);
}

async.series([ 
  mkdirp,
  getdockerip,
  rsync
], function (err) { 
  var watcher = chokidar.watch(process.cwd(), { persistent: true });
  watcher.on('change', function () { 
    rsync(function (cb) { 
      console.log('refreshing');
    });
  });
});
