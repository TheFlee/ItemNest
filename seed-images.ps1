$base = "http://localhost:8080"

$loginBody = @{ email = "admin@local.dev"; password = "Admin@123456" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in." -ForegroundColor Green

# Fetch all posts (up to 50)
$page = Invoke-RestMethod -Uri ($base + "/api/itemposts?PageSize=50&Page=1") -Headers $headers
$posts = $page.items
Write-Host "Found $($posts.Count) posts." -ForegroundColor Yellow

# Map title keywords to loremflickr tags
function Get-Tags($title) {
    if ($title -match "wallet.*black|black.*wallet") { return "wallet,leather,black" }
    if ($title -match "iPhone")                      { return "iphone,smartphone" }
    if ($title -match "car key|Toyota")              { return "car,keys,keychain" }
    if ($title -match "handbag")                     { return "handbag,leather,purse" }
    if ($title -match "diploma|passport.*cop")       { return "documents,paper,certificate" }
    if ($title -match "Apple Watch")                 { return "smartwatch,apple,watch" }
    if ($title -match "gold ring|ring.*emerald")     { return "ring,gold,jewelry" }
    if ($title -match "Samsung|Galaxy")              { return "samsung,android,phone" }
    if ($title -match "apartment key|set of.*key")   { return "keys,keychain,door" }
    if ($title -match "backpack.*North Face|North Face backpack") { return "backpack,hiking,gray" }
    if ($title -match "AirPods")                     { return "earbuds,wireless,white" }
    if ($title -match "red.*wallet|wallet.*red")     { return "wallet,red,purse" }
    if ($title -match "prescription glasses|glasses") { return "glasses,eyeglasses,spectacles" }
    if ($title -match "Casio|silver.*watch")         { return "wristwatch,casio,silver" }
    if ($title -match "earring")                     { return "earrings,gold,jewelry" }
    if ($title -match "phone case")                  { return "phone,case,purple" }
    if ($title -match "Oxford shoes|leather.*shoes") { return "shoes,oxford,leather,brown" }
    if ($title -match "tote bag|canvas")             { return "tote,bag,canvas,green" }
    if ($title -match "Patagonia|orange.*jacket")    { return "jacket,orange,outdoor" }
    if ($title -match "passport.*Airport|Airport.*passport") { return "passport,travel,airport" }
    if ($title -match "children.*backpack|yellow.*backpack") { return "backpack,school,children,yellow" }
    if ($title -match "black.*wallet|wallet.*bank")  { return "wallet,black,leather" }
    if ($title -match "umbrella")                    { return "umbrella,rain,pink" }
    if ($title -match "gym bag|blue.*gym")           { return "gym,bag,sports,blue" }
    if ($title -match "belt")                        { return "belt,leather,black" }
    return "lost,found,item"
}

$success = 0
$fail = 0

foreach ($post in $posts) {
    $tags = Get-Tags $post.title
    # Stable seed per post so reruns get same image
    $seed = [Math]::Abs([System.BitConverter]::ToInt32([System.Guid]::Parse($post.id).ToByteArray(), 0))
    $imageUrl = "https://loremflickr.com/800/600/" + $tags + "?lock=" + $seed

    $tmpFile = "$env:TEMP\itemnest_img_$($post.id).jpg"

    try {
        Invoke-WebRequest -Uri $imageUrl -OutFile $tmpFile -TimeoutSec 20 -UseBasicParsing

        $uploadResult = curl.exe -s -X POST ($base + "/api/itemposts/" + $post.id + "/images") `
            -H ("Authorization: Bearer " + $token) `
            -F "file=@$tmpFile;type=image/jpeg"

        $parsed = $uploadResult | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($parsed.id) {
            $success++
            Write-Host "[$success] $($post.title)" -ForegroundColor Cyan
        } else {
            $fail++
            Write-Host "FAILED upload: $($post.title)" -ForegroundColor Red
            Write-Host "  $uploadResult" -ForegroundColor Yellow
        }
    } catch {
        $fail++
        Write-Host "FAILED: $($post.title)" -ForegroundColor Red
        Write-Host "  $_" -ForegroundColor Yellow
    } finally {
        Remove-Item $tmpFile -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Done. Added: $success  Failed: $fail" -ForegroundColor Green
