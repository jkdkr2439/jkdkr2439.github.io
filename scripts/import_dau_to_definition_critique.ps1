$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = 'C:\Users\Admin\Desktop\Writing-Agent-Frame\outputs\criticism\hoi-dong-cuu-dau-to-definition-conflict\finals'
$vietnameseSource = Join-Path $sourceRoot 'dau-to-va-quyen-dinh-nghia.final.vi.md'
$englishSource = Join-Path $sourceRoot 'dau-to-va-quyen-dinh-nghia.final.en.md'
$slug = 'dau-to-va-quyen-dinh-nghia'
$date = '2026-08-01'
$videoUrl = 'https://www.youtube.com/watch?v=6cRdEg-IxUQ'
$oxfordUrl = 'https://academic.oup.com/aristotelian/article-abstract/56/1/167/1793543'
$anuUrl = 'https://openresearch-repository.anu.edu.au/items/8e67e7f3-9a77-4821-a803-b0611d1b03d1'

function Read-Essay {
    param([string]$Path)
    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $match = [regex]::Match($raw, '(?s)^# [^\r\n]+\r?\n\s*# (?<title>[^\r\n]+)\r?\n\s*(?<body>.*)$')
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

# Keep every citation on the verified, readable landing page used during publication QA.
$vi.Body = $vi.Body.Replace('https://doi.org/10.1093/aristotelian/56.1.167', $oxfordUrl)
$en.Body = $en.Body.Replace('https://doi.org/10.1093/aristotelian/56.1.167', $oxfordUrl)
$en.Body = $en.Body.Replace('https://www.plunkett.host.dartmouth.edu/metalinguistic-negotiations.pdf', $anuUrl)

$viSourceNote = '**Văn bản được phản biện:** [Hội Đồng Cừu — *Nguyễn Thành Nam: "Tai nạn" chính trị, hay những cuộc cách mạng "vĩnh viễn"*]({0}).' -f $videoUrl
$enSourceNote = '**Text under criticism:** [Hội Đồng Cừu — *Nguyen Thanh Nam: A Political "Accident," or "Perpetual" Revolutions*]({0}).' -f $videoUrl

$viFrontMatter = @"
---
layout: post
title: "$($vi.Title)"
title_en: "$($en.Title)"
date: $date
tag: Phản biện
tag_en: Criticism & Epistemology
book_edition: Tiếng Chó
book_edition_en: The Dog's Language
author: Kevin T.N
excerpt_text: "Historical recurrence can establish a mechanism; it cannot establish an essence without a separate argument."
---

$viSourceNote

"@

$enFrontMatter = @"
---
slug_key: "$slug"
source_note: "English master edition by Kevin T.N"
---

$enSourceNote

"@

$viFrontMatter += "`n"
$enFrontMatter += "`n"

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$viTarget = Join-Path $repo "_posts\$date-$slug.md"
$enTarget = Join-Path $repo "_english\$slug.md"
[System.IO.File]::WriteAllText($viTarget, $viFrontMatter + $vi.Body + "`n", $utf8NoBom)
[System.IO.File]::WriteAllText($enTarget, $enFrontMatter + $en.Body + "`n", $utf8NoBom)

Write-Host 'Imported bilingual denunciation critique.'
Write-Host $viTarget
Write-Host $enTarget


