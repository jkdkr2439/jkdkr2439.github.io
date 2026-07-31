$ErrorActionPreference = 'Stop'

$repo = (Get-Location).Path
$sourceRoot = 'C:\Users\Admin\Desktop\Writing-Agent-Frame'
$vietnameseSource = Join-Path $sourceRoot 'outputs\translations\oscar-wilde\lecture-to-art-students\finals\lecture-to-art-students.vi.md'
$englishSource = Join-Path $sourceRoot 'data\translation_corpus\oscar_wilde\processed\lecture_to_art_students.en.txt'
$slug = 'dien-thuyet-truoc-sinh-vien-my-thuat'

$vietnameseRaw = Get-Content -LiteralPath $vietnameseSource -Raw -Encoding UTF8
$vietnameseMatch = [regex]::Match(
    $vietnameseRaw,
    '(?s)^# [^\r\n]+\r?\n\s*## [^\r\n]+\r?\n\s*\*[^\r\n]+\*\r?\n\s*(?<body>.*)$'
)
if (-not $vietnameseMatch.Success) {
    throw "Không đọc được cấu trúc bản dịch: $vietnameseSource"
}

$englishBody = (Get-Content -LiteralPath $englishSource -Raw -Encoding UTF8).Trim()
$vietnameseBody = $vietnameseMatch.Groups['body'].Value.Trim()
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$vietnameseFrontMatter = @"
---
layout: post
title: "Diễn thuyết trước sinh viên mỹ thuật"
title_en: "Lecture to Art Students"
date: 2026-07-31
tag: "Dịch thuật"
tag_en: "Translations"
source_author: "Oscar Wilde"
translator: "Kevin T.N a.k.a Lucis The Lord"
credit_name: "Kevin T.N a.k.a Lucis The Lord"
original_title: "Lecture to Art Students"
excerpt_text: "Oscar Wilde nói với sinh viên mỹ thuật về cái đẹp, quan sát, kỹ thuật và điều mà một bức tranh thực sự phải làm."
---

"@

$englishFrontMatter = @"
---
slug_key: "$slug"
source_note: "Oscar Wilde, Essays and Lectures, Project Gutenberg"
---

*Oscar Wilde · Original English text*

"@

$vietnameseTarget = Join-Path $repo "_posts\2026-07-31-$slug.md"
$englishTarget = Join-Path $repo "_english\$slug.md"

[System.IO.File]::WriteAllText(
    $vietnameseTarget,
    $vietnameseFrontMatter + $vietnameseBody + "`n",
    $utf8NoBom
)
[System.IO.File]::WriteAllText(
    $englishTarget,
    $englishFrontMatter + $englishBody + "`n",
    $utf8NoBom
)

Write-Host "Imported bilingual Oscar Wilde lecture."
