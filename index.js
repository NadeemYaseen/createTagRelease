const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
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

  // Create a release
  const r = await octokit.repos.createRelease({
    owner: owner,            // Use input or fallback to the current repository owner
    repo: repo,              // Use input or fallback to the current repository name
    tag_name: tagName,
    target_commitish: commit,
    name: releaseName,
    body,
    draft,
    prerelease
  });

  // Set outputs for the workflow
  core.setOutput('id', r.data.id.toString());
  core.setOutput('html_url', r.data.html_url);
  core.setOutput('upload_url', r.data.upload_url);
}

// Run the main function, and handle errors
main().catch(function(error) {
  core.setFailed(error.message);
});
