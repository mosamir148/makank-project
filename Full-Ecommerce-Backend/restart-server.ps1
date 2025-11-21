# PowerShell script to restart the backend server
Write-Host "Stopping Node.js processes on port 5000..." -ForegroundColor Yellow

# Find and kill processes using port 5000
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process $pid" -ForegroundColor Green
    }
} else {
    Write-Host "No process found on port 5000" -ForegroundColor Yellow
}

# Wait a moment
Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node index.js"

Write-Host "Server restart initiated!" -ForegroundColor Green
Write-Host "Check the new PowerShell window for server output." -ForegroundColor Cyan

