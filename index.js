const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function main() {
  // Get the inputs for commit, tag, release name, body, draft, and prerelease.
  const commit = core.getInput('commit') || context.sha;
  const tagName = core.getInput('tag_name', { required: true });
  const releaseName = core.getInput('release_name') || tagName;
  const body = core.getInput('body');
  const draft = core.getInput('draft') === 'true';
  const prerelease = core.getInput('prerelease') === 'true';

  // Get optional inputs for owner and repo, fall back to context if not provided
  const owner = core.getInput('owner') || context.repo.owner;
  const repo = core.getInput('repo') || context.repo.repo;

  // Create a new GitHub instance authenticated with the token
  const github = new GitHub(process.env.GITHUB_TOKEN);

  // Create a release
  const r = await github.repos.createRelease({
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
