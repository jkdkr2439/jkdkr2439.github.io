# Publish an article

This is the single operating entrypoint for a human or agent adding Writing
content. The repository is a DIPOD compiler: edit canonical Data, validate it,
build in a sandbox, and publish only the verified artifact.

## 1. Choose the article identity

Use a lowercase ASCII kebab-case slug. An ordinary Vietnamese article is:

`D_Data/content/posts/YYYY-MM-DD-<slug>.md`

Copy `D_Data/knowledge/templates/article-vi.md` and replace every angle-bracket
token. Do not create or edit `_posts/`, `_site/`, generated HTML, or deployed
files.

For a bilingual article, copy `D_Data/knowledge/templates/article-en.md` to:

`D_Data/content/english/<slug>.md`

Its `slug_key` must equal the Vietnamese slug.

## 2. Add owned images

Put article images in:

`D_Data/media/assets/images/<slug>/`

Reference them from Markdown or HTML with the canonical mount-independent URL:

```markdown
![Mô tả ảnh](/assets/images/<slug>/hero.png)
```

Never write `/writing/assets/...` into canonical content. The Input adapter adds
the Writing mount only in the ephemeral build workspace. Keep file-name case
exact because GitHub Pages is case-sensitive.

## 3. Classify books explicitly

For an ordinary article, no manifest edit is needed. For a book landing page or
chapter, update `D_Data/manifests/books.json` in the same change. That manifest
alone owns book membership and order; filenames and tags do not imply it.

## 4. Prepare in a sandbox

From the repository root run:

```text
python -B -m P_Process.tools.publish_article --slug <slug>
```

The command validates the selected article and all canonical image references,
builds the composed site in a temporary sandbox, validates compiled Writing
image URLs, and writes an IPOD report under `O_Output/reports/`. It never repairs
Data, commits, pushes, downloads, or deploys.

If it fails, read `data_feedback` in the report. Fix the named canonical owner
and rerun; never patch generated output.

## 5. Verify and preview

```text
python -B -m P_Process.validation.run_all
python -B -m unittest discover -s P_Process/tests -p "test_*.py" -v
python -B -m P_Process.build.build_site --destination O_Output/artifacts/site-preview
```

Open `O_Output/artifacts/site-preview/index.html` through the local preview
server. Check the article in VI and EN, every image, mobile layout, and browser
console.

## 6. Commit and publish separately

Commit only canonical sources, owned media, manifests when applicable, and code
changes intentionally made for the publication. A push to `main` and production
deployment require explicit user authorization after verification. Wait for the
canonical `Validate` and `Deploy Pages` workflows, then smoke-test the live
article and representative image URLs.

If validation or deployment fails, do not replace the last successful site.
Return to the failing IPOD phase and its named owner.
