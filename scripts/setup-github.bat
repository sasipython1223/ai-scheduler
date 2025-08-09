@echo off
echo ===============================================
echo  AI Scheduler - GitHub Issues Setup
echo ===============================================
echo.

echo [1/3] Checking GitHub CLI authentication...
gh auth status
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Please authenticate with GitHub first:
    echo   gh auth login
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Running Node.js script to create issues...
node scripts\create-issues.js

echo.
echo [3/3] Opening GitHub repository in browser...
gh repo view --web

echo.
echo ✅ Setup complete! Check your GitHub repository for:
echo   • New project board: "AI Scheduler Development Timeline"
echo   • Module milestones (5-8)
echo   • Level 4 granular issues ready for development
echo.
pause
