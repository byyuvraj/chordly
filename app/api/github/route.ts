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

    // 1. Parallelize initial data fetching: get ref and get current index.json
    const [refData, indexContentRes] = await Promise.all([
      octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` }),
      octokit.rest.repos.getContent({ owner, repo, path: 'public/songs/index.json', ref: branch }).catch(() => null)
    ]);
    
    const latestCommitSha = refData.data.object.sha;

    // 2. Parse index.json
    let indexJson: any[] = [];
    if (indexContentRes && indexContentRes.data && 'content' in indexContentRes.data && !Array.isArray(indexContentRes.data)) {
      try {
        const decodedContent = Buffer.from(indexContentRes.data.content, 'base64').toString('utf-8');
        indexJson = JSON.parse(decodedContent);
      } catch (e) {
        console.warn("Could not parse index.json");
      }
    }

    // Add or update the song in index.json
    const existingIndex = indexJson.findIndex((s: any) => s.id === id);
    if (existingIndex > -1) {
      indexJson[existingIndex] = { id, title, artist, file: `${id}.txt` };
    } else {
      indexJson.push({ id, title, artist, file: `${id}.txt` });
    }

    // 3. Parallelize getting base tree and creating blobs
    const [commitData, songBlob, indexBlob] = await Promise.all([
      octokit.rest.git.getCommit({ owner, repo, commit_sha: latestCommitSha }),
      octokit.rest.git.createBlob({ owner, repo, content: content, encoding: 'utf-8' }),
      octokit.rest.git.createBlob({ owner, repo, content: JSON.stringify(indexJson, null, 2), encoding: 'utf-8' })
    ]);
    const baseTreeSha = commitData.data.tree.sha;

    // 4. Create a new tree
    const newTree = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: `public/songs/${id}.txt`,
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

    // 5. Create commit
    const newCommit = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Publish song: ${title} via Admin Panel`,
      tree: newTree.data.sha,
      parents: [latestCommitSha]
    });

    // 6. Update ref
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

    // 1. Parallelize initial data fetching: get ref and get current index.json
    const [refData, indexContentRes] = await Promise.all([
      octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` }),
      octokit.rest.repos.getContent({ owner, repo, path: 'public/songs/index.json', ref: branch }).catch(() => null)
    ]);
    
    const latestCommitSha = refData.data.object.sha;

    // 2. Parse index.json
    let indexJson: any[] = [];
    if (indexContentRes && indexContentRes.data && 'content' in indexContentRes.data && !Array.isArray(indexContentRes.data)) {
      try {
        const decodedContent = Buffer.from(indexContentRes.data.content, 'base64').toString('utf-8');
        indexJson = JSON.parse(decodedContent);
      } catch (e) {
        console.warn("Could not parse index.json");
      }
    }

    // Update index.json by filtering out the deleted song
    indexJson = indexJson.filter((s: any) => s.id !== id);

    // 3. Parallelize getting base tree and creating index blob
    const [commitData, indexBlob] = await Promise.all([
      octokit.rest.git.getCommit({ owner, repo, commit_sha: latestCommitSha }),
      octokit.rest.git.createBlob({ owner, repo, content: JSON.stringify(indexJson, null, 2), encoding: 'utf-8' })
    ]);
    const baseTreeSha = commitData.data.tree.sha;

    // 4. Create a new tree (set sha: null to delete the song text file)
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

    // 5. Create commit
    const newCommit = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Delete song: ${id} via Admin Panel`,
      tree: newTree.data.sha,
      parents: [latestCommitSha]
    });

    // 6. Update ref
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
