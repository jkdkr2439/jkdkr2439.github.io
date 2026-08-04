$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = 'C:\Users\Admin\Desktop\Writing-Agent-Frame\outputs\land-parcel-satire-all-lenses'
$vietnameseSource = Join-Path $sourceRoot 'the-surveyor-of-tomorrow.vi.md'
$englishSource = Join-Path $sourceRoot 'the-surveyor-of-tomorrow.locked-source.en.md'
$coverSource = Join-Path $sourceRoot 'the-surveyor-of-tomorrow-cover.png'
$slug = 'nguoi-do-dac-ngay-mai'
$date = '2026-08-01'

function Read-Essay {
    param([string]$Path)
    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $match = [regex]::Match($raw, '(?s)^# (?<title>[^\r\n]+)\r?\n\s*(?<body>.*)$')
    if (-not $match.Success) {
        throw "Không đọc được cấu trúc bài: $Path"
    }
    return @{
        Title = $match.Groups['title'].Value.Trim()
        Body = $match.Groups['body'].Value.Trim()
    }
}

$vi = Read-Essay $vietnameseSource
$en = Read-Essay $englishSource
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$imageWebPath = "/assets/images/$slug/the-surveyor-of-tomorrow-cover.png"

$viFrontMatter = @"
---
layout: post
title: "$($vi.Title)"
title_en: "The Surveyor of Tomorrow"
date: $date
tag: Satire
tag_en: Satire & Power
author: Kevin T.N
excerpt_text: "A ruler joined to a seal can force the past itself off the map."
---

![$($vi.Title)]($imageWebPath)

"@

$enFrontMatter = @"
---
slug_key: "$slug"
source_note: "Original English literary satire by Kevin T.N; completed and locked before the Vietnamese reconstruction"
---

![$($en.Title)]($imageWebPath)

"@

$viTarget = Join-Path $repo "_posts\$date-$slug.md"
$enTarget = Join-Path $repo "_english\$slug.md"
$imageDir = Join-Path $repo "assets\images\$slug"
$imageTarget = Join-Path $imageDir 'the-surveyor-of-tomorrow-cover.png'

New-Item -ItemType Directory -Force -Path $imageDir | Out-Null
[System.IO.File]::WriteAllText($viTarget, $viFrontMatter + $vi.Body + "`n", $utf8NoBom)
[System.IO.File]::WriteAllText($enTarget, $enFrontMatter + $en.Body + "`n", $utf8NoBom)
Copy-Item -LiteralPath $coverSource -Destination $imageTarget -Force

Write-Host "Imported The Surveyor of Tomorrow."
Write-Host $viTarget
Write-Host $enTarget
Write-Host $imageTarget
