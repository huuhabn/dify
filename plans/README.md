# Kế hoạch triển khai

Lập ngày 2026-11-18, chuẩn hóa và cập nhật ngày 2026-11-19 theo skill advisor.

## Danh mục kế hoạch

| Plan | Mục tiêu | Priority | Effort | Dependency | Status |
|---|---|---|---|---|---|
| [001](001-complete-web-to-saas-migration.md) | Chuyển đổi toàn diện các phân hệ cốt lõi Dify Web sang Next.js SaaS Boilerplate (8 Phases) | P1 | XL | Không | COMPLETED (Hoàn thành 100% 8 Phase, Tailwind v4, i18n 4 ngôn ngữ en/vi/fr/ar, Mailpit SMTP, typecheck & build sạch) |
| [002](002-deep-pages-and-marketplace-migration.md) | Chuyển đổi các trang chuyên sâu & Tiện ích mở rộng (5 Phases: Explore, Plugins, Segments, Annotations, Access Point & Forms) | P1 | L | Plan 001 | PLANNED (Sẵn sàng thực thi) |

## Ghi chú định hướng & Quyết định

- **Chiến lược Plan 001 (Đã hoàn thành 100%)**:
  - Chuyển đổi theo phương pháp **Full Modular Migration**: Giữ trọn vẹn Design System của `huuhabn/nextjs-saas-boilerplate`, sử dụng 100% Tailwind CSS v4 native (`@import 'tailwindcss';`), loại bỏ hoàn toàn các file rác cũ.
  - Phase 1: Chuẩn hóa API client, typed services (`saas/src/services/`) và domain types (`saas/src/types/dify/`).
  - Phase 2: App Studio & Prompt Engineering (Giao diện 3 cột, Model selector, Chat simulator, Deploy modal).
  - Phase 3: Visual Workflow Engine (Đóng gói ReactFlow Canvas trong container cô lập, 7+ core nodes Tailwind v4).
  - Phase 4: Knowledge Base & RAG Pipeline (Document list, 3-step upload wizard, Hit testing playground).
  - Phase 5: Model Providers & Tools (API key credentials modal cho 20+ hãng AI, Custom OpenAPI importer, MCP).
  - Phase 6: Monitoring, Logs & Observability (Conversation history, Token usage metrics, tracing).
  - Phase 7: Public Share WebApps & Embedded Chat Widget (Standalone responsive chat, embed.js < 30KB).
  - Phase 8: Workspace RBAC, đa ngôn ngữ next-intl (`en`, `vi`, `fr`, `ar`), vá bảo mật Next.js 16.4.6 và tích hợp Mailpit SMTP local.

- **Định hướng Plan 002 (Kế hoạch thực thi tiếp theo - Đã qua /grill-me)**:
  - Phase 1: Kho Ứng dụng Mẫu (Explore & App Templates Catalog) - `/dashboard/explore` kèm 1-click clone app.
  - Phase 2: Chợ Tiện ích Mở rộng & Quản lý Plugin (Plugin Marketplace) - `/dashboard/plugins`.
  - Phase 3: Trình Biên tập Phân đoạn Tài liệu Chuyên sâu (Document Segments Editor) - `/dashboard/knowledge/[datasetId]/documents/[documentId]` theo bố cục Master-Detail 2 cột.
  - Phase 4: Quản lý Annotations & Phản hồi Chuẩn Toàn Workspace (Annotations & QA Cache) - `/dashboard/annotations`.
  - Phase 5: Xuất bản Nâng cao (Access Point/Custom Domain) & Giao diện Human-in-the-Loop Web Form - `/(share)/form/[token]`.
