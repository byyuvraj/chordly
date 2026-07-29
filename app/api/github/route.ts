import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(request: Request) {
  try {
    const { id, title, artist, content } = await request.json();

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN is not configured in environment variables.' }, { status: 500 });
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = 'byyuvraj';
    const repo = 'chordly';
    const branch = 'main';

    // 1. Get the latest commit SHA of the branch
    const refData = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const latestCommitSha = refData.data.object.sha;

    // 2. Get the tree SHA
    const commitData = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });
    const baseTreeSha = commitData.data.tree.sha;

    // 3. Create blob for the song file
    const songPath = `public/songs/${id}.txt`;
    const songBlob = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: content,
      encoding: 'utf-8'
    });

    // 4. Fetch the current index.json to update it
    let indexJson = [];
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'public/songs/index.json',
        ref: branch
      });
      if ('content' in fileData && !Array.isArray(fileData)) {
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        indexJson = JSON.parse(decodedContent);
      }
    } catch (e) {
      console.warn("Could not fetch index.json, creating a new one.");
    }

    // Add or update the song in index.json
    const existingIndex = indexJson.findIndex((s: any) => s.id === id);
    if (existingIndex > -1) {
      indexJson[existingIndex] = { id, title, artist, file: `${id}.txt` };
    } else {
      indexJson.push({ id, title, artist, file: `${id}.txt` });
    }

    // 5. Create blob for index.json
    const indexBlob = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: JSON.stringify(indexJson, null, 2),
      encoding: 'utf-8'
    });

    // 6. Create a new tree
    const newTree = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: songPath,
          mode: '100644',
          type: 'blob',
          sha: songBlob.data.sha
        },
        {
          path: 'public/songs/index.json',
          mode: '100644',
          type: 'blob',
          sha: indexBlob.data.sha
        }
      ]
    });

    // 7. Create commit
    const newCommit = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Publish song: ${title} via Admin Panel`,
      tree: newTree.data.sha,
      parents: [latestCommitSha]
    });

    // 8. Update ref
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.data.sha
    });

    return NextResponse.json({ success: true, commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.data.sha}` });
  } catch (err: any) {
    console.error('GitHub API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN is not configured in environment variables.' }, { status: 500 });
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = 'byyuvraj';
    const repo = 'chordly';
    const branch = 'main';

    // 1. Get the latest commit SHA of the branch
    const refData = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const latestCommitSha = refData.data.object.sha;

    // 2. Get the tree SHA
    const commitData = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });
    const baseTreeSha = commitData.data.tree.sha;

    // 3. Fetch the current index.json to update it
    let indexJson: any[] = [];
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'public/songs/index.json',
        ref: branch
      });
      if ('content' in fileData && !Array.isArray(fileData)) {
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        indexJson = JSON.parse(decodedContent);
      }
    } catch (e) {
      return NextResponse.json({ error: "Could not fetch index.json" }, { status: 500 });
    }

    // 4. Update index.json by filtering out the deleted song
    indexJson = indexJson.filter((s: any) => s.id !== id);

    // 5. Create blob for the updated index.json
    const indexBlob = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: JSON.stringify(indexJson, null, 2),
      encoding: 'utf-8'
    });

    // 6. Create a new tree (set sha: null to delete the song text file)
    const newTree = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: `public/songs/${id}.txt`,
          mode: '100644',
          type: 'blob',
          sha: null
        },
        {
          path: 'public/songs/index.json',
          mode: '100644',
          type: 'blob',
          sha: indexBlob.data.sha
        }
      ]
    });

    // 7. Create commit
    const newCommit = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Delete song: ${id} via Admin Panel`,
      tree: newTree.data.sha,
      parents: [latestCommitSha]
    });

    // 8. Update ref
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.data.sha
    });

    return NextResponse.json({ success: true, commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.data.sha}` });
  } catch (err: any) {
    console.error('GitHub API DELETE Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

