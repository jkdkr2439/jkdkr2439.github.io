# Translation Library Tree Design

## Goal

Đưa sách dịch vào cây điều hướng có cấp bậc rõ ràng: `Dịch thuật → lĩnh vực → tên sách → tựa sách và chương`.

## Data model

- `_data/books.json` tiếp tục là nguồn duy nhất quyết định landing và thứ tự chương.
- Sách dịch khai báo thêm `translation_category_vi` và `translation_category_en` trong manifest.
- Post sách giữ `library_hidden: true` để không xuất hiện lần hai trong danh sách các bài dịch rời.

## Sidebar

- Nhóm `Dịch thuật` chứa các lĩnh vực, trước mắt có `Tâm lý học / Psychology`.
- Trong lĩnh vực là từng cuốn sách; trước mắt có `Tâm lý học Vô thức / Psychology of the Unconscious`.
- Trong sách có một mục tựa sách và danh sách chương theo đúng thứ tự manifest.
- Bài dịch rời hiện hữu vẫn nằm dưới nhóm tác giả, không bị đổi cấu trúc.

## Behavior

- Bấm tên sách mở continuous reader.
- Bấm tựa sách hoặc chương mở đúng vị trí trong continuous reader.
- Nhãn đổi theo công tắc VI/EN hiện có.

## Verification

- Validator kiểm tra sách có category phải có nhãn VI và EN.
- DOM live phải hiện đủ ba cấp và link đúng book key.
- Gate repository và GitHub Pages build phải pass.
