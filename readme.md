## b2d-sync

This will keep a given folder in sync with a folder inside boot2docker VM. Per default the current folder will be synced to boot2docker VM (see configuration).

### install:

    npm install -g b2d-sync

### usage:

    cd <working dir>
    bdsync

### configuration:

The following config options can be set either as environment variable, as command line argument or in the config file bdsync.json:

    targetPath: Path in the boot2docker VM (will be automatically created)
    ignoreFile: File from which rsync ignores should be taken (per default .gitignore)

Example for command line:

    bdsync --targetPath=/mnt/test

Example for config file bdsync.json:

    {"targetPath" : "/mnt/test"}

