# Tiến độ Plan 001

Cập nhật: 2026-11-18 (Asia/Ho_Chi_Minh).

[Kế hoạch chi tiết](001-align-saas-with-nextjs-boilerplate.md) · [Danh mục kế hoạch](README.md)

## Tổng quan

- Trạng thái triển khai: **IN PROGRESS**.
- Bước triển khai hoàn tất: **14/30**.
- Gate giai đoạn đạt: **2/6**.
- Bước tiếp theo: **3.5 — Dọn dependencies và scripts**.
- Khảo sát và việc tạo tài liệu đã hoàn thành; việc triển khai kế hoạch migration đã bắt đầu.

## Chuẩn bị đã hoàn tất

| Mã | Công việc | Trạng thái | Bằng chứng |
|---|---|---|---|
| P.1 | Khảo sát SaaS và upstream | DONE | Các đường dẫn, excerpt và upstream SHA trong plan |
| P.2 | Chốt giữ auth/backend Dify | DONE | Lựa chọn rõ ràng của người dùng trong phiên |
| P.3 | Viết plan và bảng theo dõi | DONE | Các file Markdown trong plans/ |

## Các bước triển khai

| Mã | Công việc | Trạng thái | Kiểm tra / bằng chứng | Trở ngại |
|---|---|---|---|---|
| 1.1 | Lập inventory route/import/locale/CSS/test | DONE | plans/001-inventory.json: 127 routes, 25 locale directories, 2.281 test files; migration:check exit 0 | — |
| 1.2 | Ghi baseline hành vi Dify và các luồng quan trọng | DONE | 197 contract cases + 2 browser cases pass; live health/setup/features và anonymous navigation đã xác lập; không mutate DB | — |
| 1.3 | Sửa discovery và phân loại project Vitest | DONE | Vitest API reconciled 2.281 files: unit 1, legacy 1.865, browser 414, ui 1; không trùng hoặc thiếu | — |
| 1.4 | Bổ sung helper và characterization tests Dify | DONE | Đã port helpers/mocks/setup sang SaaS; selected Home/auth/transport/modal tests pass, không import source web | — |
| 1.5 | Sửa Playwright harness và thay test demo | DONE | 4 Playwright smoke pass trên port 3008/.next-e2e; không PGlite/Clerk, không dùng credential cá nhân | — |
| G1 | Gate giai đoạn 1: xem tiêu chí trong plan | DONE | migration:check + typecheck exit 0; unit 2, legacy 195, browser 2, E2E 4 pass | — |
| 2.1 | Chuyển UI khỏi app/components bằng từng batch | DONE | Đã chuyển 5.236 files theo 4 batch; checker/discovery pass; audit 10.490 relative imports đúng đích; sửa embedded CSS asset URLs | — |
| 2.2 | Tách query/provider/notification khỏi route | DONE | Đã chuyển 11 provider/notification/query-factory files và 609 consumers; typecheck + 18 SSR/bootstrap/transport cases pass | — |
| 2.3 | Chuyển DTO Dify sang types/dify | DONE | Đã chuyển 10 Dify type modules và 559 consumers; typecheck exit 0; giữ models/Schema.ts | — |
| 2.4 | Gom CSS và sửa đường dẫn scan/assets/plugins | DONE | 7 CSS/plugin files đã chuyển; app/Storybook/Browser dùng chung global.css; Browser 13 cases pass | — |
| 2.5 | Kiểm tra overlay/state/focus sau khi chuyển | DONE | Sau sửa 14 CSS references: 4 E2E pass; 13 Browser + 62 legacy UI cases pass; modal behavior giữ nguyên | — |
| G2 | Gate giai đoạn 2: xem tiêu chí trong plan | DONE | Typecheck/discovery/routes/locales/CSS references pass; native codemod 7 tests pass; 4 E2E pass sau relocation | — |
| 3.1 | Hợp nhất Env, giữ runtime dataset | DONE | Một schema tại libs/Env.ts, src/env.ts re-export; typecheck và 8 Env test mới pass | — |
| 3.2 | Tách server/public config và kiểm tra validation | DONE | Config/instrumentation/devtools/marketplace dùng Env chung; typecheck + 28 Env/SSR/bootstrap cases pass | — |
| 3.3 | Dọn Counter/DB demo sau khi kiểm tra consumers | DONE | Đã bỏ Counter route/UI/schema/migrations demo; retirement manifests giữ đủ 126 routes Dify và lineage 2.282 tests; Env 8 cases pass | — |
| 3.4 | Xác lập quy ước form, giữ form Dify đang dùng | DONE | README quy định RHF/Zod cho form mới; không đổi form TanStack Dify; giữ RHF/resolvers có chủ đích | — |
| 3.5 | Dọn dependencies và scripts theo inventory | IN PROGRESS | Đã gỡ DB scripts/dependencies và demo-only integrations; đang reconcile Knip theo workspace catalog | — |
| G3 | Gate giai đoạn 3: xem tiêu chí trong plan | TODO | Chưa chạy gate | — |
| 4.1 | Lập mapping đầy đủ locale và cookie aliases | TODO | Chưa thực hiện | — |
| 4.2 | Viết converter message/ICU có kiểm tra collision | TODO | Chưa thực hiện | — |
| 4.3 | Thiết lập next-intl loader/plugin/types | TODO | Chưa thực hiện | — |
| 4.4 | Pilot Home với adapter i18next tạm thời | TODO | Chưa thực hiện | — |
| 4.5 | Chuyển routing nội bộ và giữ URL/các lớp bảo vệ | TODO | Chưa thực hiện | — |
| 4.6 | Chuyển các feature còn lại, bỏ adapter khi đủ điều kiện | TODO | Chưa thực hiện | — |
| G4 | Gate giai đoạn 4: xem tiêu chí trong plan | TODO | Chưa chạy gate | — |
| 5.1 | Chuẩn hóa configs tooling theo upstream/pnpm | TODO | Chưa thực hiện | — |
| 5.2 | Port test theo feature và reconcile discovery | TODO | Chưa thực hiện | — |
| 5.3 | Đồng bộ formatter/Storybook/theme/i18n | TODO | Chưa thực hiện | — |
| 5.4 | Xác minh checker/OpenAPI và chính sách build errors | TODO | Chưa thực hiện | — |
| 5.5 | Giới hạn hooks/staged lint và xử lý lint backlog | TODO | Chưa thực hiện | — |
| G5 | Gate giai đoạn 5: xem tiêu chí trong plan | TODO | Chưa chạy gate | — |
| 6.1 | Thêm CI SaaS với các gate bắt buộc | TODO | Chưa thực hiện | — |
| 6.2 | Chuẩn bị Docker build/deployment frontend riêng | TODO | Chưa thực hiện | — |
| 6.3 | Kiểm tra production với backend Dify | TODO | Chưa thực hiện | — |
| 6.4 | Chuyển default khi đạt parity, ghi rollback | TODO | Chưa thực hiện | — |
| G6 | Gate giai đoạn 6: xem tiêu chí trong plan | TODO | Chưa chạy gate | — |

## Quy tắc cập nhật

1. Trước khi làm một bước: chuyển `TODO` → `IN PROGRESS`, thêm ngày và người/agent thực hiện vào nhật ký.
2. Sau khi làm: ghi file đã đổi, command kiểm tra, exit code và bằng chứng hành vi. Chỉ chuyển `DONE` khi tiêu chí của bước đạt.
3. Khi bị chặn: dùng `BLOCKED`, ghi lỗi thực tế và điều kiện cần để tiếp tục; giữ nguyên các bước sau ở `TODO`.
4. Gate `G1`–`G6` được cập nhật riêng. Một bước hoàn tất không có nghĩa cả giai đoạn hoàn tất.
5. Cập nhật tổng số DONE, bước tiếp theo và trạng thái tổng quan sau mỗi thay đổi; đồng bộ trạng thái tổng thể ở README và plan.
6. Mỗi batch lớn trong một bước phải có mục nhật ký riêng; ghi phần đã xong và phần còn lại. Không ghi secret hoặc toàn bộ giá trị env.
7. Không ghi `DONE` chỉ vì sửa xong code, typecheck xanh hoặc không còn lỗi compile. Ghi rõ kiểm tra nào chưa chạy.

Trạng thái hợp lệ: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`, `SKIPPED`. `SKIPPED` cần lý do và xác nhận điều chỉnh phạm vi; không tính là DONE.

## Nhật ký thực hiện

| Ngày | Bước | Kết quả / kiểm tra | Tiếp theo |
|---|---|---|---|
| 2026-11-18 | P.1–P.3 | Hoàn tất khảo sát, plan và bảng theo dõi; chưa sửa source để triển khai migration | Bắt đầu 1.1 khi triển khai |

| 2026-11-18 | 1.1 | IN PROGRESS: đối chiếu HEAD 58488b5e28; các thay đổi UI trước đã được commit; chưa đổi runtime | Tạo inventory |

| 2026-11-18 | 1.1, 1.3, 1.4 | DONE: inventory/check discovery đầy đủ, typecheck exit 0, Helpers 2 + legacy 83 + behavior 49 test pass | Hoàn tất 1.2/1.5 |

| 2026-11-18 | 1.2, 1.5, G1 | DONE: 199 Vitest cases + 4 E2E pass; checker và discovery exit 0. Đã đồng bộ Playwright/Vitest import, cô lập output test server. | 2.1 dry-run |

| 2026-11-18 | 2.1 / base | Chuyển 842 files bằng AST; phát hiện/sửa trailing slash của alias, thêm regression test; 4 codemod tests và 53 Home/template cases pass | Batch workflow |

| 2026-11-18 | 2.1 / workflow, app | Chuyển thêm 1.661 + 496 files; sửa codemod giữ module identity khi file/thư mục trùng tên; audit 6.098 relative imports không còn sai đích, checker và 4 workflow cases pass | Hoàn tất components |

| 2026-11-18 | 2.1 | DONE: 4 batch tổng 5.236 files; typecheck, inventory và audit 10.490 relative imports pass; AST tool có 6 regression checks | 2.2 |

| 2026-11-18 | 2.2 | DONE: chuyển 11 files, checker và 18 SSR/bootstrap cases pass; giữ nguyên query/request lifetime | 2.3 |

| 2026-11-18 | 2.3 | DONE: 10 modules sang types/dify, 559 consumers cập nhật, checker exit 0 | 2.4 |

| 2026-11-18 | 2.4 | DONE: một CSS entrypoint; loại scripts khỏi Tailwind scan để bỏ synthetic fixture URLs; Browser 13 cases và legacy 62 cases pass | 2.5 E2E |

| 2026-11-18 | 2.5, G2 | DONE: E2E phát hiện 14 @reference còn đường dẫn cũ; đã sửa, thêm CSS-reference guard; 4 E2E pass lại. Scripts migration đã chuyển sang TypeScript. | 3.1 |

| 2026-11-18 | 3.1 | DONE: một Env instance; 5 server + 3 browser environment tests pass, API config 3 cases pass; typecheck exit 0 | 3.2 |

| 2026-11-18 | 3.2 | DONE: raw product env reads tập trung tại Env.ts; 28 validation/SSR/bootstrap tests và checker pass; cô lập tsconfig test server | 3.3 |

Mẫu cho lần cập nhật tiếp theo:

```text
Date: YYYY-MM-DD
Step: 1.1
Status: IN PROGRESS / DONE / BLOCKED
Changed files: ...
Checks: command + exit code + observed result
Remaining work or blocker: ...
Next step: ...
```

| 2026-11-18 | 3.3–3.4 | DONE: chỉ bỏ frontend demo, không mutate backend DB; thêm route/test retirement manifests và quy ước form; sửa hai test imports nav-layout cũ được Knip phát hiện | 3.5 |
