# Kế hoạch triển khai

Lập ngày 2026-11-18 theo skill advisor.

## Danh mục kế hoạch

| Plan | Mục tiêu | Priority | Effort | Dependency | Status |
|---|---|---|---|---|---|
| [001](001-align-saas-with-nextjs-boilerplate.md) | Chuẩn hóa SaaS theo ixartz/Next-js-Boilerplate (cũ - port nguyên khối từ web) | P1 | L | Không | REJECTED (Phương án copy nguyên khối từ web làm mất style của boilerplate) |
| [002](002-rebuild-saas-with-boilerplate-style.md) | Khôi phục SaaS Boilerplate gốc và Tích hợp Dify theo phong cách Boilerplate | P1 | L | Không | COMPLETED (Steps 1, 2, 3, 4 đã xong - Nền tảng sạch 48 files) |
| [003](003-complete-web-to-saas-migration.md) | Chuyển đổi toàn diện các phân hệ Dify Web sang Next.js SaaS Boilerplate (8 Phases) | P1 | XL | Plan 002 | COMPLETED (Hoàn thành toàn bộ 8 Phase với 100% Tailwind v4, typecheck & build sạch) |

## Ghi chú định hướng & Quyết định

- **Lý do hủy Plan 001**: Plan 001 đã copy hơn 8.700 file từ `web/` sang `saas/`, nhập đè CSS cũ vào `global.css`, làm mất hoàn toàn phong cách Tailwind CSS v4, layout và design system của `huuhabn/nextjs-saas-boilerplate`.
- **Chiến lược Plan 003 (Chuyển đổi toàn diện 8 Phase)**:
  - Phase 1: Chuẩn hóa API client, typed services (`saas/src/services/`) và domain types (`saas/src/types/dify/`).
  - Phase 2: App Studio & Prompt Engineering (Giao diện 3 cột, Model selector, Chat simulator, Deploy modal).
  - Phase 3: Visual Workflow Engine (Đóng gói ReactFlow Canvas trong container cô lập, 7+ core nodes Tailwind v4).
  - Phase 4: Knowledge Base & RAG Pipeline (Document list, 3-step upload wizard, Hit testing playground).
  - Phase 5: Model Providers & Tools (API key credentials modal cho 20+ hãng AI, Custom OpenAPI importer, MCP).
  - Phase 6: Monitoring, Logs & Observability (Conversation history, Token usage metrics, tracing).
  - Phase 7: Public Share WebApps & Embedded Chat Widget (Standalone responsive chat, embed.js < 30KB).
  - Phase 8: Workspace RBAC, hoàn thiện đa ngôn ngữ next-intl (en, vi, fr) và khóa chất lượng CI.
