$ErrorActionPreference = "Stop"
$baseFolder = "c:\Users\saisu\OneDrive\Pictures\Documents\Projects\SecureVault Password Manager"
$backendDir = "$baseFolder\securevault-backend"
$baseUrl = "http://localhost:9090/api"
$pass = 0
$fail = 0

# Helper: check if a string contains a substring
function Contains($haystack, $needle) {
    return $haystack -and $haystack.Contains($needle)
}

# ===== 1. Kill existing =====
Write-Host "[KILL] Stopping processes on port 9090..."
$pids = (netstat -ano | Select-String ':9090.*LISTENING' | ForEach-Object {
    ($_ -replace '\s+', ' ').Split(' ')[-1]
} | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique)
foreach ($processId in $pids) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "  Killed PID $processId"
}
Start-Sleep 2

# ===== 2. Build =====
Write-Host ""
Write-Host "[BUILD] Running mvn clean package..."
Push-Location $backendDir
$buildOutput = & mvn clean package -DskipTests -q 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED: $buildOutput"
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "  BUILD SUCCESS"

# ===== 3. Start =====
Write-Host ""
Write-Host "[START] Starting backend..."
$proc = Start-Process -FilePath "java" -ArgumentList "-jar", "target\securevault-backend-1.0.0.jar" -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru
Write-Host "  Started PID: $($proc.Id)"
Start-Sleep 10

# ===== 4. Test =====
$ts = Get-Date -Format "HHmmss"
$email = "autotest${ts}@test.com"
$pin = "123456"

Write-Host ""
Write-Host "============================================"
Write-Host "SecureVault Backend Fix Verification"
Write-Host "User: $email"
Write-Host "============================================"

# --- Register ---
Write-Host "[TEST] Register"
$body = @{email=$email; password="Test1234!"; name="AutoTest"; pin=$pin; phoneNumber="1234567890"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $body
    $token = $resp.accessToken
    Write-Host "  PASS"
    $pass++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
    goto cleanup
}

# --- Login ---
Write-Host "[TEST] Login"
$body = @{email=$email; password="Test1234!"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $body
    $token = $resp.accessToken
    Write-Host "  PASS"
    $pass++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
    goto cleanup
}

# --- TEST 4: SIGN_IN audit ---
Write-Host "[TEST-4] SIGN_IN in audit log"
try {
    $audit = Invoke-RestMethod -Uri "$baseUrl/audit" -Method Get -Headers @{Authorization="Bearer $token"}
    if (($audit | Where-Object { $_.action -eq "SIGN_IN" }).Count -gt 0) {
        Write-Host "  PASS - SIGN_IN found"
        $pass++
    } else {
        Write-Host "  FAIL - SIGN_IN not found"
        $fail++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
}

# --- Create Private ---
Write-Host "[SETUP] Create Private item"
$body = @{title="MyBank"; username="user1"; password="secret123"; accessLevel="PRIVATE"; itemPin="1111"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $itemId = $resp.id
    Write-Host "  PASS (id=$itemId)"
    $pass++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
    goto cleanup
}

# --- TEST 1: Edit without password ---
Write-Host "[TEST-1] Edit without password (title only)"
$body = @{title="MyBank Updated"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault/$itemId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.title -eq "MyBank Updated") {
        Write-Host "  PASS - Title updated to '$($resp.title)'"
        $pass++
    } else {
        Write-Host "  FAIL - Title is '$($resp.title)'"
        $fail++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
}

# --- Create Shared ---
Write-Host "[SETUP] Create Shared item"
$body = @{title="SharedPass"; username="shareduser"; password="shared123"; accessLevel="SHARED"; verificationPin=$pin} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $sharedId = $resp.id
    Write-Host "  PASS (id=$sharedId)"
    $pass++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
    goto cleanup
}

# --- TEST 3: Shared -> Private ---
Write-Host "[TEST-3] Shared -> Private with new PIN"
$body = @{title="NowPrivate"; accessLevel="PRIVATE"; itemPin="2222"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault/$sharedId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.accessLevel -eq "PRIVATE") {
        Write-Host "  PASS - Switched to PRIVATE"
        $pass++
    } else {
        Write-Host "  FAIL - accessLevel is '$($resp.accessLevel)'"
        $fail++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
}

# --- Create Private for switch ---
Write-Host "[SETUP] Create Private for switch"
$body = @{title="SwitchMe"; username="switch"; password="swsecret"; accessLevel="PRIVATE"; itemPin="3333"} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault" -Method Post -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    $privId = $resp.id
    Write-Host "  PASS (id=$privId)"
    $pass++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
    goto cleanup
}

# --- TEST 2: Private -> Shared ---
Write-Host "[TEST-2] Private -> Shared with account PIN"
$body = @{title="NowShared"; accessLevel="SHARED"; verificationPin=$pin} | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Uri "$baseUrl/vault/$privId" -Method Put -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
    if ($resp.accessLevel -eq "SHARED") {
        Write-Host "  PASS - Switched to SHARED"
        $pass++
    } else {
        Write-Host "  FAIL - accessLevel is '$($resp.accessLevel)'"
        $fail++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
}

# --- TEST 5: SIGN_OUT ---
Write-Host "[TEST] Logout + re-login"
try { Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method Post -Headers @{Authorization="Bearer $token"} | Out-Null } catch { }
$body = @{email=$email; password="Test1234!"} | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $body
$token = $resp.accessToken

Write-Host "[TEST-5] SIGN_OUT in audit log"
try {
    $audit = Invoke-RestMethod -Uri "$baseUrl/audit" -Method Get -Headers @{Authorization="Bearer $token"}
    if (($audit | Where-Object { $_.action -eq "SIGN_OUT" }).Count -gt 0) {
        Write-Host "  PASS - SIGN_OUT found"
        $pass++
    } else {
        Write-Host "  FAIL - SIGN_OUT not found"
        $fail++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)"
    $fail++
}

:cleanup
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================"
Write-Host "Results: $pass passed, $fail failed"
Write-Host "============================================"
