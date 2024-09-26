# GitHub Action &ndash; Tag and Release

Automatically create tags and corresponding releases.

## Usage

This action is meant to create a tag and a corresponding release on the given repository (default is current), under the assumption that you can derive
the tag name automatically.

The only mandatory input parameter is the tag name.

    on: push
    jobs:
      release:
        runs-on: ubuntu-latest
        steps:
          - uses: NadeemYaseen/createTagRelease@main
            with:
              tag_name: ${{ ... }}
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

### Inputs

* `repo`: name of repo on which tag and release will be created, default to current repository 
* `owner`:  name of owner on which tag and release will be created, default to current owner
* `tag_name`: (required) the name of the tag to be created, Required. 
* `token`: a token with write permission to create tag and release on repo other than current, default is GITHUB Token
* `release_name`: the name of the new release; if omitted, defaults to `tag_name`
* `commit`: the commit to which the new tag should point, defaults to `${{ GITHUB_SHA }}`
* `body`: optional text of the release body
* `draft`: set to `true` to create an unpublished (draft) release; defaults to `false`
* `prerelease`: whether the release should be marked as a prerelease.

### Outputs

* `id`: the ID of the release
* `html_url`: the human-readable web-page of the release, e.g. `https://github.com/avakar/tag-and-release/releases/v1.0.0`
* `upload_url`: the URL you can give to `@actions/upload-release-asset`
