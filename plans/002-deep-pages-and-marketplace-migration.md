# Plan 002: Chuyển đổi Toàn diện Các Trang Chuyên sâu & Tiện ích Mở rộng từ Dify Web sang SaaS

> **Executor instructions**: Follow this master plan step by step across its 5 defined phases. Run every verification command and confirm the expected result before moving to the next phase. If any STOP condition occurs, stop immediately and report — do not improvise. Update the status row in `plans/README.md` after each completed phase.
>
> **Drift check (run first)**:
> ```bash
> git status
> bun -C saas run check:types
> bun -C saas run check:i18n
> ```
> Confirm that `saas` remains clean with zero type and i18n errors before starting any changes.

---

## 1. Status

- **Status**: COMPLETED (Đã hoàn thành và kiểm thử sạch sẽ 5 Phase trên 4 ngôn ngữ en/vi/fr/ar)
- **Priority**: P1 (Strategic Functional Completeness)
- **Effort**: L (5 giai đoạn độc lập - Phased execution)
- **Risk**: LOW (Kiểm soát chặt chẽ bằng modular layout, typed services và Quality Gates)
- **Depends on**: Plan 001 (Đã hoàn thành toàn bộ 8 Phase nền tảng cốt lõi)
- **Category**: architecture | feature | design-system | dx
- **Planned at**: commit `c92a4f3c3f`, 2026-11-19

---

## 2. Bối cảnh & Các Quyết định Thiết kế đã Thống nhất

### 2.1. Bối cảnh
Plan 001 đã chuyển đổi thành công 100% các phân hệ cốt lõi của Dify (Studio, Workflow Engine, Datasets, Tools, Logs, Public Share WebApps, RBAC Members, Đa ngôn ngữ en/vi/fr/ar) sang Next.js 16 + Tailwind CSS v4.
Tuy nhiên, trong `web/` gốc còn các trang và tính năng chuyên sâu:
1. **Explore & App Templates**: Kho ứng dụng mẫu có sẵn giúp người dùng tạo app chỉ với 1 click.
2. **Plugin Marketplace & Manager**: Kho tiện ích mở rộng và quản lý plugin daemon của Dify.
3. **Document Segments Editor**: Trình xem và chỉnh sửa sâu từng đoạn text/vector chunk bên trong một tài liệu tri thức.
4. **Annotations & Hit-testing Cache**: Quản lý các cặp Hỏi - Đáp mẫu (Q&A Cache) để tối ưu độ chính xác và giảm chi phí LLM.
5. **Access Point & Human-in-the-Loop Web Form**: Cấu hình branding/custom domain cho WebApp và form điền thông tin chờ người duyệt trong Workflow.

### 2.2. Quyết định Thiết kế đã Thống nhất (/grill-me)
1. **Phạm vi (Scope)**: Chuyển đổi toàn diện toàn bộ các trang chuyên sâu còn lại theo lộ trình 5 Phase độc lập.
2. **Thanh điều hướng (Navigation Hierarchy)**:
   - Tách thành các mục độc lập trên Sidebar chính của `DashboardShell`:
     * 🚀 **Studio & Apps** (`/dashboard`)
     * 📚 **Knowledge & Datasets** (`/dashboard/knowledge`)
     * 🧭 **Explore & Templates** (`/dashboard/explore`)
     * 🧩 **Plugins Store** (`/dashboard/plugins`)
     * 🛠️ **Tools & Providers** (`/dashboard/tools`)
     * 🎯 **Annotations & Q&A** (`/dashboard/annotations`)
     * ⚙️ **Settings & Members** (`/dashboard/settings/members`)
3. **Trình biên tập Segments Tri thức**: Bố cục 2 cột (Master-Detail): Cột trái danh sách segments có tìm kiếm/filter, cột phải form xem và chỉnh sửa chi tiết text, keywords, hit count và tokens.
4. **Phạm vi Annotations**: Trang quản lý cấp Workspace (`/dashboard/annotations`) có selector chuyển nhanh giữa các Apps, hiển thị thống kê cache hits và chỉnh sửa câu trả lời chuẩn.

---

## 3. Tiêu chuẩn Thiết kế UI (Boilerplate Design Standards)

Tất cả các component mới phải tuân thủ nghiêm ngặt các quy tắc thiết kế của Boilerplate:
- **Tailwind CSS v4 Utility Classes**: Dùng cú pháp native `@import 'tailwindcss';`, không dùng class v3 cũ.
- **Bo góc (Radius)**: Container/Card: `rounded-2xl`, Controls/Buttons: `rounded-xl`, Badges: `rounded-md` hoặc `rounded-full`.
- **Màu sắc (Colors)**:
  * Primary: `blue-600` (Hover: `blue-500`, Active: `blue-700`, Bg: `blue-50`)
  * Neutral: `gray-900` (text chính), `gray-700` (body), `gray-500` (phụ/label), `gray-200` (border), `gray-50` (background panel)
  * Badges: `emerald-600/emerald-50` (Active/Published), `amber-600/amber-50` (Pending/Draft), `purple-600/purple-50` (Template/Plugin).
- **TypeScript**: 100% type-safety, không dùng `any` bừa bãi, đặt types trong `saas/src/types/dify/`.
- **i18n (next-intl)**: Mọi chuỗi hiển thị đều phải khai báo qua file ngôn ngữ (`en.json`, `vi.json`, `fr.json`, `ar.json`), không hardcode chuỗi người dùng.

---

## 4. Kế hoạch Triển khai 5 Giai đoạn Chi tiết

### Phase 1: Kho Ứng dụng Mẫu (Explore & App Templates Catalog)

#### Mục tiêu:
Cung cấp giao diện duyệt kho ứng dụng mẫu theo danh mục chuyên ngành và tính năng "1-click Clone & Install" vào Workspace.

#### Các bước thực hiện:
1. **Types & Services**:
   - Mở rộng `saas/src/types/dify/app.ts` bổ sung `AppTemplate`, `AppTemplateCategory`.
   - Bổ sung vào `saas/src/services/apps.service.ts`:
     * `listRecommendedApps(category?: string): Promise<AppTemplate[]>` (gọi `/console/api/explore/apps`).
     * `installAppFromTemplate(templateId: string, name?: string): Promise<App>` (gọi `/console/api/explore/installed-apps`).
2. **Trang Explore (`saas/src/app/[locale]/(auth)/dashboard/explore/page.tsx`)**:
   - Header: Tiêu đề "Khám phá & Templates", thanh tìm kiếm mẫu theo tên/tính năng.
   - Filter Chips: Danh mục (Tất cả, Trợ lý viết lách, Dịch thuật, Phân tích dữ liệu, Lập trình, Chăm sóc khách hàng, Nhân sự).
   - Grid Card danh sách Templates: Icon, Tên template, Mô tả ngắn, Mode badge (Chat, Workflow, Agent), Tác giả.
   - Modal xem trước chi tiết Template: Hiển thị Prompt mẫu, danh sách Model đề xuất, danh sách Tools kết nối kèm nút "Dùng Template này" (Tự động nhân bản vào App list).
3. **Cập nhật Navigation Sidebar (`saas/src/components/DashboardShell.tsx`)**:
   - Thêm icon và route `Explore & Templates` (`/dashboard/explore`) vào danh sách điều hướng.
4. **Đồng bộ đa ngôn ngữ**:
   - Thêm namespace `Explore` vào `en.json`, `vi.json`, `fr.json`, `ar.json`.

#### Verification Gate Phase 1:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```
*Tiêu chí đạt*: Mở `/dashboard/explore` lọc danh mục, hiển thị card mẫu, bấm "Dùng Template" tạo thành công app mới trong `/dashboard`.

---

### Phase 2: Chợ Tiện ích Mở rộng & Quản lý Plugin (Plugin Marketplace)

#### Mục tiêu:
Cung cấp giao diện quản lý và khám phá các Plugin tích hợp của Dify (Plugin daemon).

#### Các bước thực hiện:
1. **Types & Services**:
   - Tạo `saas/src/types/dify/plugin.ts`:
     * `Plugin`, `PluginCategory`, `PluginDeclaration`, `PluginInstallStatus`.
   - Tạo `saas/src/services/plugins.service.ts`:
     * `listInstalledPlugins(): Promise<Plugin[]>` (gọi `/console/api/workspaces/current/plugin/list`).
     * `listMarketplacePlugins(category?: string): Promise<Plugin[]>` (gọi marketplace catalog).
     * `installPlugin(pluginId: string): Promise<void>`.
     * `uninstallPlugin(pluginId: string): Promise<void>`.
2. **Trang Plugins (`saas/src/app/[locale]/(auth)/dashboard/plugins/page.tsx`)**:
   - 2 Tabs:
     * **Đã cài đặt (Installed)**: Danh sách plugin đang kích hoạt, phiên bản, nút "Cấu hình" (Modal nhập credentials/endpoint) và nút "Gỡ cài đặt".
     * **Khám phá (Marketplace)**: Duyệt các plugin từ cộng đồng (Search providers, Document parsers, Web scrapers, Vector databases, Notification bots).
   - Modal chi tiết Plugin: Xem README, Permissions yêu cầu, Tác giả, và nút "Cài đặt vào Workspace".
3. **Cập nhật Navigation Sidebar (`saas/src/components/DashboardShell.tsx`)**:
   - Thêm mục `Plugins Store` (`/dashboard/plugins`) trên Sidebar chính.
4. **Đồng bộ i18n**:
   - Bổ sung namespace `Plugins` vào 4 ngôn ngữ (`en`, `vi`, `fr`, `ar`).

#### Verification Gate Phase 2:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```
*Tiêu chí đạt*: Chuyển đổi mượt mà giữa tab Đã cài đặt và Marketplace, mở modal cấu hình plugin hiển thị đúng schema.

---

### Phase 3: Trình Biên tập Phân đoạn Tài liệu Chuyên sâu (Document Segments Editor)

#### Mục tiêu:
Cho phép người dùng xem, chỉnh sửa nội dung, tối ưu keywords và bật/tắt từng vector segment của tài liệu tri thức.

#### Các bước thực hiện:
1. **Types & Services**:
   - Mở rộng `saas/src/types/dify/dataset.ts`:
     * `DocumentSegment`: `id`, `position`, `content`, `word_count`, `tokens`, `keywords`, `hit_count`, `enabled`, `status`.
   - Bổ sung vào `saas/src/services/datasets.service.ts`:
     * `listDocumentSegments(datasetId: string, documentId: string, query?: string): Promise<DocumentSegment[]>`.
     * `updateSegment(datasetId: string, documentId: string, segmentId: string, data: Partial<DocumentSegment>): Promise<DocumentSegment>`.
     * `createSegment(datasetId: string, documentId: string, content: string, keywords?: string[]): Promise<DocumentSegment>`.
     * `deleteSegment(datasetId: string, documentId: string, segmentId: string): Promise<void>`.
2. **Trang Chi tiết Segments (`saas/src/app/[locale]/(auth)/dashboard/knowledge/[datasetId]/documents/[documentId]/page.tsx`)**:
   - **Thanh Breadcrumb & Topbar**: Quay về Dataset, Tên tài liệu, Tổng số segments, Nút "+ Thêm phân đoạn".
   - **Bố cục 2 Cột (Master-Detail)**:
     * **Cột trái (Danh sách Segments - 40% width)**: Ô tìm kiếm từ khóa, danh sách các thẻ segment cuộn độc lập. Mỗi item hiển thị số thứ tự `#1`, độ dài ký tự/token, trích đoạn ngắn, nút toggle bật/tắt.
     * **Cột phải (Trình biên tập chi tiết - 60% width)**:
       - Textarea chỉnh sửa nội dung đoạn văn phong phú.
       - Khu vực quản lý Từ khóa (Keywords / Tags): Thêm/xóa keyword để tối ưu truy vấn lai (Hybrid Search).
       - Thống kê Segment: Số lần trích xuất thành công (Hit count), Token ước tính.
       - Nút "Lưu thay đổi", "Đặt lại", hoặc "Xóa phân đoạn này".
3. **Đồng bộ i18n**:
   - Bổ sung namespace `DocumentSegments` vào các file JSON locale.

#### Verification Gate Phase 3:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```
*Tiêu chí đạt*: Vào trang chi tiết tài liệu, click chọn segment bên trái lập tức hiển thị nội dung bên phải; sửa text và bấm lưu gọi đúng API cập nhật.

---

### Phase 4: Quản lý Annotations & Phản hồi Chuẩn Toàn Workspace (Annotations & QA Cache)

#### Mục tiêu:
Cung cấp bảng điều khiển quản lý bộ nhớ đệm câu trả lời mẫu cho Chatbot (Annotation hit cache) ở cấp độ toàn Workspace.

#### Các bước thực hiện:
1. **Types & Services**:
   - Tạo `saas/src/types/dify/annotation.ts`:
     * `AnnotationItem`: `id`, `app_id`, `app_name`, `question`, `answer`, `hit_count`, `created_at`.
     * `AnnotationHitHistory`: Lịch sử câu hỏi người dùng khớp với annotation.
   - Tạo `saas/src/services/annotations.service.ts`:
     * `listWorkspaceAnnotations(appId?: string, query?: string): Promise<AnnotationItem[]>`.
     * `createAnnotation(appId: string, question: string, answer: string): Promise<AnnotationItem>`.
     * `updateAnnotation(appId: string, annotationId: string, question: string, answer: string): Promise<AnnotationItem>`.
     * `deleteAnnotation(appId: string, annotationId: string): Promise<void>`.
2. **Trang Annotations (`saas/src/app/[locale]/(auth)/dashboard/annotations/page.tsx`)**:
   - Header thống kê: Tổng số Annotations, Tổng lượt Hit cache tiết kiệm token, Tỷ lệ cải thiện độ chính xác.
   - Bộ lọc: Selector chọn App (Tất cả Apps hoặc 1 App cụ thể), Ô tìm kiếm câu hỏi.
   - Bảng dữ liệu Annotations: Câu hỏi mẫu (Question), Câu trả lời chuẩn (Answer), Tên App áp dụng, Số lượt Hit, Thời gian tạo, Nút Sửa / Xóa.
   - Modal Thêm/Sửa Annotation: Form nhập Câu hỏi kích hoạt và Câu trả lời mong muốn.
3. **Cập nhật Navigation Sidebar (`saas/src/components/DashboardShell.tsx`)**:
   - Thêm mục `Annotations & Q&A` (`/dashboard/annotations`) vào Sidebar chính.
4. **Đồng bộ i18n**:
   - Bổ sung namespace `Annotations` vào 4 ngôn ngữ (`en`, `vi`, `fr`, `ar`).

#### Verification Gate Phase 4:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```
*Tiêu chí đạt*: Xem được danh sách Q&A cache, lọc theo từng App, tạo mới câu trả lời mẫu thành công.

---

### Phase 5: Xuất bản Nâng cao (Access Point/Custom Domain) & Human-in-the-Loop Web Form

#### Mục tiêu:
Cấu hình tuỳ biến thương hiệu/tên miền cho Public WebApp và giao diện điền Form chờ người duyệt trong Workflow.

#### Các bước thực hiện:
1. **Trang Cấu hình Access Point & Branding (`saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/access-point/page.tsx`)**:
   - Cấu hình Tên miền tuỳ chỉnh (Custom Domain): Nhập CNAME, trạng thái SSL.
   - Tùy biến thương hiệu WebApp: Upload Logo, Favicon, Tên tiêu đề WebApp, Màu chủ đạo (Brand Accent Color).
   - Thiết lập bảo mật & Quyền truy cập: Bật/tắt yêu cầu đăng nhập, Danh sách IP được phép (Whitelist), Giới hạn số lượt gọi/phút (Rate Limiting).
2. **Giao diện Human-in-the-Loop Web Form (`saas/src/app/[locale]/(share)/form/[token]/page.tsx`)**:
   - Trang độc lập dành cho người duyệt/cung cấp thông tin trong luồng Workflow.
   - Render động các trường Form dựa theo cấu hình node: Text input, Select dropdown, File upload, Textarea, Confirmation checkbox.
   - Nút "Submit Form & Continue Workflow" gửi dữ liệu về backend tiếp tục tiến trình chạy.
3. **Đồng bộ i18n**:
   - Bổ sung các namespace `AccessPoint` và `HumanInputForm` vào các file JSON locale.

#### Verification Gate Phase 5:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
bun -C saas run build
```
*Tiêu chí đạt*: Build production hoàn tất 100% routes tĩnh và động, không lỗi TypeScript hoặc CSS.

---

## 5. Ma trận Kiểm thử & Khóa Chất lượng Toàn diện (Final Quality Gate)

Sau khi hoàn thành cả 5 Phase, chạy quy trình nghiệm thu đầy đủ:

1. **Kiểm tra kiểu dữ liệu**:
   ```bash
   bun -C saas run check:types
   ```
   *Yêu cầu*: Exit code 0, 0 error.
2. **Kiểm tra đa ngôn ngữ**:
   ```bash
   bun -C saas run check:i18n
   ```
   *Yêu cầu*: 0 missing keys, 0 unused keys trên cả 4 ngôn ngữ (`en`, `vi`, `fr`, `ar`).
3. **Kiểm tra Unit test**:
   ```bash
   bun -C saas run test --project=unit
   ```
   *Yêu cầu*: Tất cả các unit test đều pass.
4. **Kiểm tra Production Build**:
   ```bash
   bun -C saas run build
   ```
   *Yêu cầu*: Build production thành công sạch sẽ.

---

## 6. Điều kiện Dừng & Phòng ngừa Rủi ro (STOP Conditions)

Dừng lại ngay lập tức và báo cáo nếu:
1. Có bất kỳ hành động sao chép trực tiếp file CSS cũ hoặc import css module từ `web/` làm phá vỡ Tailwind CSS v4.
2. Endpoint API của Dify Backend yêu cầu quyền admin cấp cao ngoài phạm vi session mà không có cơ chế fallback.
3. Xuất hiện mã lệnh sửa đổi file backend ngoài phạm vi được phân công (chỉ thao tác trong `saas/`).

---

## 7. Tiêu chí Hoàn thành (Done Criteria)

- [ ] Phân hệ Explore & App Templates hoạt động đầy đủ tại `/dashboard/explore`.
- [ ] Phân hệ Plugin Marketplace hoạt động tại `/dashboard/plugins`.
- [ ] Trình biên tập Segments tài liệu Master-Detail hoạt động tại `/dashboard/knowledge/[datasetId]/documents/[documentId]`.
- [ ] Quản lý Annotations toàn diện hoạt động tại `/dashboard/annotations`.
- [ ] Cấu hình Access Point & Branding hoạt động tại `/dashboard/apps/[appId]/access-point`.
- [ ] Giao diện Human-in-the-Loop Web Form hoạt động tại `/(share)/form/[token]`.
- [ ] Thanh Sidebar của `DashboardShell` cập nhật đầy đủ các mục điều hướng độc lập.
- [ ] Đầy đủ 4 ngôn ngữ `en`, `vi`, `fr`, `ar` (hỗ trợ RTL).
- [ ] `bun -C saas run check:types` và `bun -C saas run build` thành công 100%.
