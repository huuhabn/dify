# Kế hoạch chuyển đổi toàn diện Dify Web sang Next.js SaaS Boilerplate

Lập ngày 2026-11-18, chuẩn hóa và đóng gói trọn gói ngày 2026-11-19 theo skill advisor.

## Lộ trình Master Plan (Toàn bộ Vòng đời Chuyển đổi 100%)

Bộ 4 Kế hoạch dưới đây bao quát **100% tất cả các tính năng, trang màn hình, dịch vụ và hạ tầng DevOps** từ `web/` sang `saas/`. Sau khi hoàn thành 4 kế hoạch này, thư mục `web/` sẽ được gỡ bỏ hoàn toàn khỏi dự án mà không phát sinh thêm bất kỳ kế hoạch nào khác.

| Plan | Mục tiêu & Phạm vi | Priority | Effort | Phụ thuộc | Trạng thái |
|---|---|:---:|:---:|:---:|:---:|
| [**Plan 001**](001-complete-web-to-saas-migration.md) | **Nền tảng Cốt lõi & Phân hệ Chính (8 Phases)**:<br>Prompt Studio, Workflow Canvas, Datasets RAG, Model Providers, Logs & Monitoring, Public Share WebApps, RBAC Workspace Members, i18n 4 ngôn ngữ (en/vi/fr/ar), Next.js 16.4.6, Mailpit SMTP. | P1 | XL | Không | **`COMPLETED`**<br>*(Đã nghiệm thu sạch sẽ)* |
| [**Plan 002**](002-deep-pages-and-marketplace-migration.md) | **Các Trang Chuyên sâu & Tiện ích Mở rộng (5 Phases)**:<br>Kho ứng dụng mẫu Explore & Templates, Chợ tiện ích Plugin Marketplace, Trình biên tập phân đoạn tài liệu Document Segments (Master-Detail), Quản lý Annotations Q&A Cache toàn Workspace, Cấu hình Access Point & Human-in-the-Loop Web Form. | P1 | L | Plan 001 | **`COMPLETED`**<br>*(Đã nghiệm thu sạch sẽ)* |
| [**Plan 003**](003-advanced-features-auth-audio-and-evaluation.md) | **Xác thực Doanh nghiệp, Đa phương tiện & Đánh giá (5 Phases)**:<br>Trang cài đặt Admin ban đầu `/install`, Đăng nhập Social OAuth (Google, GitHub) & Enterprise SSO, Ghi âm giọng nói (STT) & Đọc văn bản (TTS) trong Chat, Tải file đính kèm đa phương tiện, Đánh giá chất lượng mô hình (App Evaluation), Prompt Snippets & Command Palette `Cmd+K`. | P1 | L | Plan 002 | **`COMPLETED`**<br>*(Đã nghiệm thu sạch sẽ)* |
| [**Plan 004**](004-devops-deployment-and-web-retirement.md) | **Đóng gói DevOps Production & Triển khai Độc lập (4 Phases)**:<br>Tạo `saas/Dockerfile` standalone đa tầng, Chuyển đổi cấu hình `docker-compose.yaml` production sang `saas`, Đồng bộ bộ kiểm thử tự động `e2e/`, giữ nguyên thư mục `web/` theo yêu cầu. | P1 | M | Plan 003 | **`COMPLETED`**<br>*(Đã nghiệm thu sạch sẽ)* |

---

## Ma trận Phủ Toàn bộ Tính năng (100% Feature Coverage Matrix)

| Khu vực nghiệp vụ trong `web/` | Kế hoạch đảm nhiệm | Vị trí mới trong `saas/` | Ghi chú kiến trúc |
|---|:---:|---|---|
| Xác thực cơ bản & Đổi mật khẩu | **Plan 001** | `/[locale]/(auth)/(center)/*` | Reverse proxy cookie auth, Mailpit SMTP |
| Quản lý App & Studio Prompt | **Plan 001** | `/[locale]/dashboard/apps/[appId]/studio` | Layout 3 cột tinh gọn, streaming chat |
| Visual Workflow Engine | **Plan 001** | `/[locale]/dashboard/apps/[appId]/workflow` | Đóng gói ReactFlow Canvas cô lập |
| Knowledge Base & RAG Upload | **Plan 001** | `/[locale]/dashboard/knowledge/*` | Document list, Wizard 3 bước, Hit-testing |
| Model Providers & Tools | **Plan 001** | `/[locale]/dashboard/tools` | 20+ LLM Providers, OpenAPI importer, MCP |
| Logs, Monitoring & Observability | **Plan 001** | `/[locale]/dashboard/apps/[appId]/logs` | Session inspection drawer, token stats |
| Public Share WebApps & Embed | **Plan 001** | `/[locale]/(share)/*`, `public/embed.js` | Standalone chat, workflow runner, iframe widget |
| Workspace Members & RBAC | **Plan 001** | `/[locale]/dashboard/settings/members` | Phân quyền 4 vai trò, invite modal |
| Đa ngôn ngữ (next-intl) | **Plan 001** | `saas/src/locales/*.json` | 4 ngôn ngữ en (không prefix), vi, fr, ar (RTL) |
| Kho ứng dụng mẫu (Explore) | **Plan 002** | `/[locale]/dashboard/explore` | Danh mục template, 1-click clone app |
| Plugin Marketplace & Manager | **Plan 002** | `/[locale]/dashboard/plugins` | Quản lý plugin daemon, marketplace catalog |
| Chi tiết Document Segments | **Plan 002** | `/[locale]/dashboard/knowledge/[...]/[docId]` | Master-Detail 2 cột xem & sửa vector chunks |
| Annotations Q&A Cache | **Plan 002** | `/[locale]/dashboard/annotations` | Quản lý bộ đệm câu trả lời mẫu cấp Workspace |
| Access Point & Custom Domain | **Plan 002** | `/[locale]/dashboard/apps/[appId]/access-point` | Tùy biến branding, CNAME domain, rate limiting |
| Human-in-the-Loop Web Form | **Plan 002** | `/[locale]/(share)/form/[token]` | Form động cho người duyệt trong Workflow |
| Khởi tạo Admin lần đầu (/install) | **Plan 003** | `/[locale]/(auth)/(center)/install` | Thiết lập tài khoản admin cho instance mới |
| Social Login & Enterprise SSO | **Plan 003** | `/[locale]/(auth)/(center)/sign-in` | Google/GitHub OAuth, SAML/OIDC, OTP code |
| Giao tiếp giọng nói (STT & TTS) | **Plan 003** | `saas/src/components/chat/*` | Web Audio MediaRecorder & Speech synthesis |
| Tải file đính kèm trong Chat | **Plan 003** | `saas/src/components/chat/ChatUploader` | Upload hình ảnh/tài liệu khi chat với AI |
| Đo lường chất lượng (Evaluation) | **Plan 003** | `/[locale]/dashboard/apps/[appId]/evaluation` | Benchmark câu trả lời theo dataset mẫu |
| Prompt Snippets & AI Optimizer | **Plan 003** | `/[locale]/dashboard/snippets` | Quản lý mẫu prompt & tự động tối ưu bằng AI |
| Command Palette (`Cmd+K`) | **Plan 003** | `saas/src/components/CommandPalette` | Phím tắt tìm kiếm và điều hướng tức thì |
| Docker Production Container | **Plan 004** | `saas/Dockerfile` | Next.js Standalone mode tối ưu kích thước |
| Docker Compose Deployment | **Plan 004** | `docker/docker-compose.yaml` | Thay thế hoàn toàn container web sang saas |
| E2E Cucumber & Playwright Tests | **Plan 004** | `e2e/step_definitions/*` | Cập nhật bộ kịch bản kiểm thử tự động |
