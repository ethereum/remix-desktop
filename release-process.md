Step for making a new release:

 - from https://github.com/ethereum/remix-desktop/releases, click on `Draft a new release`.
 - the `Tag version` should be the version number (e.g `v1.0.3-beta.6` or `v1.0.4`).
 - the `title` can be anything (set it the same as `Tag version` if no other obvious title can be found).
 - the `description` can be anything.
 - click on `Save draft`.
 - create a pull request which update the `package.json` and `package-lock.json` (if exist) to the same version number.
 (note that this time it does not contain the prefix `v`).
 - when the pull request is merged, circle-ci build runs and populate the drafted release with the binaries.
 - ... push PRs or commits until the binaries are ok for a release ...
 - when the binaries are stable enough for being released, go to the release page and publish the release.
 
 Note that when Remix IDE is released it is not necessary to make a new release of remix-desktop. 
 Remix Desktop always verify and run the latest Remix IDE.
 
