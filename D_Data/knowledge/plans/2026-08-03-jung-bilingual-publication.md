# Jung Bilingual Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xuất bản *Psychology of the Unconscious* thành một cuốn sách đọc liên tục trên blog, với tiếng Việt bên trái và tiếng Anh bên phải, có điểm bắt đầu đồng bộ theo từng khối văn bản.

**Architecture:** Một script nhập liệu đọc 140 cặp chunk canonical từ Pete_writer, gom chúng theo các phần/chương thực của ấn bản 1916 và sinh các post HTML có hàng song ngữ. Reader hiện có nhận thêm cờ `parallel_layout` để hiển thị một thân bài hai cột đã căn cặp; `_data/books.json` vẫn là nguồn duy nhất quyết định thành viên và thứ tự sách.

**Tech Stack:** Python 3, Jekyll/Liquid, JavaScript thuần, CSS Grid, GitHub Pages.

## Global Constraints

- Thứ tự ngôn ngữ bắt buộc: VI rồi EN.
- Credit: C. G. Jung; bản Anh 1916 của Beatrice M. Hinkle; dịch Anh–Việt bởi Kevin T.N.
- Công khai tuyến văn bản Đức nguyên tác → Hinkle Anh ngữ 1916 → Kevin T.N Việt ngữ.
- Không gọi đây là bản dịch trực tiếp từ tiếng Đức hoặc bản sửa đổi năm 1952.
- Mỗi chương là một post riêng; không nhét toàn bộ sách vào một post.
- `_data/books.json` là nguồn duy nhất xác định thành viên và thứ tự chương.

---

### Task 1: Bộ sinh nội dung sách

**Files:**
- Create: `scripts/import_jung_bilingual.py`
- Test: `scripts/test_import_jung_bilingual.py`

**Interfaces:**
- Consumes: `Projects/outputs/jung-65903-full-vi/chunks/source-en/chunk-NNN.en.txt` và `chunks/translation-vi/chunk-NNN.vi.md`.
- Produces: landing/chapter posts có `parallel_layout: true`, các hàng `.parallel-row`, `.parallel-vi`, `.parallel-en`.

- [ ] Viết test fixture nhỏ xác nhận thứ tự VI–EN, số hàng và tuyến credit.
- [ ] Chạy test và xác nhận thất bại khi importer chưa tồn tại.
- [ ] Cài đặt split block, căn cặp theo độ dài và gom chapter theo heading canonical.
- [ ] Sinh toàn bộ post Jung và kiểm tra số chương, số chunk, không mất block.
- [ ] Chạy test để xác nhận pass.

### Task 2: Registry và reader song ngữ căn hàng

**Files:**
- Modify: `assets/js/post-registry.js`
- Modify: `assets/js/app.js`
- Modify: `assets/css/site.css`

**Interfaces:**
- Consumes: front matter `parallel_layout` và HTML hàng song ngữ do Task 1 sinh.
- Produces: reader một thân bài song song, responsive mobile xếp VI trên EN trong từng hàng.

- [ ] Thêm `parallelLayout` vào registry.
- [ ] Render post/chapter song song bằng một panel toàn chiều rộng khi cờ được bật.
- [ ] Thêm CSS grid hai cột VI–EN và breakpoint một cột theo từng hàng.
- [ ] Chạy `node --check assets/js/app.js`.

### Task 3: Khai báo sách và lối vào

**Files:**
- Modify: `_data/books.json`
- Modify: `_includes/reader.html`

**Interfaces:**
- Consumes: slug landing và chapter do Task 1 sinh.
- Produces: mục sách trong sidebar, homepage và continuous reader.

- [ ] Thêm manifest `tam-ly-hoc-vo-thuc` với thứ tự chương liên tục.
- [ ] Thêm card homepage dẫn vào đúng book key.
- [ ] Chạy validator để kiểm tra mọi slug tồn tại đúng một lần.

### Task 4: Gate, build và phát hành

**Files:**
- Verify: toàn repository.

**Interfaces:**
- Consumes: site source hoàn chỉnh.
- Produces: commit trên `main` và bản GitHub Pages đã triển khai.

- [ ] Chạy `python scripts/validate_site.py`.
- [ ] Chạy `python -m unittest scripts/test_import_jung_bilingual.py`.
- [ ] Chạy `node --check assets/js/app.js` và `git diff --check`.
- [ ] Build Jekyll bằng cấu hình repository nếu runtime sẵn có.
- [ ] Kiểm tra cục bộ landing, một chương đầu, một chương giữa và một chương cuối.
- [ ] Commit có phạm vi rõ ràng, push `main`, rồi kiểm tra Pages vẫn trỏ vào `jkdkr2439.github.io`.
