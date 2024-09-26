const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  try {
    // Get the inputs for commit, tag, release name, body, draft, and prerelease.
    const commit = core.getInput('commit') || github.context.sha;
    const tagName = core.getInput('tag_name', { required: true });
    const releaseName = core.getInput('release_name') || tagName;
    const body = core.getInput('body');
    const draft = core.getInput('draft') === 'true';
    const prerelease = core.getInput('prerelease') === 'true';

    // Get optional inputs for owner and repo, fall back to context if not provided
    const owner = core.getInput('owner') || github.context.repo.owner;
    const repo = core.getInput('repo') || github.context.repo.repo;

    // Get the token input or fallback to the GITHUB_TOKEN environment variable
    const token = core.getInput('token') || process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GitHub token is required either as input or in the GITHUB_TOKEN environment variable.");
    }

    // Use getOctokit to authenticate the GitHub API client
    const octokit = github.getOctokit(token);

    // Check if a release with the same tag already exists
    let release;
    try {
      core.info(`Checking if release with tag ${tagName} already exists...`);
      release = await octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag: tagName,
      });
      core.info(`Release with tag ${tagName} already exists. Skipping creation.`);
    } catch (error) {
      if (error.status === 404) {
        core.info(`No existing release with tag ${tagName}. Proceeding to create new release.`);
      } else {
        throw error;
      }
    }

    // If release doesn't exist, create a new release
    if (!release) {
      core.info(`Creating new release for tag: ${tagName}`);
      release = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        target_commitish: commit,
        name: releaseName,
        body,
        draft,
        prerelease,
      });

      core.info(`Release created successfully: ${release.data.html_url}`);
    }

    // Set outputs for the workflow
    core.setOutput('id', release.data.id.toString());
    core.setOutput('html_url', release.data.html_url);
    core.setOutput('upload_url', release.data.upload_url);
    core.setOutput('tag_name', release.data.tag_name);
    core.setOutput('release_name', release.data.name);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

// Run the main function, and handle errors
main().catch(function (error) {
  core.setFailed(error.message);
});
