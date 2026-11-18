# Plan 003: Chuyển đổi toàn diện Dify Web sang Next.js SaaS Boilerplate (Full Modular Migration)

> **Executor instructions**: Follow this master plan step by step across its defined phases. Run every verification command and confirm the expected result before moving to the next step. If any STOP condition occurs, stop immediately and report — do not improvise. Update the status row in `plans/README.md` after each completed phase.
>
> **Drift check (run first)**: `git diff --stat a6841b997e..HEAD -- saas plans`
> Confirm that `saas` remains on the clean Tailwind CSS v4 foundation (48 files in `saas/src/`) established in Plan 002.

## Status

- **Priority**: P1 (Strategic Core)
- **Effort**: XL (8 giai đoạn độc lập - Phased PRs)
- **Risk**: MED (Kiểm soát chặt chẽ bằng đóng gói module và verification gate)
- **Depends on**: Plan 002 (Đã hoàn thành các bước 1-4: Baseline, Auth, Dify Proxy, Dashboard Shell)
- **Category**: architecture | migration | design-system | dx
- **Planned at**: commit `a6841b997e`, 2026-11-18

---

## 1. Bối cảnh & Mục tiêu tối thượng

### 1.1. Bài học xương máu từ Plan 001
- **Plan 001 thất bại vì**: Sao chép cơ học hơn 8.700 file từ `web/` sang `saas/`, nhập đè `global.css` bằng `dify/globals.css`, mang theo hệ thống CSS reset cũ, Tailwind CSS v3 tùy biến và CSS Modules rải rác. Kết quả là giao diện bị vỡ hoàn toàn, mất phong cách hiện đại của boilerplate `huuhabn/nextjs-saas-boilerplate`, và tạo ra một codebase khổng lồ không thể bảo trì.
- **Thành quả của Plan 002**: Đã khôi phục sạch sẽ baseline của boilerplate, xây dựng khung sườn `DashboardShell` (Sidebar, Topbar, Workspace Switcher), Form xác thực Dify (`SignInForm`), các trang Core SaaS (`AppsView`, `Knowledge`, `Tools`, `UserProfile`) với **chỉ 48 file nguồn** trong `saas/src`, dùng 100% Tailwind CSS v4 native (`@import 'tailwindcss';`), build production đạt 30/30 static routes sạch sẽ.

### 1.2. Mục tiêu của Plan 003
Chuyển đổi **toàn bộ tính năng nghiệp vụ của Dify Web** sang `saas/` một cách bài bản, thanh lịch, theo đúng tiêu chuẩn kiến trúc:
1. **100% Giữ nguyên Design System của Boilerplate**: Giao diện tối giản, bo góc chuẩn mực (`rounded-2xl` cho card/modal, `rounded-xl` cho controls), hiệu ứng shadow tinh tế (`shadow-2xs`, `shadow-xs`), bảng màu Slate/Blue hiện đại.
2. **Không copy rác**: Không bê nguyên các folder CSS cũ hay các thư viện tiện ích thừa. Mọi component mới đều viết bằng React 19 + Tailwind CSS v4.
3. **Đóng gói engine phức tạp (Encapsulation)**: Workflow ReactFlow canvas và Monaco editor được cô lập trong container riêng biệt, tuyệt đối không gây side-effect hay xung đột style ra ngoài toàn trang.
4. **Clean API Service Layer**: Thay thế các hook SWR phân tán cũ bằng tầng `saas/src/services/` chuẩn hóa, gọi API Dify Backend thông qua reverse proxy `/console/api` và `/api`.

---

## 2. Ma trận Ánh xạ Module (Inventory Mapping Matrix)

Toàn bộ các phân hệ từ `web/` được cấu trúc lại vào `saas/` như sau:

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

Tất cả các component được tạo mới trong `saas/` phải tuân thủ nghiêm ngặt các quy tắc thiết kế:

- **Màu sắc (Colors)**:
  * Primary: `blue-600` (Hover: `blue-500`, Active: `blue-700`, Light bg: `blue-50`, Ring: `ring-blue-600/20`)
  * Neutral: `gray-900` (heading), `gray-700` (body), `gray-500` (muted/labels), `gray-200` (borders), `gray-50` (page/subtle bg), `white` (cards/modals)
  * Status: Emerald cho Active/Success (`emerald-600`/`emerald-50`), Amber cho Workflow/Warning (`amber-600`/`amber-50`), Purple cho Agent (`purple-600`/`purple-50`), Red cho Error/Delete (`red-600`/`red-50`).
- **Bo góc (Border Radius)**:
  * Container chính & Cards: `rounded-2xl`
  * Buttons, Inputs, Tool items: `rounded-xl` hoặc `rounded-lg`
  * Tags & Badges: `rounded-md` hoặc `rounded-full`
- **Bóng đổ (Shadows)**:
  * Micro card: `shadow-2xs`
  * Standard card: `shadow-xs` hoặc `shadow-sm`
  * Modals & Dropdowns: `shadow-xl`
- **Tương tác (Interactions)**:
  * Nút bấm luôn có: `transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`
  * Input focus: `focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`

---

## 4. Kế hoạch Triển khai 8 Giai đoạn (Phased Implementation Plan)

### Phase 1: Xây dựng Nền tảng Dịch vụ & Types (Data Layer & Services)
**Mục tiêu**: Chuẩn hóa toàn bộ API client và types để kết nối hoàn chỉnh với Dify backend thông qua reverse proxy.

1. **Types (`saas/src/types/dify/`)**:
   - `app.ts`: App, AppMode, AppModelConfig, PromptTemplate, ToolConfig.
   - `workflow.ts`: WorkflowNode, WorkflowEdge, WorkflowRunResult, NodeExecutionState.
   - `dataset.ts`: Dataset, Document, ChunkingRule, HitTestingResult.
   - `model-provider.ts`: ModelProvider, ModelConfig, ProviderCredential.
   - `log.ts`: ConversationSession, AppLogMessage, TokenStat.
2. **API Services (`saas/src/services/`)**:
   - `api-client.ts`: Wrapper `fetch` xử lý credentials, base URL proxy `/console/api`, error parsing thống nhất.
   - `apps.service.ts`: `listApps()`, `getApp()`, `createApp()`, `updateApp()`, `deleteApp()`.
   - `datasets.service.ts`: `listDatasets()`, `getDataset()`, `createDataset()`, `uploadDocument()`.
   - `tools.service.ts`: `listModelProviders()`, `saveModelProvider()`, `listBuiltInTools()`.
   - `workflows.service.ts`: `getWorkflow()`, `publishWorkflow()`, `runWorkflow()`.

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas test --project=unit
```
*Tiêu chí đạt*: Typecheck không có lỗi, các service fetcher có unit test mock chạy thành công.

---

### Phase 2: Phân hệ App Studio & Cấu hình Mô hình (Chatbot & Agent Orchestration)
**Mục tiêu**: Cho phép người dùng cấu hình prompt, lựa chọn LLM và test chatbot tương tác thời gian thực.

1. **Tạo route `saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/page.tsx`**:
   - Chuyển hướng hoặc hiển thị tổng quan thông số của App (API URL, token metrics, trạng thái công bố).
2. **Trang Studio (`saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/studio/page.tsx`)**:
   - Bố cục 3 cột tinh gọn theo phong cách SaaS Boilerplate:
     * **Cột trái (Configuration)**: Model Selector (OpenAI, Gemini, Claude, Ollama), System Prompt textarea hỗ trợ biến `{{variable}}`, Context selector (kết nối Knowledge Dataset).
     * **Cột giữa (Chat Simulator)**: Khung chat tương tác trực tiếp với backend qua `/console/api/apps/[appId]/chat-messages`, hỗ trợ streaming câu trả lời.
     * **Cột phải (Inspection & Parameters)**: Thanh trượt Temperature, Top P, Max Tokens, Frequency Penalty, Tools enabled.
3. **Modal Deploy & Publish**:
   - Nút "Publish Changes" trên thanh topbar với modal hiển thị lịch sử phiên bản và liên kết chia sẻ WebApp công khai.

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Mở Studio, nhập prompt, bấm gửi nhận được phản hồi stream từ Dify API, layout không vỡ trên desktop và tablet.

---

### Phase 3: Visual Workflow Engine (Đóng gói ReactFlow Canvas)
**Mục tiêu**: Xây dựng bộ soạn thảo workflow dạng đồ thị kéo thả trực quan mà không làm ảnh hưởng CSS của toàn bộ ứng dụng SaaS.

1. **Cô lập môi trường Canvas (`saas/src/components/workflow/`)**:
   - Tạo `WorkflowContainer.tsx` với class `relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-gray-50/50`.
   - Cài đặt `@xyflow/react` hoặc `@reactflow/react` (phiên bản tương thích React 19).
2. **Bộ Node Chuẩn (Boilerplate Design Nodes)**:
   - Các component node được thiết kế tinh tế với viền mỏng, bo góc `rounded-xl`, badge màu tương ứng:
     * `StartNode.tsx` & `EndNode.tsx` (Vào/Ra luồng dữ liệu)
     * `LLMNode.tsx` (Xử lý model prompt)
     * `KnowledgeRetrievalNode.tsx` (Truy vấn kho tri thức)
     * `CodeNode.tsx` (Chạy Python/JavaScript)
     * `IfElseNode.tsx` (Rẽ nhánh điều kiện)
     * `HttpRequestNode.tsx` (Gọi Webhook/API bên ngoài)
     * `ToolNode.tsx` (Thực thi công cụ)
3. **Thanh công cụ & Panel thao tác**:
   - Topbar Workflow: Nút "Run Test", Nút "Publish", Nút "Undo/Redo", Zoom controls.
   - Node Inspector Drawer: Drawer trượt từ cạnh phải khi click vào node để cấu hình tham số.
   - Trace Drawer: Hiển thị nhật ký thực thi từng bước (thời gian chạy, token, kết quả đầu ra).

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Kéo thả các node, nối dây liên kết, lưu workflow thành công; font chữ và thanh điều hướng chính của SaaS không bị ảnh hưởng style.

---

### Phase 4: Quản lý Kho Tri thức & Pipeline RAG (Knowledge & Datasets)
**Mục tiêu**: Hoàn thiện toàn bộ luồng quản lý tài liệu, phân đoạn chunking, và kiểm thử truy vấn RAG.

1. **Trang Chi tiết Kho tri thức (`saas/src/app/[locale]/(auth)/dashboard/knowledge/[datasetId]/page.tsx`)**:
   - Tab 1: Danh sách tài liệu (Document List) với trạng thái xử lý (Indexing, Completed, Error), số lượng chunks, nút bật/tắt kích hoạt.
   - Tab 2: Hit Testing (Kiểm thử truy vấn): Form nhập câu hỏi test, hiển thị các đoạn văn bản tương đồng được vector search tìm thấy kèm điểm số (Score).
   - Tab 3: Cài đặt Indexing: Chế độ index (High Quality / Economy), mô hình Embedding, tham số tìm kiếm (Top K, Score threshold).
2. **Document Upload Wizard (3 Bước)**:
   - Bước 1: Kéo thả file PDF, DOCX, TXT, Markdown.
   - Bước 2: Xem trước phân đoạn văn bản và cấu hình quy tắc làm sạch (Clean text, Remove URLs, Chunk size).
   - Bước 3: Xác nhận và bắt đầu quy trình trích xuất vector.

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Tạo dataset mới, upload file mẫu thành công, chạy kiểm thử Hit Testing trả về kết quả chính xác.

---

### Phase 5: Tích hợp Model Providers & Quản lý Công cụ (Tools & Integrations)
**Mục tiêu**: Cung cấp giao diện cấu hình API key cho các nhà cung cấp mô hình AI và mở rộng công cụ tùy biến.

1. **Trang Cấu hình Model Providers (`saas/src/app/[locale]/(auth)/dashboard/settings/models/page.tsx`)**:
   - Hiển thị danh sách card các hãng AI phổ biến: OpenAI, Anthropic, Google Gemini, Groq, DeepSeek, Mistral, Ollama (Local).
   - Modal nhập API key / Base URL an toàn, có nút "Validate & Test Connection" gọi backend kiểm tra hạn ngạch.
2. **Quản lý Custom Tools & OpenAPI Schema**:
   - Form tạo Tool mới: Nhập tên công cụ, mô tả, và paste schema OpenAPI (JSON/YAML).
   - Tự động phân tích các endpoints và tạo giao diện test tham số.
3. **Hỗ trợ Model Context Protocol (MCP)**:
   - Thêm tab MCP cho phép kết nối tới các MCP Server (cục bộ hoặc từ xa).

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Thêm API key mô hình thành công, hiển thị trạng thái "Configured & Active", tạo thành công custom tool từ OpenAPI schema.

---

### Phase 6: Nhật ký, Giám sát & Đánh giá (Logs & Monitoring)
**Mục tiêu**: Cung cấp bảng điều khiển phân tích chi tiết phiên hội thoại, mức tiêu thụ token và phản hồi người dùng.

1. **Trang Logs của App (`saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/logs/page.tsx`)**:
   - Bảng lịch sử hội thoại: Người dùng, số tin nhắn, thời gian, trạng thái, đánh giá (Thumb up/down).
   - Drawer xem chi tiết cuộc trò chuyện: Hiển thị đầy đủ luồng tương tác giữa User và AI, kèm metadata tokens, latency, cost.
2. **Dashboard Phân tích Tổng thể (Analytics Overview)**:
   - Biểu đồ thống kê số lượng tin nhắn theo thời gian (Daily Active Conversations).
   - Thống kê tổng số token tiêu thụ phân theo mô hình.
   - Bảng phân bố đánh giá chất lượng (User Satisfaction Rate).

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Hiển thị danh sách log cuộc gọi thực tế từ Dify Backend, lọc theo khoảng thời gian và xem chi tiết tin nhắn trơn tru.

---

### Phase 7: Giao diện Public Share WebApp & Nhúng Widget
**Mục tiêu**: Hoàn thiện các trang ứng dụng công khai dành cho end-user và widget nhúng vào website.

1. **Layout Chia sẻ Công khai (`saas/src/app/[locale]/(share)/layout.tsx`)**:
   - Layout tối giản, không thanh sidebar quản trị, hoàn toàn tập trung vào trải nghiệm người dùng cuối.
   - Hỗ trợ responsive tuyệt đối cho cả điện thoại di động và desktop.
2. **Các trang Share chuyên dụng**:
   - `/share/chat/[token]`: Giao diện chatbot trò chuyện trực tiếp (giống ChatGPT / Claude web UI phong cách boilerplate).
   - `/share/workflow/[token]`: Giao diện chạy workflow với form nhập liệu đầu vào (Inputs) và hiển thị kết quả đầu ra (Outputs).
3. **Modern Embedded Chatbot Widget (`saas/public/embed.js`)**:
   - Xây dựng file JavaScript nhúng nhẹ nhàng (< 30KB), render một nút bong bóng chat ở góc màn hình và mở iframe hoặc popover trò chuyện mượt mà.

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas build
```
*Tiêu chí đạt*: Mở liên kết share với token hợp lệ, gửi tin nhắn nhận được câu trả lời bình thường; nhúng script vào một file HTML mẫu hoạt động tốt.

---

### Phase 8: Đa ngôn ngữ, Tối ưu hóa CI & Khóa Chất lượng (Final Quality Gate)
**Mục tiêu**: Hoàn thiện bản dịch, kiểm thử tự động toàn diện và đảm bảo quy trình CI hoàn hảo.

1. **Hoàn thiện i18n (`next-intl`)**:
   - Đồng bộ đầy đủ các key giao diện cho 3 ngôn ngữ: Tiếng Anh (`en.json`), Tiếng Việt (`vi.json`), Tiếng Pháp (`fr.json`).
   - Đảm bảo tính nhất quán của thuật ngữ chuyên ngành (Prompt, Workflow, Knowledge Base, Agent).
2. **Bộ kiểm thử tự động (Test Suite)**:
   - Vitest: Unit tests cho toàn bộ các helper, services và component UI cốt lõi.
   - Playwright E2E: Test kịch bản hoàn chỉnh từ Đăng nhập → Tạo App Chatbot → Test trong Studio → Công bố ứng dụng.
3. **Tối ưu hóa Production Build**:
   - Bundle analyzer kiểm tra loại trừ các module thừa.
   - Kiểm tra chuẩn SEO, robots.txt, sitemap.xml.
   - Cập nhật tài liệu hướng dẫn vận hành và bàn giao mã nguồn.

**Verification Gate**:
```bash
pnpm -C saas check:types
pnpm -C saas lint
pnpm -C saas test --project=unit
pnpm -C saas build
```
*Tiêu chí đạt*: Tất cả các lệnh verification đều exit 0, không có lỗi hoặc warning tiềm ẩn.

---

## 5. Quy tắc Kiểm soát Rủi ro & Điều kiện Dừng (STOP Conditions)

### 5.1. Các điều tuyệt đối cấm (Anti-patterns):
- **CẤM** copy đè file CSS toàn cục hoặc import bất kỳ file `.css` cũ nào từ `web/` vào `saas/src/styles/global.css`.
- **CẤM** sử dụng các class Tailwind v3 đã lỗi thời (ví dụ: `bg-opacity-*` cũ thay bằng cú pháp `/opacity` của v4).
- **CẤM** sửa đổi code trong thư mục backend `api/` (Backend Python được giữ nguyên).
- **CẤM** import trực tiếp các component nguyên khối chưa được refactor từ `web/app/components`.

### 5.2. Điều kiện DỪNG và BÁO CÁO (STOP Conditions):
Dừng lại ngay lập tức và báo cáo người dùng nếu:
1. Phát hiện API endpoint của Dify Backend trả về dữ liệu không tương thích với tài liệu chuẩn mà không có đường chuyển tiếp.
2. Thư viện ReactFlow gặp lỗi xung đột phiên bản không thể giải quyết với React 19 / Next.js 16.
3. Kích thước bundle của trang vượt quá ngưỡng cho phép làm suy giảm hiệu năng nghiêm trọng (> 2MB first-load JS).

---

## 6. Tiêu chí Hoàn thành (Done Criteria)

- [ ] Toàn bộ các tính năng cốt lõi (Studio, Workflow, Knowledge, Tools, Logs, Share) hoạt động hoàn hảo trên `saas`.
- [ ] Giao diện 100% tuân thủ phong cách thiết kế hiện đại của `huuhabn/nextjs-saas-boilerplate` với Tailwind CSS v4.
- [ ] Số lượng file trong `saas/src` được tổ chức ngăn nắp, module hóa cao, dễ mở rộng và bảo trì.
- [ ] Toàn bộ 8 Phase được triển khai qua các commit có kiểm thử tự động.
- [ ] Lệnh `pnpm -C saas build` hoàn tất tạo ra phiên bản production tối ưu và sẵn sàng thay thế hoàn toàn `web`.
