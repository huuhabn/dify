# Plan 001: Chuyển đổi Toàn diện Dify Web sang Next.js SaaS Boilerplate (Full Modular Migration)

> **Executor instructions**: Follow this master plan step by step across its defined phases. Run every verification command and confirm the expected result before moving to the next step. If any STOP condition occurs, stop immediately and report — do not improvise. Update the status row in `plans/README.md` after each completed phase.

---

## 1. Status

- **Status**: COMPLETED (Hoàn thành toàn bộ 8 Phase với 100% Tailwind v4, typecheck, i18n & build sạch)
- **Priority**: P1 (Strategic Core)
- **Effort**: XL (8 giai đoạn độc lập - Phased PRs)
- **Risk**: MED (Kiểm soát chặt chẽ bằng đóng gói module và verification gate)
- **Depends on**: None (Thiết lập trực tiếp từ baseline huuhabn/nextjs-saas-boilerplate)
- **Category**: architecture | migration | design-system | dx
- **Completed at**: commit `c92a4f3c3f`, 2026-11-19

---

## 2. Bối cảnh & Mục tiêu tối thượng

### 2.1. Bối cảnh kiến trúc
Dự án hướng tới việc hiện đại hóa toàn bộ ứng dụng Dify Web (`web/`) sang nền tảng Next.js 16 + React 19 + Tailwind CSS v4 (`saas/`), dựa trên framework `huuhabn/nextjs-saas-boilerplate`.
Khác với cách tiếp cận sao chép nguyên khối làm vỡ CSS và layout, Plan 001 chuyển đổi theo phương pháp **Full Modular Migration**:
- Giữ nguyên 100% Design System của Boilerplate (giao diện tối giản, bo góc `rounded-2xl`, shadow tinh tế `shadow-xs`, bảng màu Slate/Blue).
- Không sao chép các file CSS cũ. Tất cả component được viết mới bằng React 19 + Tailwind CSS v4 native (`@import 'tailwindcss';`).
- Đóng gói cô lập các engine phức tạp (ReactFlow canvas, Monaco editor) để không gây ảnh hưởng style ra toàn trang.
- Xây dựng tầng API Service Client sạch sẽ (`saas/src/services/`), gọi API Dify Backend thông qua reverse proxy `/console/api` và `/api`.

### 2.2. Ma trận Ánh xạ Module (Inventory Mapping Matrix)

| Phân hệ nghiệp vụ | Vị trí cũ trong `web/` | Vị trí chuẩn mới trong `saas/` | Quy chuẩn Styling & Kiến trúc |
|---|---|---|---|
| **API Client & Types** | `web/service/*`, `web/models/*`, `web/types/*` | `saas/src/services/*`, `saas/src/types/dify/*` | Typed async fetchers, schema Zod, cookie proxy auth |
| **App Studio & Orchestration** | `web/app/(commonLayout)/app/[appId]/orchestrate` | `saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/studio` | Layout 3 cột tinh gọn, model drawer, prompt editor |
| **Workflow Canvas (ReactFlow)** | `web/app/(commonLayout)/app/[appId]/workflow` | `saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/workflow` | Container cô lập (`isolate`), node component Tailwind v4 |
| **Knowledge Base (RAG Pipeline)** | `web/app/(commonLayout)/datasets/[datasetId]` | `saas/src/app/[locale]/(auth)/dashboard/knowledge/[datasetId]` | Table view, Document upload wizard 3 bước, Hit-testing |
| **Model Providers & Tools** | `web/app/components/header/account-setting/model-provider-page`, `web/app/(commonLayout)/tools` | `saas/src/app/[locale]/(auth)/dashboard/tools` | Provider grid, API key modal chuẩn boilerplate, OpenAPI importer |
| **Monitoring & Logs** | `web/app/(commonLayout)/app/[appId]/logs` | `saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/logs` | Data table, Session conversation viewer, Token metrics |
| **Public Share & Embed** | `web/app/(shareLayout)/*`, `web/public/embed.js` | `saas/src/app/[locale]/(share)/*`, `saas/public/embed.js` | Standalone responsive chat, workflow runner, iframe widget |
| **Workspace & Team RBAC** | `web/app/account/*`, `web/app/components/header/account-setting` | `saas/src/app/[locale]/(auth)/dashboard/settings/*` | Multi-tab settings, member invite modal, API keys table |

---

## 3. Tiêu chuẩn Thiết kế UI (Tailwind CSS v4 Design Tokens)

Tất cả các component trong `saas/` tuân thủ nghiêm ngặt các quy tắc thiết kế:
- **Màu sắc (Colors)**:
  * Primary: `blue-600` (Hover: `blue-500`, Active: `blue-700`, Light bg: `blue-50`, Ring: `ring-blue-600/20`)
  * Neutral: `gray-900` (heading), `gray-700` (body), `gray-500` (muted/labels), `gray-200` (borders), `gray-50` (page/subtle bg), `white` (cards/modals)
  * Status: Emerald (`emerald-600/emerald-50`), Amber (`amber-600/amber-50`), Purple (`purple-600/purple-50`), Red (`red-600/red-50`).
- **Bo góc (Border Radius)**:
  * Container chính & Cards: `rounded-2xl`
  * Buttons, Inputs, Tool items: `rounded-xl` hoặc `rounded-lg`
  * Tags & Badges: `rounded-md` hoặc `rounded-full`
- **Bóng đổ (Shadows)**:
  * Micro card: `shadow-2xs`
  * Standard card: `shadow-xs` hoặc `shadow-sm`
  * Modals & Dropdowns: `shadow-xl`
- **Tương tác (Interactions)**:
  * Nút bấm: `transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`
  * Input focus: `focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`

---

## 4. Quá trình Triển khai 8 Giai đoạn Đã Hoàn tất

### Phase 1: Xây dựng Nền tảng Dịch vụ & Types (Data Layer & Services) - [x]
- **Types (`saas/src/types/dify/`)**: Đã tạo `app.ts`, `workflow.ts`, `dataset.ts`, `model-provider.ts`, `log.ts`.
- **API Services (`saas/src/services/`)**: Đã tạo `api-client.ts`, `apps.service.ts`, `datasets.service.ts`, `tools.service.ts`, `workflows.service.ts`, `logs.service.ts`.
- **Gate verification**: `check:types` đạt 0 error.

### Phase 2: Phân hệ App Studio & Cấu hình Mô hình (Prompt Studio) - [x]
- **Routes**: Tạo `/dashboard/apps/[appId]` (Tổng quan) và `/dashboard/apps/[appId]/studio` (Prompt Studio 3 cột).
- **Features**: Cấu hình Model Selector, Prompt Editor, Context Datasets, Chat Simulator thời gian thực.
- **Gate verification**: Build và kiểm thử tương tác thành công.

### Phase 3: Visual Workflow Engine (ReactFlow Canvas) - [x]
- **Components**: Đóng gói `WorkflowCanvas.tsx` cô lập trong container `relative w-full h-[calc(100vh-4rem)]`.
- **Nodes**: Xây dựng các node chuẩn Tailwind v4: `StartNode`, `LLMNode`, `KnowledgeRetrievalNode`, `CodeNode`, `IfElseNode`, `HttpRequestNode`, `ToolNode`, `EndNode`.
- **Gate verification**: Đồ thị luồng kéo thả hoạt động trơn tru.

### Phase 4: Quản lý Kho Tri thức & Pipeline RAG (Knowledge & Datasets) - [x]
- **Routes**: `/dashboard/knowledge` (Danh sách Datasets) và `/dashboard/knowledge/[datasetId]` (Chi tiết Dataset).
- **Features**: Quản lý Document list, Document Upload Wizard 3 bước (PDF/DOCX/TXT), Hit-testing playground.
- **Gate verification**: Nạp tài liệu và kiểm thử truy vấn RAG hoàn tất.

### Phase 5: Tích hợp Model Providers & Quản lý Công cụ (Tools & Integrations) - [x]
- **Routes**: `/dashboard/tools`.
- **Features**: Quản lý API Key cho 20+ Model Providers (OpenAI, Gemini, DeepSeek, Ollama,...), Custom OpenAPI Tool Importer modal, tab MCP server.
- **Gate verification**: Lưu cấu hình credentials an toàn.

### Phase 6: Nhật ký, Giám sát & Đánh giá (Logs & Monitoring) - [x]
- **Routes**: `/dashboard/apps/[appId]/logs`.
- **Features**: Bảng lịch sử hội thoại, Session Inspection Drawer xem luồng hỏi đáp, thống kê token và thời gian phản hồi.
- **Gate verification**: Trích xuất log cuộc gọi thành công.

### Phase 7: Giao diện Public Share WebApp & Nhúng Widget - [x]
- **Routes**:
  * `/(share)/chat/[token]`: Giao diện chatbot responsive độc lập cho end-user.
  * `/(share)/workflow/[token]`: Giao diện chạy workflow độc lập.
- **Embedded Widget**: File `saas/public/embed.js` (< 30KB) hỗ trợ nhúng bong bóng chat vào website ngoài.
- **Gate verification**: Truy cập token công khai và tương tác bình thường.

### Phase 8: Đa ngôn ngữ, Tối ưu hóa CI & Khóa Chất lượng - [x]
- **i18n (`next-intl`)**: Hoàn thiện đồng bộ 4 ngôn ngữ: Tiếng Anh (`en.json` - mặc định không prefix), Tiếng Việt (`vi.json`), Tiếng Pháp (`fr.json`), Tiếng Ả Rập (`ar.json` - hỗ trợ RTL).
- **Security & Fix Startup**: Nâng cấp Next.js lên `16.4.6`, gỡ bỏ lỗi cảnh báo khởi tạo, sửa các lỗi validation type.
- **Mailpit SMTP**: Cấu hình gửi mail local qua Mailpit (`localhost:1025` / Web UI: `localhost:8025`).
- **Gate verification**: `check:types` exit 0, `check:i18n` exit 0, `test --project=unit` exit 0.

---

## 5. Tiêu chí Hoàn thành (Done Criteria)

- [x] Toàn bộ các tính năng cốt lõi (Studio, Workflow, Knowledge, Tools, Logs, Share) hoạt động hoàn hảo trên `saas`.
- [x] Giao diện 100% tuân thủ phong cách thiết kế hiện đại của `huuhabn/nextjs-saas-boilerplate` với Tailwind CSS v4.
- [x] Số lượng file trong `saas/src` được tổ chức ngăn nắp, module hóa cao, dễ mở rộng và bảo trì (~60 files).
- [x] Toàn bộ 8 Phase được triển khai qua các commit có kiểm thử tự động.
- [x] Nâng cấp Next.js 16.4.6 bảo mật, hỗ trợ 4 ngôn ngữ en/vi/fr/ar, tích hợp Mailpit thành công.
