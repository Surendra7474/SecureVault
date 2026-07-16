$ErrorActionPreference = "Stop"
$baseFolder = "c:\Users\saisu\OneDrive\Pictures\Documents\Projects\SecureVault Password Manager"
$backendDir = "$baseFolder\securevault-backend"

# 1. Kill anything on 9090
Write-Host "[KILL] Stopping processes on port 9090..."
$pids = netstat -ano | Select-String ':9090.*LISTENING' | ForEach-Object {
    $line = $_ -replace '\s+', ' '
    $parts = $line.Split(' ')
    $parts[-1]
} | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique
foreach ($pId in $pids) {
    try {
        Stop-Process -Id $pId -Force -ErrorAction Stop
        Write-Host "  Killed PID $pId"
    } catch {
        Write-Host "  Could not kill PID $pId"
    }
}
Start-Sleep 2

# 2. Build
Write-Host ""
Write-Host "[BUILD] Running mvn clean package..."
$buildResult = & mvn clean package -DskipTests -q 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED: $buildResult"
    exit 1
}
Write-Host "  BUILD SUCCESS"

# 3. Start
Write-Host ""
Write-Host "[START] Starting backend..."
$p = Start-Process -FilePath "java" -ArgumentList "-jar","target\securevault-backend-1.0.0.jar" -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru
Write-Host "  Started PID: $($p.Id)"
Start-Sleep 8

# 4. Test
$base = "http://localhost:9090/api"
$ts = Get-Date -Format "HHmmss"
$email = "test${ts}@test.com"
$pin = "123456"
$pass = 0
$fail = 0

Write-Host ""
Write-Host "============================================"
Write-Host "SecureVault Backend Fix Verification"
Write-Host "============================================"

# Register
Write-Host ""
Write-Host "[TEST] Register: $email"
$body = @{email=$email; password="Test1234!"; name="TestUser"; pin=$pin; phoneNumber="1234567890"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $body
    $token = $resp.accessToken
    Write-Host "  PASS - Registered"
    $pass++
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++; goto cleanup }

# Login
Write-Host "[TEST] Login"
$body = @{email=$email; password="Test1234!"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $body
    $token = $resp.accessToken
    Write-Host "  PASS - Logged in"
    $pass++
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++; goto cleanup }

# Test 4: SIGN_IN audit
Write-Host "[TEST-4] SIGN_IN in audit log"
try {
    $a = Invoke-RestMethod -Uri "$base/audit" -Method Get -Headers @{Authorization="Bearer $token"}
    if (($a | Where-Object { $_.action -eq "SIGN_IN" }).Count -gt 0) {
        Write-Host "  PASS - SIGN_IN found"
        $pass++
    } else { Write-Host "  FAIL - SIGN_IN not found"; $fail++ }
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++ }

# Create Private
Write-Host "[SETUP] Create Private item"
$body = @{title="MyBank"; username="user1"; password="secret123"; accessLevel="PRIVATE"; itemPin="1111"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $itemId = $resp.id
    Write-Host "  PASS - Created (id=$itemId)"
    $pass++
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++; goto cleanup }

# Test 1: Edit without password
Write-Host "[TEST-1] Edit without password (title only)"
$body = @{title="MyBank Updated"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault/$itemId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.title -eq "MyBank Updated") {
        Write-Host "  PASS - Title updated"
        $pass++
    } else { Write-Host "  FAIL - Title: $($resp.title)"; $fail++ }
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++ }

# Create Shared
Write-Host "[SETUP] Create Shared item"
$body = @{title="SharedPass"; username="shareduser"; password="shared123"; accessLevel="SHARED"; verificationPin=$pin} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $sharedId = $resp.id
    Write-Host "  PASS - Created (id=$sharedId)"
    $pass++
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++; goto cleanup }

# Test 3: Shared -> Private
Write-Host "[TEST-3] Shared -> Private with new PIN"
$body = @{title="NowPrivate"; accessLevel="PRIVATE"; itemPin="2222"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault/$sharedId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.accessLevel -eq "PRIVATE") {
        Write-Host "  PASS - Switched to PRIVATE"
        $pass++
    } else { Write-Host "  FAIL - accessLevel: $($resp.accessLevel)"; $fail++ }
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++ }

# Create Private for switch
Write-Host "[SETUP] Create Private for switch"
$body = @{title="SwitchMe"; username="switch"; password="swsecret"; accessLevel="PRIVATE"; itemPin="3333"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $privId = $resp.id
    Write-Host "  PASS - Created (id=$privId)"
    $pass++
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++; goto cleanup }

# Test 2: Private -> Shared
Write-Host "[TEST-2] Private -> Shared with account PIN"
$body = @{title="NowShared"; accessLevel="SHARED"; verificationPin=$pin} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$base/vault/$privId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.accessLevel -eq "SHARED") {
        Write-Host "  PASS - Switched to SHARED"
        $pass++
    } else { Write-Host "  FAIL - accessLevel: $($resp.accessLevel)"; $fail++ }
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++ }

# Test 5: SIGN_OUT
Write-Host "[TEST] Logout + re-login"
try { Invoke-RestMethod -Uri "$base/auth/logout" -Method Post -Headers @{Authorization="Bearer $token"} | Out-Null } catch { }
$body = @{email=$email; password="Test1234!"} | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $body
$token = $resp.accessToken

Write-Host "[TEST-5] SIGN_OUT in audit log"
try {
    $a = Invoke-RestMethod -Uri "$base/audit" -Method Get -Headers @{Authorization="Bearer $token"}
    if (($a | Where-Object { $_.action -eq "SIGN_OUT" }).Count -gt 0) {
        Write-Host "  PASS - SIGN_OUT found"
        $pass++
    } else { Write-Host "  FAIL - SIGN_OUT not found"; $fail++ }
} catch { Write-Host "  FAIL: $($_.Exception.Message)"; $fail++ }

:cleanup
Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================"
Write-Host "Results: $pass passed, $fail failed"
Write-Host "============================================"
