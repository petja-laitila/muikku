#!/bin/bash
eval `ssh-agent -s`
ssh-add - <<< "${GA_SSH_KEY}"
git config --global user.name "Github Actions Bot"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
# Use default merge strategy.
git config --global pull.rebase false
# Push one branch at a time.
git config --global push.default simple
git pull
git checkout devel
git reset --hard
git pull
echo Replacing SNAPSHOT versions to releases
mvn org.codehaus.mojo:versions-maven-plugin:2.20.1:use-latest-snapshots -Dincludes=fi.otavanopisto.pyramus:*
#mvn versions:force-releases -Dincludes=fi.otavanopisto.pyramus:*
git add .
git commit -m "Updated dependency versions"
echo Replacing releases to SNAPSHOTS
mvn org.codehaus.mojo:versions-maven-plugin:2.20.1:use-latest-snapshots -Dincludes=fi.otavanopisto.pyramus:*
#mvn versions:use-latest-snapshots -Dincludes=fi.otavanopisto.pyramus:*
git add .
git commit -m "Updated latest snapshot releases"
git pull
git push
