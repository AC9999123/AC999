Push the project to GitHub safely. Covers: secret scanning, README sync, repo About update, and git push.

Use $ARGUMENTS as the commit message if provided. If not provided, ask the user: "What's your commit message?"

---

## Steps (run in order)

### 1 — Reload PATH
Before running any git command, reload the system PATH so git is found on Windows:
```
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

### 2 — Secret scan (MUST pass before anything is staged)
Search all tracked and untracked non-binary files for secret patterns. Abort with a clear warning if any are found. Do NOT proceed to git add if secrets are detected.

Patterns to flag:
- Tokens/keys: `ghp_`, `github_pat_`, `ghs_`, `sk-`, `xoxb-`, `xoxp-`, `AIza`, `AKIA`
- Assignments: `api_key\s*=`, `api_secret\s*=`, `access_token\s*=`, `secret_key\s*=`, `password\s*=`, `private_key\s*=`  
- Raw secrets: strings matching `[A-Za-z0-9+/]{40,}` inside `.env` files
- Files to always block: `.env`, `.env.local`, `*.pem`, `*.key`, `id_rsa*`

If secrets are found: list each file and matched line, then stop. Tell the user what to fix before re-running the command.

If clean: confirm "No secrets detected — safe to push."

### 3 — Update README.md
Read the current project files and rewrite README.md to reflect the actual current state of the project. The README must include:
- Project name and one-line description
- Live site URL (read from the GitHub Pages URL already stored in the repo, or the `homepage` field)
- Features list (derived from what actually exists in index.html / script.js)
- Tech stack table
- File structure (only top-level meaningful files)
- Running locally instructions
- Form setup section (if a FormSubmit form exists in index.html)
- Deployment section
- Color palette (read --color-* variables from styles.css :root)
- MIT license line

Do not invent content. Only describe what is actually in the codebase.

### 4 — Stage all files
```
git add .
```

### 5 — Commit
```
git commit -m "<message from $ARGUMENTS or user input>"
```

### 6 — Push
```
git push
```

### 7 — Update GitHub repo About (description + homepage)
Use the Windows Credential Manager to retrieve the stored GitHub token, then call the GitHub API to update the repo's description and homepage URL.

Read the remote URL from git to derive owner/repo:
```
git remote get-url origin
```

Token retrieval (PowerShell):
```powershell
$source = @'
using System; using System.Runtime.InteropServices;
public class WinCredCmd {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public struct CREDENTIAL { public uint Flags; public uint Type; public string TargetName; public string Comment; public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist; public uint AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
    [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)] public static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);
    [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr buffer);
    public static string GetPassword(string target) { IntPtr ptr; if (!CredRead(target, 1, 0, out ptr)) return null; var cred = Marshal.PtrToStructure<CREDENTIAL>(ptr); var pass = Marshal.PtrToStringUni(cred.CredentialBlob, (int)cred.CredentialBlobSize/2); CredFree(ptr); return pass; }
}
'@
Add-Type -TypeDefinition $source -Language CSharp -ErrorAction SilentlyContinue
$token = [WinCredCmd]::GetPassword("git:https://github.com")
```

Then PATCH the repo:
- `description`: a concise one-line description derived from the README
- `homepage`: the GitHub Pages URL (`https://<owner>.github.io/<repo>/`)

```powershell
$h = @{ Authorization = "token $token"; Accept = "application/vnd.github+json" }
$body = @{ description = "<description>"; homepage = "<homepage url>" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.github.com/repos/<owner>/<repo>" -Method PATCH -Headers $h -Body $body -ContentType "application/json"
```

### 8 — Report
Print a summary:
- Files changed (from git output)
- Commit hash and message
- Branch pushed to
- Repo About updated: description + homepage
- Confirm: "No secrets were pushed."
