# Baseline thực hiện Plan 001

Ngày: 2026-11-18. Source HEAD khi bắt đầu: `58488b5e28`. Những thay đổi UI trước đó đã được giữ nguyên.

## Giai đoạn 1

- Inventory: 127 page/API routes, 25 locale directories, 2.281 source test files.
- Vitest API discovery: unit 1 file, compatibility DOM 1.865, Browser 414, UI 1. Không thiếu hoặc trùng file. Đây là discovery, không phải toàn bộ suite đã pass.
- `pnpm -C saas check:types`: exit 0 sau khi thêm harness.
- Helpers: 2 tests pass.
- Login redirect, Console server transport, template cards: 83 tests pass.
- HomeContent, account client/server, TryApp: 49 tests pass.
- Console bootstrap, workflow preview, WebApp document/boundary: 63 tests pass.
- Home banner Browser Mode: 2 tests pass, dùng Chrome local.
- Playwright: 4 read-only cases pass, gồm API health, public system features, anonymous Home redirect và sign-in frame protection. Backend 1.19.0 tại localhost:5001 đã được setup trước; không tạo/reset tài khoản hay ghi dữ liệu cá nhân.
- Tổng selected Vitest cases: 199. Tổng E2E: 4.
- Các lệnh browser dùng `SAAS_VITEST_CHANNEL=chrome` hoặc `SAAS_E2E_CHANNEL=chrome`; không hard-code Chrome trong cấu hình CI.
- Test Next server dùng `.next-e2e`, cổng 3008 và heap tối đa 4096 MB, không tranh `.next` với dev server hiện có.
- Node 24.22.3 đã được cài để chạy install đúng engine root, không hạ engineStrict. pnpm install thành công, dependencies/lockfile đã cập nhật.

## Nợ cấu hình có trước, chưa giải quyết ở G1

`check:deps` và `check:i18n` đều exit 1 khi ghi baseline. Knip có unused exports/dependencies và stale ignore entries; i18n-check còn kiểm tra corpus demo en/fr, báo unused/missing demo keys. Theo plan, chúng thuộc các giai đoạn Env/demo/i18n/tooling, không phải bằng chứng G5 đạt.

## Giới hạn bằng chứng

Các contract test dùng network fixtures/query clients tách riêng. E2E hiện chỉ anonymous/read-only; chưa chứng minh đăng nhập bằng tài khoản test riêng, workspace switch end-to-end, model-backed workflow execution, uploaded files hay persistence. Không chạy toàn bộ 2.281 test hoặc production build ở G1. Phải bổ sung bằng chứng tương ứng trước production cutover.

## Kiểm tra có thể chạy lại

```sh
pnpm -C saas migration:check
pnpm -C saas check:types
pnpm -C saas test --project unit --maxWorkers=2 src/utils/Helpers.test.ts
SAAS_VITEST_CHANNEL=chrome pnpm -C saas test --project browser --maxWorkers=2 src/features/home/banner/__tests__/banner-item.browser.spec.tsx
SAAS_E2E_CHANNEL=chrome pnpm -C saas test:e2e --project chromium --workers=2
node --test saas/scripts/move-source.test.ts
```

Paths của nhóm legacy sẽ được cập nhật qua move manifest khi di chuyển source. Không dùng một log cũ để khẳng định source mới đã pass.
