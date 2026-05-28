Stage all changes, commit with the provided message, and push to GitHub.

Steps:
1. Run `git add .` to stage every changed file
2. If $ARGUMENTS is provided, use it as the commit message. If no argument was given, ask the user: "What's your commit message?"
3. Run `git commit -m "<message>"`
4. Run `git push`
5. Report the final git output — confirm how many files changed and the branch that was pushed to.

Always reload the system PATH before running git so the command is found:
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
