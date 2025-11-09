#!/usr/bin/env node
/* Minimal Copilot PR reviewer script
   - Uses Node 18+ built-in fetch
   - No external deps required
*/
import { execSync } from 'child_process';

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO;
  const prNumber = process.env.PR_NUMBER;
  if (!token || !repo || !prNumber) {
    console.error('Missing env vars: GITHUB_TOKEN, REPO, PR_NUMBER');
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');
  const apiBase = `https://api.github.com/repos/${owner}/${repoName}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'copilot-reviewer-script'
  };

  // 1) Run checks
  let lintPass = false;
  let typecheckPass = false;
  let buildPass = false;

  try { execSync('npm run lint', { stdio: 'inherit' }); lintPass = true; } catch (e) { /* fail */ }
  try { execSync('npm run typecheck', { stdio: 'inherit' }); typecheckPass = true; } catch (e) { /* fail */ }
  try { execSync('npm run build --silent', { stdio: 'inherit' }); buildPass = true; } catch (e) { /* fail */ }

  // 2) Heuristic scoring
  const scores = {
    code_quality: lintPass ? 85 : 40,
    performance: buildPass ? 75 : 50,
    security: 80,
    ssr: typecheckPass ? 80 : 45,
  };

  const pass = Object.values(scores).every(s => s >= 70);
  const summary_prefix = pass ? '✅ PASS' : '❌ NEED FIX';

  // 3) Prepare fixes
  const fixes = [];
  if (!lintPass) fixes.push({ path: 'run lint', lines: 'N/A', suggestion: 'Run `npm run lint` and fix ESLint issues (see eslint.config.cjs).' });
  if (!typecheckPass) fixes.push({ path: 'run typecheck', lines: 'N/A', suggestion: 'Run `npm run typecheck` and fix TypeScript errors.' });
  if (!buildPass) fixes.push({ path: 'run build', lines: 'N/A', suggestion: 'Run `npm run build` to ensure build succeeds.' });

  // 4) Compose comment
  const humanSummary = `Summary: [${summary_prefix}] — Code Quality ${scores.code_quality}, Performance ${scores.performance}, Security ${scores.security}, SSR ${scores.ssr}\n\nTop fixes:\n` +
    (fixes.length ? fixes.slice(0,3).map((f,i) => `${i+1}. ${f.suggestion} (${f.path})`).join('\n') : 'None');

  const machineJson = { summary_prefix, scores, fixes };

  const commentBody = `${humanSummary}\n\n\
\`\`\`json\n${JSON.stringify(machineJson, null, 2)}\n\`\`\`\n`;

  // Post comment
  await fetch(`${apiBase}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body: commentBody })
  });

  // Get PR details
  const prRes = await fetch(`${apiBase}/pulls/${prNumber}`, { headers });
  const pr = await prRes.json();

  async function tryPatchPull(body) {
    const res = await fetch(`${apiBase}/pulls/${prNumber}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`PATCH pull failed: ${res.status}`);
    return await res.json();
  }

  if (!pass) {
    // prefix title if needed
    let title = pr.title || '';
    if (!title.startsWith('[❌ NEED FIX]') && !title.startsWith('[✅ PASS]')) {
      try { await tryPatchPull({ title: `[❌ NEED FIX] ${title}` }); } catch (e) { console.warn('Unable to update title:', e.message); }
    }

    // convert to draft
    if (!pr.draft) {
      try {
        await tryPatchPull({ draft: true });
      } catch (e) {
        // fallback: add label and post maintainer instruction
        try {
          await fetch(`${apiBase}/issues/${prNumber}/labels`, { method: 'POST', headers, body: JSON.stringify({ labels: ['needs-fix'] }) });
        } catch (lblErr) { /* ignore */ }
        await fetch(`${apiBase}/issues/${prNumber}/comments`, {
          method: 'POST', headers, body: JSON.stringify({ body: "Maintainer action required: convert PR to draft and add 'needs-fix' label to block merge (action lacked permission)." })
        });
      }
    } else {
      try { await fetch(`${apiBase}/issues/${prNumber}/labels`, { method: 'POST', headers, body: JSON.stringify({ labels: ['needs-fix'] }) }); } catch (e) { /* ignore */ }
    }

    // submit request changes review
    try {
      await fetch(`${apiBase}/pulls/${prNumber}/reviews`, { method: 'POST', headers, body: JSON.stringify({ body: 'Automated reviewer: changes required as described in the top-level comment.', event: 'REQUEST_CHANGES' }) });
    } catch (e) { /* ignore */ }

  } else {
    // PASS path: ensure title prefix and remove needs-fix label
    let title = pr.title || '';
    if (!title.startsWith('[✅ PASS]')) {
      const newTitle = title.replace(/^\[❌ NEED FIX\]\s*/,'');
      try { await tryPatchPull({ title: `[✅ PASS] ${newTitle}` }); } catch (e) { console.warn('Unable to update title:', e.message); }
    }
    // try remove label
    try {
      await fetch(`${apiBase}/issues/${prNumber}/labels/needs-fix`, { method: 'DELETE', headers });
    } catch (e) { /* ignore */ }
  }

  console.log(`${summary_prefix} posted for PR #${prNumber}`);
}

run().catch(e => { console.error(e); process.exit(1); });
