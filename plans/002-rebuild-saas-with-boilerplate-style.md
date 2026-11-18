# Plan 002: Khôi phục SaaS Boilerplate và Tích hợp Dify theo Clean Architecture

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3e75a3f5ae..HEAD -- saas plans`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L (chia thành các PR độc lập)
- **Risk**: MED
- **Depends on**: none (thay thế hoàn toàn Plan 001)
- **Category**: architecture | dx | migration
- **Planned at**: commit `3e75a3f5ae`, 2026-11-18

## Why this matters

Kế hoạch 001 trước đó đã sao chép cơ học toàn bộ mã nguồn của Dify `web` (hơn 8.700 file) vào `saas/`, ghi đè `global.css` bằng CSS cũ và làm mất đi toàn bộ giao diện, layout và design system của `huuhabn/nextjs-saas-boilerplate`. Điều này triệt tiêu lý do chính của việc sử dụng boilerplate SaaS (giao diện hiện đại, Tailwind v4 tinh gọn, layout dashboard/marketing chuẩn mực).

Kế hoạch này đưa `saas` về trạng thái ban đầu của boilerplate tại commit `4bb1831ba2`, loại bỏ các file thừa từ `web`, sau đó tích hợp các tính năng và API của Dify Backend theo phong cách thiết kế tối giản, hiện đại của Next.js SaaS Boilerplate.

## Current state

- Thư mục `saas` hiện chứa hơn 8.000 file sao chép từ `web/src/app` và `web/src/components`.
- `saas/src/styles/global.css:1` đang trỏ `@import './dify/globals.css';` làm mất Tailwind CSS v4.
- Commit gốc sạch của boilerplate là `4bb1831ba2831421cfce3fb99c83e8389b2b7617` (tương ứng với upstream `git@github.com:huuhabn/nextjs-saas-boilerplate.git` tại SHA `b83157a8018f55b926a3c25a4b7a7e14b0dfbc35`).
- Boilerplate gốc có 115 files:
  - `src/styles/global.css` sử dụng `@import 'tailwindcss';` (Tailwind CSS v4).
  - `src/templates/BaseTemplate.tsx` quản lý layout header/footer chuẩn.
  - `src/app/[locale]/(marketing)` quản lý trang public landing.
  - `src/app/[locale]/(auth)/(center)` quản lý trang auth card ở giữa màn hình.
  - `src/app/[locale]/(auth)/dashboard` quản lý shell dashboard sau khi đăng nhập.
  - `next-intl` quản lý đa ngôn ngữ chuẩn qua `src/locales/en.json`, `fr.json`.

Exemplar của phong cách Boilerplate: `saas/src/templates/BaseTemplate.tsx` và `saas/src/app/[locale]/(auth)/dashboard/layout.tsx` tại commit `4bb1831ba2`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Restore baseline | `git checkout 4bb1831ba2 -- saas && git clean -fd saas` | `saas/` sạch về 115 files của boilerplate |
| Install dependencies | `pnpm install` | exit 0 |
| Typecheck SaaS | `pnpm -C saas check:types` | exit 0 |
| SaaS Unit Tests | `pnpm -C saas test` | exit 0 |
| SaaS Lint | `pnpm -C saas lint` | exit 0 |
| SaaS Dev Server | `pnpm -C saas dev:next` | Server khởi động tại port 3000/3008 |

## Scope

**In scope** (các file được phép chỉnh sửa):
- `saas/**`
- `plans/README.md`
- `plans/002-rebuild-saas-with-boilerplate-style.md`

**Out of scope** (tuyệt đối KHÔNG chạm vào):
- `web/**` (giữ nguyên làm tham chiếu)
- `api/**` (backend Python API của Dify giữ nguyên)
- `packages/**`
- `docker/**`

## Git workflow

- Branch: `saas`
- Commit theo từng giai đoạn với conventional commits (ví dụ: `refactor(saas): restore boilerplate baseline`, `feat(saas): integrate dify auth with boilerplate style`).
- Không push hoặc mở PR nếu chưa có yêu cầu từ người dùng.

## Steps

### Step 1: Khôi phục `saas` về trạng thái boilerplate gốc (`4bb1831ba2`)

1. Chạy lệnh khôi phục toàn bộ thư mục `saas` về commit `4bb1831ba2`:
   ```bash
   git checkout 4bb1831ba2 -- saas
   git clean -fd saas
   ```
2. Kiểm tra lại các file chủ đạo của boilerplate đã trở lại đầy đủ:
   - `saas/src/styles/global.css` (chứa `@import 'tailwindcss';`)
   - `saas/src/templates/BaseTemplate.tsx`
   - `saas/src/app/[locale]/(marketing)/layout.tsx`
   - `saas/src/app/[locale]/(auth)/dashboard/layout.tsx`
3. Cài đặt lại node_modules và chạy typecheck ban đầu:
   ```bash
   pnpm install
   pnpm -C saas check:types
   ```

**Verify**: `pnpm -C saas check:types` → exit 0, cấu trúc `saas` chỉ còn các file gốc của boilerplate.

---

### Step 2: Dọn dẹp Demo Upstream (Clerk & PGlite/Counter) và Thay bằng Dify Session/Proxy

1. Gỡ bỏ `@clerk/nextjs` và `@clerk/localizations` trong `saas/package.json`.
2. Gỡ bỏ demo counter (Drizzle/PGlite) không cần thiết:
   - Xóa `src/app/api/counter`, `src/components/CounterForm.tsx`, `src/components/CurrentCount.tsx`, `src/validations/CounterValidation.ts`.
   - Xóa `src/libs/DB.ts`, `src/utils/DBConnection.ts`, `src/models/Schema.ts`, `migrations/`.
   - Cập nhật scripts trong `saas/package.json` bỏ `db:migrate`, `pglite-server`.
3. Thêm cấu hình Proxy/Reverse Proxy chuyển tiếp API tới Dify Backend:
   - Trong `saas/next.config.ts`, thêm `rewrites` hoặc proxy handler:
     * `/console/api/:path*` → `${process.env.CONSOLE_API_URL || 'http://127.0.0.1:5001'}/console/api/:path*`
     * `/api/:path*` → `${process.env.APP_API_URL || 'http://127.0.0.1:5001'}/api/:path*`
     * `/files/:path*` → `${process.env.FILES_API_URL || 'http://127.0.0.1:5001'}/files/:path*`
4. Tạo adapter auth Dify tối giản trong `src/libs/Auth.ts` và `src/context/AuthContext.tsx`:
   - Quản lý trạng thái login, user profile, workspace hiện tại thông qua cookie `access_token` hoặc endpoint `/console/api/account/profile`.

**Verify**: `pnpm -C saas check:types` → exit 0, không còn import `@clerk` hay `drizzle` trong `saas/src`.

---

### Step 3: Xây dựng Giao diện Xác thực (Auth) theo phong cách Boilerplate

1. Cập nhật `src/app/[locale]/(auth)/(center)/sign-in/[[...sign-in]]/page.tsx`:
   - Thay thế component `<SignIn />` của Clerk bằng Form đăng nhập hiện đại dùng Tailwind v4.
   - Thiết kế card thanh lịch ở chính giữa màn hình (theo `(center)/layout.tsx`), gồm các trường: Email, Password, Nút "Sign in", Link "Forgot password".
   - Gọi API `/console/api/login` của Dify khi submit; khi thành công redirect về `/[locale]/dashboard`.
2. Tạo trang `sign-up` và `forgot-password` với cùng phong cách card tối giản, responsive, hỗ trợ dark mode mượt mà.

**Verify**: Khởi động `pnpm -C saas dev:next`, truy cập `/en/sign-in` thấy form đăng nhập phong cách boilerplate hiện đại, không có lỗi console.

---

### Step 4: Thiết kế Dashboard Shell & Core Views theo phong cách Boilerplate

1. **Dashboard Shell (`src/app/[locale]/(auth)/dashboard/layout.tsx`):**
   - Thiết kế layout Dashboard chuẩn SaaS hiện đại:
     * **Sidebar bên trái**: Logo SaaS, Workspace Switcher, Menu danh mục (Studio / Apps, Datasets / Knowledge, Tools, Workspace Settings).
     * **Topbar phía trên**: Breadcrumbs, nút Dark/Light mode toggle, LocaleSwitcher, User Avatar & Dropdown (Hồ sơ, Đăng xuất).
     * **Khu vực nội dung chính**: Max-width thoáng đãng, padding chuẩn mực.
2. **Trang Danh sách Apps (`src/app/[locale]/(auth)/dashboard/page.tsx` hoặc `/apps`):**
   - Lấy danh sách apps từ `/console/api/apps`.
   - Hiển thị theo lưới Cards hiện đại: Tên app, Icon/Emoji, Mode (Chatbot, Workflow, Agent), Thời gian cập nhật, Menu thao tác (...).
   - Nút "Create New App" mở Modal tạo app được style đồng bộ bằng Tailwind v4.
3. **Trang Knowledge & Settings:**
   - Xây dựng trang danh sách Datasets và Cài đặt workspace theo bảng biểu (Tables) và tab giao diện tinh tế của boilerplate.

**Verify**: Chạy `pnpm -C saas build:next` → build thành công, render layout dashboard mượt mà.

---

### Step 5: Tích hợp Đóng gói (Encapsulated) Engine phức tạp (Workflow Canvas)

1. Khi người dùng mở một App loại Workflow (`/dashboard/apps/[appId]/workflow`):
   - Đưa ReactFlow canvas vào một container được cô lập style (`isolate`).
   - Chỉ import các component canvas thiết yếu của Dify workflow vào `src/components/workflow/`.
   - Tuyệt đối không để CSS của ReactFlow hoặc custom preflight ghi đè lên `global.css` của SaaS.

**Verify**: Mở trang workflow, canvas hiển thị và kéo thả node trơn tru mà không làm vỡ font chữ hay bố cục của thanh sidebar/topbar SaaS.

---

### Step 6: Đa ngôn ngữ (next-intl), Testing & Hoàn thiện CI

1. Đồng bộ các translation keys của Dify vào `src/locales/en.json`, `vi.json` theo định dạng ICU của `next-intl`.
2. Viết kiểm thử tự động:
   - Vitest component tests cho `BaseTemplate`, Auth Form, App Card.
   - Playwright E2E test cho luồng: Đăng nhập → Mở Dashboard → Tạo App mới.
3. Khóa gate chất lượng: `check:types`, `lint`, `test`, `build:next` đều exit 0.

**Verify**: `pnpm -C saas test` và `pnpm -C saas build` hoàn tất không có lỗi.

---

## Test plan

- Test unit: `saas/src/utils/Helpers.test.ts`, `saas/src/components/AuthForm.test.tsx`.
- Test E2E: `saas/tests/e2e/Auth.e2e.ts` kiểm tra login/logout trên server Next thật.
- Verification command:
  ```bash
  pnpm -C saas check:types && pnpm -C saas test
  ```

## Done criteria

- [ ] `saas` sạch, sử dụng Tailwind CSS v4 native (`@import 'tailwindcss';`).
- [ ] Giao diện (Marketing, Auth, Dashboard) mang đúng phong cách của `nextjs-saas-boilerplate`.
- [ ] Không còn phụ thuộc vào Clerk và PGlite/Drizzle demo.
- [ ] Đăng nhập, quản lý app và chuyển workspace hoạt động với Dify Backend.
- [ ] Workflow Canvas chạy ổn định trong container cô lập, không ảnh hưởng style toàn trang.
- [ ] `pnpm -C saas check:types`, `pnpm -C saas lint`, `pnpm -C saas test` exit 0.
- [ ] Cập nhật trạng thái trong `plans/README.md`.

## STOP conditions

- Dừng và báo cáo nếu:
  - Cần chỉnh sửa schema database hoặc Python code trong `api/` (vi phạm out-of-scope).
  - Xuất hiện xung đột không thể giải quyết giữa React 19 / Next 16 của boilerplate với các thư viện canvas node của Dify.
  - Phải ghi đè `global.css` bằng CSS cũ để render một component phụ.
