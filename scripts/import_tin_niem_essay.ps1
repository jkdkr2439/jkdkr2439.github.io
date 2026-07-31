$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = 'C:\Users\Admin\Desktop\Writing-Agent-Frame\outputs\publications\tin-niem-tieng-cho-tieng-nguoi\finals'
$vietnameseSource = Join-Path $sourceRoot 'tin-niem-tieng-cho-tieng-nguoi.vi.md'
$englishSource = Join-Path $sourceRoot 'belief-dog-language-human-language.en.md'
$slug = 'khi-noi-toi-tin-may-dang-noi-cai-gi'

function Read-Essay {
    param([string]$Path)
    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $match = [regex]::Match($raw, '(?s)^# (?<title>[^\r\n]+)\r?\n\s*(?<body>.*)$')
    if (-not $match.Success) {
        throw "Không đọc được cấu trúc bài luận: $Path"
    }
    return @{
        Title = $match.Groups['title'].Value.Trim()
        Body = $match.Groups['body'].Value.Trim()
    }
}

$vi = Read-Essay $vietnameseSource
$en = Read-Essay $englishSource
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$viFrontMatter = @"
---
layout: post
title: "Khi nói “tôi tin”, mày đang nói cái gì?"
title_en: "What Do You Mean When You Say You Believe?"
date: 2026-07-31
tag: Nhận thức luận
tag_en: Epistemology
author: Kevin T.N
excerpt_text: "Tin một điều là đúng, tin nó có hiệu lực, tin nó có giá trị và trao lòng trung thành cho nó là bốn việc khác nhau."
---

"@

$enFrontMatter = @"
---
slug_key: "$slug"
source_note: "Contemporary bilingual epistemological essay by Kevin T.N"
---

"@

$viTarget = Join-Path $repo "_posts\2026-07-31-$slug.md"
$enTarget = Join-Path $repo "_english\$slug.md"
[System.IO.File]::WriteAllText($viTarget, $viFrontMatter + $vi.Body + "`n", $utf8NoBom)
[System.IO.File]::WriteAllText($enTarget, $enFrontMatter + $en.Body + "`n", $utf8NoBom)

Write-Host "Imported bilingual belief essay."
