$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$sourceRoot = 'C:\Users\Admin\Desktop\Du_An\Sach\Triet hoc marx le\final book'
$englishRoot = Join-Path $sourceRoot 'English_Tieng_Cho\drafts'
$vietnameseRoot = Join-Path $sourceRoot 'Vietnamese_Tieng_Cho\drafts'

$chapters = @(
    @{ N = 1;  Slug = 'tiep-can-huu-han-voi-thuc-tai'; Vi = '01_TIEP_CAN_HUU_HAN_VOI_THUC_TAI.md'; En = '01_FINITE_ACCESS_TO_REALITY.md' },
    @{ N = 2;  Slug = 'tri-giac-la-mot-cuoc-gap'; Vi = '02_TRI_GIAC_LA_MOT_CUOC_GAP.md'; En = '02_PERCEPTION_IS_AN_ENCOUNTER.md' },
    @{ N = 3;  Slug = 'chu-y-va-su-che-tac-tinh-lien-quan'; Vi = '03_CHU_Y_VA_SU_CHE_TAC_TINH_LIEN_QUAN.md'; En = '03_ATTENTION_AND_RELEVANCE.md' },
    @{ N = 4;  Slug = 'ky-uc-tai-dung-qua-khu'; Vi = '04_KY_UC_TAI_DUNG_QUA_KHU.md'; En = '04_MEMORY_RECONSTRUCTS_THE_PAST.md' },
    @{ N = 5;  Slug = 'khai-niem-nen-va-lam-mat'; Vi = '05_KHAI_NIEM_NEN_VA_LAM_MAT.md'; En = '05_CONCEPTS_COMPRESS_WITH_LOSS.md' },
    @{ N = 6;  Slug = 'ngon-ngu-cat-the-gioi'; Vi = '06_NGON_NGU_CAT_THE_GIOI.md'; En = '06_LANGUAGE_CUTS_THE_WORLD.md' },
    @{ N = 7;  Slug = 'du-kien-chi-thanh-bang-chung-cho-mot-menh-de'; Vi = '07_DU_KIEN_CHI_THANH_BANG_CHUNG_CHO_MOT_MENH_DE.md'; En = '07_DATA_BECOME_EVIDENCE.md' },
    @{ N = 8;  Slug = 'suy-luan-vuot-qua-dieu-quan-sat-khong-the'; Vi = '08_SUY_LUAN_VUOT_QUA_DIEU_QUAN_SAT_KHONG_THE.md'; En = '08_INFERENCE_CROSSES_OBSERVATION.md' },
    @{ N = 9;  Slug = 'phan-lon-tri-thuc-di-den-qua-nguoi-khac'; Vi = '09_PHAN_LON_TRI_THUC_DI_DEN_QUA_NGUOI_KHAC.md'; En = '09_KNOWLEDGE_THROUGH_OTHERS.md' },
    @{ N = 10; Slug = 'chuyen-mon-co-linh-vuc'; Vi = '10_CHUYEN_MON_CO_LINH_VUC.md'; En = '10_EXPERTISE_HAS_A_DOMAIN.md' },
    @{ N = 11; Slug = 'dong-thuan-la-bang-chung-khong-phai-thuat-luyen-kim'; Vi = '11_DONG_THUAN_LA_BANG_CHUNG_KHONG_PHAI_THUAT_LUYEN_KIM.md'; En = '11_CONSENSUS_IS_EVIDENCE.md' },
    @{ N = 12; Slug = 'niem-tin-co-cap-do'; Vi = '12_NIEM_TIN_CO_CAP_DO.md'; En = '12_BELIEF_COMES_IN_DEGREES.md' },
    @{ N = 13; Slug = 'cai-gia-cua-sai-lam-lam-doi-nguong'; Vi = '13_GIA_CUA_SAI_LAM_LAM_DOI_NGUONG.md'; En = '13_COST_OF_ERROR.md' },
    @{ N = 14; Slug = 'mot-niem-tin-song-co-dieu-kien-sua-doi'; Vi = '14_NIEM_TIN_SONG_CO_DIEU_KIEN_SUA_DOI.md'; En = '14_CONDITIONS_FOR_REVISION.md' },
    @{ N = 15; Slug = 'he-kin-an-dau-ra-cua-chinh-no'; Vi = '15_HE_KIN_AN_DAU_RA_CUA_CHINH_NO.md'; En = '15_CLOSED_SYSTEMS.md' },
    @{ N = 16; Slug = 'duc-tinh-cua-mot-tam-tri-co-kha-nang-sua-sai'; Vi = '16_DUC_TINH_CUA_TAM_TRI_CO_KHA_NANG_SUA_SAI.md'; En = '16_CORRECTABLE_MIND.md' }
)

function Read-Chapter {
    param([string]$Path)
    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    $match = [regex]::Match($raw, '(?s)^# [^\r\n]+\r?\n\s*# (?<title>[^\r\n]+)\r?\n\s*(?<body>.*)$')
    if (-not $match.Success) {
        throw "Không đọc được cấu trúc chương: $Path"
    }
    return @{
        Title = $match.Groups['title'].Value.Trim()
        Body = $match.Groups['body'].Value.Trim()
    }
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
foreach ($chapter in $chapters) {
    $vi = Read-Chapter (Join-Path $vietnameseRoot $chapter.Vi)
    $en = Read-Chapter (Join-Path $englishRoot $chapter.En)
    $number = '{0:D2}' -f $chapter.N

    $viFrontMatter = @"
---
layout: post
title: "$($vi.Title)"
title_en: "$($en.Title)"
date: 2026-07-31
tag: Nhận thức luận căn bản
tag_en: Basic Epistemology
book_edition: Tiếng Chó
book_edition_en: The Dog's Language
chapter_number: $($chapter.N)
chapter_label: "$number"
author: Kevin T.N
---

"@
    $enFrontMatter = @"
---
slug_key: "$($chapter.Slug)"
source_note: "English master edition by Kevin T.N"
---

"@

    $viTarget = Join-Path $repo "_posts\2026-07-31-$($chapter.Slug).md"
    $enTarget = Join-Path $repo "_english\$($chapter.Slug).md"
    [System.IO.File]::WriteAllText($viTarget, $viFrontMatter + $vi.Body + "`n", $utf8NoBom)
    [System.IO.File]::WriteAllText($enTarget, $enFrontMatter + $en.Body + "`n", $utf8NoBom)
}

Write-Host "Imported $($chapters.Count) bilingual chapters."
