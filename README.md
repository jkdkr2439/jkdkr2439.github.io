# Danh Nghĩa Hệ

Production site source organized as a recursive DIPOD/IPOD system. A minimal Site Canvas owns `/`; the Jekyll reader is an independently built Writing module at `/writing/`.

## Source flow

```text
D_Data -> I_Input -> P_Process -> O_Output -> feedback Data
                 \-> D_Display -> Canvas + Writing -> composed site
```

`main` contains canonical source. Canvas and Writing build independently in temporary trees, then an atomic compositor mounts Writing under `/writing/`. The registry also declares Products, Papers, Media, and Connect; Media owns the YouTube capability.

## Validate

```powershell
$env:BUNDLE_PATH = 'C:\tmp\blog-jekyll-bundle'
python -B -m P_Process.validation.run_all
python -B -m unittest discover -s P_Process/tests -p 'test_*.py' -v
node --check D_Display/assets/js/app.js
node --test P_Process/tests/platform/*.test.mjs
node P_Process/tests/browser/test_canvas_store.js
```

## Build

Install Ruby 3.2, Bundler 2.5.23, then install dependencies outside the repository:

```powershell
$env:BUNDLE_PATH = 'C:\tmp\blog-jekyll-bundle'
bundle _2.5.23_ install --gemfile D_Data/config/dependencies/Gemfile
python -B -m P_Process.build.build_site --destination C:\tmp\dnh-site
```

Architecture and migration documents live in `D_Data/knowledge/`. Begin agent work at `AGENTS.md`.
