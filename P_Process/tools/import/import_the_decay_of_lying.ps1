$ErrorActionPreference = 'Stop'

$repo = (Get-Location).Path
$sourceRoot = 'C:\Users\Admin\Desktop\Writing-Agent-Frame'
$vietnameseSource = Join-Path $sourceRoot 'outputs\translations\oscar-wilde\the-decay-of-lying\finals\the-decay-of-lying.vi.md'
$englishSource = Join-Path $sourceRoot 'data\translation_corpus\oscar_wilde\processed\the_decay_of_lying.en.txt'
$slug = 'su-suy-tan-cua-nghe-thuat-noi-doi'

$vietnameseRaw = Get-Content -LiteralPath $vietnameseSource -Raw -Encoding UTF8
$vietnameseMatch = [regex]::Match(
    $vietnameseRaw,
    '(?s)^# [^\r\n]+\r?\n\s*\*\*[^:]+:\*\*[^\r\n]+\r?\n\s*\*\*[^:]+:\*\*[^\r\n]+\r?\n\s*---\r?\n\s*(?<body>.*)$'
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
title: "Sự suy tàn của nghệ thuật nói dối"
title_en: "The Decay of Lying"
date: 2026-07-31
tag: "Dịch thuật"
tag_en: "Translations"
source_author: "Oscar Wilde"
translator: "Kevin T.N a.k.a Lucis The Lord"
credit_name: "Kevin T.N a.k.a Lucis The Lord"
original_title: "The Decay of Lying: An Observation"
excerpt_text: "Oscar Wilde biến cuộc đối thoại về nghệ thuật nói dối thành một cuộc tấn công rực rỡ vào chủ nghĩa hiện thực, dữ kiện và thói bắt nghệ thuật sao chép đời sống."
---

"@

$englishFrontMatter = @"
---
slug_key: "$slug"
source_note: "Oscar Wilde, Intentions, Project Gutenberg 887"
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

Write-Host "Imported bilingual The Decay of Lying."
