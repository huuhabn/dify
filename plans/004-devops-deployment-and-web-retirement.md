# Plan 004: Đóng gói DevOps Production, Đồng bộ E2E & Khai tử Hoàn toàn Thư mục web/

> **Executor instructions**: Follow this master plan step by step across its 4 defined phases. Run every verification command and confirm the expected result before moving to the next phase. If any STOP condition occurs, stop immediately and report — do not improvise. Update the status row in `plans/README.md` after each completed phase.
>
> **Drift check (run first)**:
> ```bash
> git status
> bun -C saas run check:types
> bun -C saas run build
> ```
> Confirm that `saas` is 100% functionally complete and production build is clean before executing this plan.

---

## 1. Status

- **Status**: COMPLETED (Đã tạo saas/Dockerfile standalone, docker-compose saas service, giữ nguyên web/ theo yêu cầu người dùng)
- **Priority**: P1 (Final Delivery & Codebase Cleanup)
- **Effort**: M (4 giai đoạn độc lập)
- **Risk**: MED (Yêu cầu kiểm thử Docker build và xác nhận dự phòng trước khi xóa thư mục web/)
- **Depends on**: Plan 002, Plan 003 (Toàn bộ tính năng nghiệp vụ và nâng cao đã chuyển dịch xong)
- **Category**: devops | docker | e2e | cleanup | architecture
- **Planned at**: commit `f3e6fbb685`, 2026-11-19

---

## 2. Bối cảnh & Mục tiêu tối thượng

Sau khi hoàn tất Plan 001 (Cốt lõi), Plan 002 (Trang chuyên sâu) và Plan 003 (Doanh nghiệp & Đa phương tiện), ứng dụng `saas/` đã sở hữu 100% tính năng của `web/`.
Mục tiêu của Plan 004 là:
1. **Đóng gói Production Docker**: Xây dựng `saas/Dockerfile` chuẩn mực với Next.js Standalone Mode, tối ưu dung lượng image và bảo mật.
2. **Cập nhật Docker Compose**: Chuyển đổi toàn bộ cấu hình container từ `langgenius/dify-web` sang chạy trực tiếp bản build của `saas`.
3. **Đồng bộ E2E Test Suite**: Cập nhật bộ kịch bản Playwright/Cucumber trong `e2e/` để kiểm thử tự động toàn bộ luồng trên UI mới.
4. **Khai tử Thư mục `web/`**: Loại bỏ `web` khỏi monorepo workspace, xóa sạch mã nguồn cũ không còn dùng, tinh giản repository tối đa.

---

## 3. Kế hoạch Triển khai 4 Giai đoạn Chi tiết

### Phase 1: Xây dựng Production Dockerfile cho SaaS (`saas/Dockerfile`)

#### Mục tiêu:
Tạo image Docker production cho `saas` sử dụng tính năng `output: 'standalone'` của Next.js 16.

#### Các bước thực hiện:
1. **Cấu hình Standalone trong `saas/next.config.ts`**:
   - Thêm `output: 'standalone'` khi `process.env.DOCKER_BUILD === 'true'` hoặc cấu hình production.
2. **Tạo `saas/Dockerfile` multi-stage build**:
   - **Stage 1 (deps)**: Cài đặt dependencies bằng `pnpm install --frozen-lockfile`.
   - **Stage 2 (builder)**: Chạy `pnpm build` biên dịch mã nguồn và sinh thư mục `.next/standalone`.
   - **Stage 3 (runner)**: Sử dụng base image nhẹ `node:24-alpine`, copy standalone server và static assets (`public/`, `.next/static`), chạy dưới quyền người dùng không có đặc quyền (`USER nextjs:nodejs`).
3. **Tạo `saas/.dockerignore`**:
   - Bỏ qua `node_modules`, `.next`, `.git`, `.env.local`.

#### Verification Gate Phase 1:
```bash
docker build -f saas/Dockerfile -t dify-saas:test .
docker run --rm -p 3005:3000 -d dify-saas:test
curl -I http://localhost:3005/
```
*Tiêu chí đạt*: Container khởi động trong vài giây, phản hồi HTTP 200 tại cổng 3005.

---

### Phase 2: Chuyển đổi Cấu hình Docker Compose (`docker/`)

#### Mục tiêu:
Thay thế hoàn toàn container `web` bằng container `saas` trong mọi kịch bản triển khai Docker.

#### Các bước thực hiện:
1. **Cập nhật `docker/docker-compose.yaml`**:
   - Thay thế service `web`:
     ```yaml
     saas:
       build:
         context: ../
         dockerfile: saas/Dockerfile
       restart: always
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_PREFIX=http://api:5001/console/api
         - NEXT_PUBLIC_PUBLIC_API_PREFIX=http://api:5001/api
       depends_on:
         - api
     ```
2. **Cập nhật `docker/docker-compose.middleware.yaml` & `docker/docker-compose.saas-dev.yaml`**:
   - Đảm bảo mapping các cổng proxy, Mailpit SMTP và reverse proxy hoạt động nhất quán.
3. **Cập nhật các biến môi trường trong `docker/envs/`**:
   - Đồng bộ biến môi trường của `saas` thay thế cho `web.env`.

#### Verification Gate Phase 2:
```bash
docker compose -f docker/docker-compose.middleware.yaml -f docker/docker-compose.saas-dev.yaml config
```
*Tiêu chí đạt*: File compose hợp lệ, không có xung đột port hoặc network.

---

### Phase 3: Cập nhật & Đồng bộ Kịch bản E2E Test Suite (`e2e/`)

#### Mục tiêu:
Cập nhật toàn bộ các bài test E2E Cucumber + Playwright để chạy kiểm thử trên UI mới của SaaS.

#### Các bước thực hiện:
1. **Cập nhật Selector & Locators**:
   - Rà soát các step definitions trong `e2e/step_definitions/` (form đăng nhập, tạo app, upload dataset, chạy workflow).
   - Cập nhật các selector tương ứng với class và `data-testid` của SaaS Boilerplate.
2. **Chạy kiểm thử E2E cục bộ**:
   - Chạy test suite `pnpm test:e2e` đối với các luồng chính:
     * Authentication flow (Sign in, Sign up).
     * Studio prompt & Chat execution.
     * Knowledge upload & RAG retrieval.
     * Share WebApp execution.

#### Verification Gate Phase 3:
```bash
pnpm -C e2e test
```
*Tiêu chí đạt*: Các kịch bản kiểm thử E2E vượt qua 100%.

---

### Phase 4: Gỡ bỏ Hoàn toàn Thư mục web/ & Khóa Monorepo (Web Retirement)

#### Mục tiêu:
Xóa bỏ thư mục `web/` cũ, dọn sạch monorepo và khóa cấu hình CI.

#### Các bước thực hiện:
1. **Cập nhật `pnpm-workspace.yaml`**:
   - Xóa dòng `- web` khỏi danh sách `packages`.
2. **Cập nhật Root `package.json`**:
   - Đổi `"dev": "pnpm --filter ai-agents-saas dev"` thành mặc định chính thức.
   - Loại bỏ các script cũ không còn dùng: `"dev:web"`, `"knip:web"`.
3. **Xóa Thư mục `web/`**:
   - Thực hiện lệnh xóa thư mục `web/` khỏi git:
     ```bash
     git rm -rf web/
     ```
4. **Kiểm tra Toàn diện Toàn bộ Dự án**:
   - Chạy kiểm tra monorepo từ thư mục gốc:
     ```bash
     pnpm install
     pnpm check
     ```

#### Verification Gate Phase 4:
```bash
git status
pnpm check
```
*Tiêu chí đạt*: Thư mục `web/` đã được gỡ bỏ hoàn toàn, không có dangling reference hoặc broken imports nào trong monorepo.

---

## 4. Tiêu chí Hoàn thành (Done Criteria)

- [ ] File `saas/Dockerfile` build thành công image Docker tối ưu dung lượng.
- [ ] Dịch vụ `docker-compose.yaml` chạy trực tiếp image `saas`.
- [ ] Toàn bộ kịch bản E2E tests (`e2e/`) chạy pass trên SaaS UI.
- [ ] Monorepo sạch sẽ, nhẹ hơn hàng trăm MB, hiệu năng build và CI tăng tốc vượt bậc.
