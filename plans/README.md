# Kế hoạch triển khai

Lập ngày 2026-11-18 theo skill advisor. Đây là kế hoạch được người dùng yêu cầu; chưa triển khai source trong lần khảo sát này.

| Plan | Mục tiêu | Priority | Effort | Dependency | Status |
|---|---|---|---|---|---|
| [001](001-align-saas-with-nextjs-boilerplate.md) | Chuẩn hóa SaaS theo ixartz/Next-js-Boilerplate, giữ auth/backend Dify | P1 | L | Không | IN PROGRESS |

Thứ tự trong plan: baseline/test discovery → cấu trúc source/CSS → Env/dọn demo → next-intl/routing → tooling → production/CI/deployment. Mỗi giai đoạn là PR riêng, gate phải đạt trước khi chuyển tiếp.


Theo dõi từng bước: [Tiến độ Plan 001](001-progress.md) — **14/30 bước, 2/6 gate; đang dọn demo frontend**.

## Quyết định và phương án đã loại

- Giữ auth/backend Dify theo lựa chọn người dùng; không thêm Clerk.
- Không đưa dữ liệu Dify sang Drizzle/PGlite chỉ để giống template.
- Không copy nguyên package.json/proxy upstream hoặc downgrade version workspace.
- Không xóa web hoặc đổi deployment mặc định trước khi có production parity.
- Không gộp refactor kiến trúc với thiết kế lại UI; giữ các chỉnh sửa modal trước đó.

Executor cập nhật status và evidence sau từng giai đoạn. Có thể dùng TODO, IN PROGRESS, DONE, BLOCKED kèm lý do. Không đánh dấu DONE chỉ dựa vào typecheck.
