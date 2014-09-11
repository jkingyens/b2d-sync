## b2d-sync

This will keep a given folder in sync with `/data` inside boot2docker VM.  It respects
basic .gitignore filtering using `rsync --exclude-from=.gitignore`.

### install:

    npm install -g b2d-sync

### usage:

    cd <working dir>
    bdsync
