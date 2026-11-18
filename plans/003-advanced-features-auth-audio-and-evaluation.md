# Plan 003: Chuyển đổi Xác thực Doanh nghiệp, Đánh giá (Evaluation), Đa phương tiện & Tiện ích Studio

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

- **Status**: PLANNED (Sẵn sàng thực thi sau Plan 002)
- **Priority**: P1 (Enterprise & Advanced Capabilities)
- **Effort**: L (5 giai đoạn độc lập - Phased execution)
- **Risk**: LOW (Kiểm soát chặt chẽ bằng modular layout, typed services và Quality Gates)
- **Depends on**: Plan 002 (Kế thừa nền tảng các trang chuyên sâu và điều hướng Sidebar)
- **Category**: architecture | auth | multimedia | evaluation | dx
- **Planned at**: commit `f3e6fbb685`, 2026-11-19

---

## 2. Bối cảnh & Mục tiêu

Sau khi hoàn thành Plan 001 (Nền tảng cốt lõi) và Plan 002 (Explore, Plugins, Segments, Annotations, Access Point), `web/` vẫn còn các phân hệ chuyên biệt nâng cao:
1. **Xác thực Mở rộng & Doanh nghiệp (Enterprise Auth & Onboarding)**:
   - Đăng nhập mạng xã hội (Google & GitHub OAuth SSO).
   - Enterprise SSO (SAML 2.0 & OIDC).
   - Trang khởi tạo Admin hệ thống lần đầu (`/install`, `/init`) khi cơ sở dữ liệu Dify mới tinh chưa có tài khoản.
   - Luồng đăng nhập không cần mật khẩu qua mã OTP Email 6 chữ số (`/signin/check-code`, `/signup/check-code`).
2. **Đánh giá Chất lượng Mô hình & Đo lường (Evaluation & Benchmark)**:
   - Phân hệ kiểm thử chất lượng câu trả lời của App theo bộ test dataset (`/dashboard/apps/[appId]/evaluation`).
   - Quản lý kho Prompt Snippets tái sử dụng (`/dashboard/snippets`).
3. **Đa phương tiện & Giọng nói (Audio STT/TTS & Multimodal)**:
   - Ghi âm giọng nói (Speech-to-Text / Audio recorder) trực tiếp trong Chat Simulator và Share WebApp.
   - Đọc câu trả lời bằng giọng nói (Text-to-Speech audio player).
   - Tải tệp đa phương tiện (Ảnh, PDF, Audio) trực tiếp vào khung chat.
4. **Tiện ích Năng suất (Productivity & Command Palette)**:
   - Thanh tìm kiếm nhanh toàn hệ thống (Command Palette `Cmd+K` / `Ctrl+K`) để nhảy nhanh tới bất kỳ App, Dataset hay Setting nào.

---

## 3. Tiêu chuẩn Thiết kế UI (Boilerplate Design Standards)

- **Tailwind CSS v4 Native**: Tuân thủ chuẩn `@import 'tailwindcss';`, giữ bảng màu xanh/xám của Boilerplate.
- **Micro-interactions**: Nút ghi âm có hiệu ứng sóng âm nhịp nhàng (`animate-pulse`), thanh phát audio nhỏ gọn, Command Palette dạng modal popover trung tâm với blur background (`backdrop-blur-sm bg-black/40`).
- **Web Audio API & Browser MediaRecorder**: Tương thích native trên mọi trình duyệt hiện đại (Chrome, Safari, Firefox), fallback mượt mà khi người dùng chưa cấp quyền Micro.
- **i18n**: Khai báo 100% qua `next-intl` trên 4 ngôn ngữ (`en`, `vi`, `fr`, `ar`).

---

## 4. Kế hoạch Triển khai 5 Giai đoạn Chi tiết

### Phase 1: Xác thực Doanh nghiệp & Trang Cài đặt Ban đầu (Social OAuth & /install)

#### Mục tiêu:
Cung cấp luồng khởi tạo Admin ban đầu và các nút đăng nhập OAuth SSO (Google, GitHub, OIDC).

#### Các bước thực hiện:
1. **Trang Cài đặt Admin Lần đầu (`saas/src/app/[locale]/(auth)/(center)/install/page.tsx`)**:
   - Kiểm tra trạng thái hệ thống: Gọi `/console/api/init` xem đã có admin chưa.
   - Form thiết lập tài khoản quản trị tối cao: Tên, Email quản trị, Mật khẩu quản trị.
   - Sau khi tạo thành công, tự động đăng nhập và chuyển hướng vào `/dashboard`.
2. **Tích hợp Social OAuth vào `SignInForm.tsx` & `SignUpForm.tsx`**:
   - Thêm nút "Đăng nhập với Google" và "Đăng nhập với GitHub" phía trên hoặc dưới form email.
   - Gọi API `/console/api/oauth/login/{provider}` lấy redirect URL.
   - Xử lý callback tại `saas/src/app/[locale]/(auth)/oauth-callback/page.tsx`.
3. **Đăng nhập bằng mã OTP Email (Email Code Login)**:
   - Form nhập mã 6 số gửi về email qua Mailpit SMTP.
4. **Đồng bộ đa ngôn ngữ**:
   - Bổ sung namespace `Install` và `OAuth` vào 4 locale.

#### Verification Gate Phase 1:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```

---

### Phase 2: Đa phương tiện & Tương tác Giọng nói (Audio STT, TTS & File Upload)

#### Mục tiêu:
Hỗ trợ tương tác hội thoại bằng giọng nói và tải tệp đính kèm vào khung chat.

#### Các bước thực hiện:
1. **Component Ghi âm Giọng nói (`saas/src/components/chat/AudioRecorder.tsx`)**:
   - Sử dụng `MediaRecorder` API thu âm định dạng `audio/webm` hoặc `audio/mp4`.
   - Gửi file audio lên `/console/api/audio-to-text` nhận về text tự động điền vào khung chat.
2. **Component Đọc Text bằng Giọng nói (`saas/src/components/chat/AudioPlayer.tsx`)**:
   - Nút icon loa cạnh mỗi tin nhắn của AI.
   - Gọi API `/console/api/text-to-audio` nhận stream âm thanh phát trực tiếp.
3. **Component Tải tệp đính kèm trong Chat (`saas/src/components/chat/ChatUploader.tsx`)**:
   - Nút icon kẹp giấy cho phép upload ảnh (PNG/JPG), file tài liệu (PDF/TXT).
   - Hiển thị thumbnail preview trước khi gửi tin nhắn.
4. **Tích hợp vào Chat Simulator (`Studio`) & Share Chat (`/(share)/chat/[token]`)**.

#### Verification Gate Phase 2:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```

---

### Phase 3: Đánh giá Chất lượng Ứng dụng & Kiểm thử Mô hình (App Evaluation)

#### Mục tiêu:
Cung cấp công cụ chạy benchmark và chấm điểm câu trả lời của AI so với bộ dữ liệu chuẩn.

#### Các bước thực hiện:
1. **Types & Services**:
   - Tạo `saas/src/types/dify/evaluation.ts`:
     * `EvaluationDataset`, `EvaluationRun`, `EvaluationMetric`, `EvaluationScore`.
   - Tạo `saas/src/services/evaluation.service.ts`:
     * `listEvaluationRuns(appId: string): Promise<EvaluationRun[]>`.
     * `startEvaluation(appId: string, datasetId: string): Promise<EvaluationRun>`.
     * `getEvaluationReport(appId: string, runId: string): Promise<EvaluationReport>`.
2. **Trang Evaluation của App (`saas/src/app/[locale]/(auth)/dashboard/apps/[appId]/evaluation/page.tsx`)**:
   - Header: Thống kê điểm trung bình (Accuracy, Relevance, Groundedness).
   - Bảng kết quả chạy thử: Câu hỏi đầu vào, Câu trả lời của Model, Câu trả lời mẫu kỳ vọng, Điểm số đánh giá tự động (1-5 sao hoặc 0-100%).
   - Nút "Chạy lượt đánh giá mới" (Chọn bộ test dataset).
3. **Đồng bộ đa ngôn ngữ**:
   - Thêm namespace `Evaluation` vào 4 ngôn ngữ.

#### Verification Gate Phase 3:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```

---

### Phase 4: Quản lý Prompt Snippets & Tối ưu hóa Prompt (Prompt Snippets)

#### Mục tiêu:
Kho lưu trữ các đoạn prompt mẫu tái sử dụng và công cụ AI Prompt Optimizer.

#### Các bước thực hiện:
1. **Types & Services**:
   - Tạo `saas/src/types/dify/snippet.ts`:
     * `PromptSnippet`: `id`, `name`, `content`, `category`, `created_at`.
   - Tạo `saas/src/services/snippets.service.ts`:
     * `listSnippets(): Promise<PromptSnippet[]>`.
     * `createSnippet(name: string, content: string): Promise<PromptSnippet>`.
     * `deleteSnippet(id: string): Promise<void>`.
2. **Trang Quản lý Snippets (`saas/src/app/[locale]/(auth)/dashboard/snippets/page.tsx`)**:
   - Grid các thẻ Prompt Snippet tái sử dụng.
   - Nút "+ Tạo Snippet mới", nút copy nhanh nội dung.
3. **Công cụ AI Prompt Optimizer trong App Studio**:
   - Nút "Tối ưu hóa với AI" (Sparkles icon) ngay trên góc của System Prompt Textarea.
   - Nhập mục tiêu ngắn → AI tự động đề xuất System Prompt chuẩn cấu trúc Markdown (Role, Constraints, Steps).

#### Verification Gate Phase 4:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
```

---

### Phase 5: Thanh Tìm kiếm Nhanh Toàn diện (Command Palette Cmd+K)

#### Mục tiêu:
Cho phép người dùng bấm `Cmd+K` (hoặc `Ctrl+K`) để điều hướng tức thì tới bất kỳ đâu.

#### Các bước thực hiện:
1. **Component Command Palette (`saas/src/components/CommandPalette.tsx`)**:
   - Lắng nghe sự kiện bàn phím toàn cục `keydown` (`e.metaKey && e.key === 'k'`).
   - Modal hiển thị ô tìm kiếm tự động focus.
   - Kết quả nhóm theo danh mục:
     * 🚀 **Apps gần đây**: Chuyển nhanh vào Studio hoặc Logs của App.
     * 📚 **Datasets**: Chuyển nhanh vào Kho tri thức.
     * ⚙️ **Cài đặt & Điều hướng**: Chuyển vào Tools, Plugins, Thành viên, Profile.
     * ⚡ **Thao tác nhanh**: "+ Tạo App mới", "+ Thêm Dataset", "Đổi ngôn ngữ", "Đổi giao diện Sáng/Tối".
2. **Gắn vào `DashboardShell.tsx`** để hoạt động trên toàn bộ các trang Dashboard.
3. **Đồng bộ đa ngôn ngữ**:
   - Namespace `CommandPalette` trong các file ngôn ngữ.

#### Verification Gate Phase 5:
```bash
bun -C saas run check:types
bun -C saas run check:i18n
bun -C saas run build
```

---

## 5. Tiêu chí Hoàn thành (Done Criteria)

- [ ] Hỗ trợ trang cài đặt khởi tạo ban đầu `/install` khi DB chưa có admin.
- [ ] Tích hợp nút đăng nhập Social OAuth (Google, GitHub) trong `SignInForm`.
- [ ] Ghi âm giọng nói (STT) và đọc âm thanh (TTS) hoạt động tốt trong Chat.
- [ ] Cho phép upload ảnh/tài liệu đính kèm khi nhắn tin với Chatbot.
- [ ] Phân hệ App Evaluation hoạt động tại `/dashboard/apps/[appId]/evaluation`.
- [ ] Phân hệ Prompt Snippets hoạt động tại `/dashboard/snippets` và nút AI Prompt Optimizer trong Studio.
- [ ] Thanh Command Palette `Cmd+K` kích hoạt và điều hướng mượt mà.
- [ ] 100% hoàn thành kiểm tra typecheck và build production.
