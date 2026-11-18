# Plan 001: Chuẩn hóa SaaS theo Next-js-Boilerplate, giữ backend Dify

> Dành cho executor chưa đọc hội thoại: đây là kế hoạch, chưa phải thay đổi đã triển khai. Thực hiện theo thứ tự các giai đoạn; mỗi giai đoạn là PR riêng. Không thay đổi auth hoặc mô hình quyền Dify. Khi gặp điều kiện STOP, báo lại thay vì tự mở rộng phạm vi.

## Theo dõi thực hiện

Trạng thái từng bước và bằng chứng kiểm tra được quản lý tại [001-progress.md](001-progress.md). Các mã `1.1`–`6.4` bên dưới khớp với bảng đó. Mỗi lần bắt đầu, hoàn thành hoặc bị chặn ở một bước, cập nhật ngay dòng tương ứng và nhật ký; không chờ hết giai đoạn. Chỉ hoàn thành giai đoạn khi gate tương ứng đạt. Không đánh dấu các thay đổi có trước kế hoạch là đã hoàn tất bước migration.

## Trạng thái và nguồn tham chiếu

- Priority: P1. Effort: L, nhiều PR. Risk: HIGH ở routing/i18n, MED ở cấu trúc/tooling.
- Status: IN PROGRESS. Dependency: không có kế hoạch khác.
- Ngày lập: 2026-11-18. Local HEAD khi lập: `385c25ef43`. Drift đã đối chiếu khi triển khai tại `58488b5e28`: các thay đổi UI trước đã được commit; giữ nguyên các thay đổi plan chưa commit.
- Upstream đã khảo sát: `ixartz/Next-js-Boilerplate`, commit `b83157a8018f55b926a3c25a4b7a7e14b0dfbc35`.
- Quyết định người dùng: **chuẩn hóa cấu trúc và tooling; giữ auth/backend Dify**. Không tích hợp Clerk. Không chuyển dữ liệu Dify sang Drizzle/PGlite.
- Không hạ phiên bản dependencies của workspace để trùng số phiên bản upstream.
- Chưa chạy lại build/test trong lần lập kế hoạch này. Các command dưới đây là gate cho executor, không phải kết quả kiểm tra đã đạt.

Nguồn upstream, dùng URL đã ghim commit để tránh trôi yêu cầu:

- [Source tree](https://github.com/ixartz/Next-js-Boilerplate/tree/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35)
- [Next config](https://github.com/ixartz/Next-js-Boilerplate/blob/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35/next.config.ts)
- [Locale layout](https://github.com/ixartz/Next-js-Boilerplate/blob/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35/src/app/%5Blocale%5D/layout.tsx)
- [Proxy](https://github.com/ixartz/Next-js-Boilerplate/blob/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35/src/proxy.ts)
- [Vitest](https://github.com/ixartz/Next-js-Boilerplate/blob/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35/vitest.config.ts)
- [CI](https://github.com/ixartz/Next-js-Boilerplate/blob/b83157a8018f55b926a3c25a4b7a7e14b0dfbc35/.github/workflows/CI.yml)

## Mục tiêu và các điều chỉnh có chủ đích

| Hạng mục | Đích cuối |
|---|---|
| Framework | Next App Router, TypeScript strict, Tailwind v4 |
| Thư mục | `app` chỉ chứa route/route shell; UI dùng `components`; cấu hình thư viện dùng `libs`; CSS dùng `styles`; message dùng `locales` |
| Feature Dify | Giữ `features`, `service`, `context`, `hooks` khi có chủ sở hữu nghiệp vụ rõ ràng; không dồn mọi thứ vào `libs` |
| Auth và dữ liệu | Dify cookies/CSRF, session refresh, workspace/RBAC, Console API và public WebApp API |
| i18n | Đích dùng next-intl; chuyển theo feature, có lớp tương thích tạm cho i18next; giữ đủ locale và nội dung Dify |
| URL | Giữ URL công khai hiện tại; `[locale]` là route nội bộ với `localePrefix: 'never'`, không tự thêm `/vi` vào link chia sẻ/callback |
| UI | Giữ `@langgenius/dify-ui`, token/theme và giao diện Dify; `BaseTemplate` demo không thay product shell |
| Tooling | Oxlint/Ultracite, Oxfmt, Knip, Vitest Browser, Playwright, Storybook; cấu hình phù hợp monorepo pnpm |
| Type checker | Giữ `tsrs --runExternalCode` khi OpenAPI content mapper còn cần nó; không đổi thẳng sang `tsc` thông thường |
| Local database | Loại demo Counter/Drizzle/PGlite nếu không có consumer nghiệp vụ; không thêm frontend database chỉ để giống template |
| Optional vendors | Sentry/Spotlight có thể opt-in. Không bắt buộc Clerk, Arcjet, PostHog, Crowdin hay tài khoản cloud để chạy local |

Các điều chỉnh trong bảng phải được ghi trong tài liệu so sánh upstream. Đây là một ứng dụng Dify áp dụng nền tảng boilerplate; không thể đồng thời giữ auth/backend Dify và sao chép nguyên middleware Clerk của upstream.

Tham chiếu routing: [next-intl localePrefix never](https://next-intl.dev/docs/routing/configuration#locale-prefix-never) xác nhận rewrite locale nội bộ trong khi giữ URL bên ngoài không prefix. Pilot phải xác minh cookie, matcher và metadata theo ứng dụng Dify.

## Hiện trạng và bằng chứng

1. `saas/src/app/layout.tsx:1` dùng Dify providers, i18next, `#i18n`, query hydration và WebApp access boundary. Trong khi đó `saas/src/libs/I18n.ts`, `I18nRouting.ts`, `I18nNavigation.ts` và `src/locales/{en,fr}.json` thuộc nền next-intl còn lại từ template.
2. `saas/next.config.ts:1` import cả `src/env` lẫn `src/libs/Env`; `:32` bật `typescript.ignoreBuildErrors`. Cấu hình chưa gắn `createNextIntlPlugin`; loader `.openapi*` hiện có là bắt buộc cho Dify.
3. `saas/vitest.config.ts:20` chỉ chọn `src/**/*.test.{js,ts}`, và project UI ở `:29` chỉ chọn `.test.tsx`. Khảo sát filesystem thấy **2.273 file `.spec.*` và 8 file `.test.*`**; các con số này chỉ là số tệp, không phải số test pass. Một số `.test.ts` hiện cũng nằm trong `__tests__`, không được tự động chuyển thành test Node thông thường.
4. `saas/playwright.config.ts:32` còn khởi động PGlite/counter migrations. `saas/tests/` còn Counter, demo locale, visual tests từ template, chưa chứng minh luồng Dify.
5. `saas/src/app/components` chứa UI không phải route; đã từng phải đổi `main-nav/layout.tsx` thành `nav-layout.tsx` để tránh Next nhận nhầm layout.
6. `saas/src/models/Schema.ts` là Drizzle counter; các file khác trong `src/models/` là type Dify. Hai nghĩa đang trộn chung.
7. `saas/src/styles/global.css` chỉ import Tailwind; stylesheet thực tế trong `src/app/styles/globals.css` import Dify preflight/token/plugins. Không được thay bằng một import Tailwind mặc định rồi mất theme.
8. `saas/src/types/next-intl.d.ts` đã đổi tên để tránh va chạm với `src/types/i18n.d.ts` trên filesystem không phân biệt hoa thường. Không đưa lại cặp `I18n.ts`/`i18n.d.ts`.
9. `saas/src/app/api/counter/route.ts`, `components/CounterForm.tsx`, `CurrentCount.tsx`, `validations/CounterValidation.ts`, `libs/DB.ts`, `utils/DBConnection.ts` là chuỗi demo cần kiểm tra consumer trước khi bỏ.
10. `.github/workflows/` không có trong checkout được khảo sát; không được nói các gate SaaS đã có trong CI. Docker mặc định vẫn dùng image `dify-web:1.19.0`.

Trích đoạn dùng kiểm tra drift:

```ts
// saas/vitest.config.ts
include: ['src/**/*.test.{js,ts}'],
// saas/next.config.ts
typescript: { ignoreBuildErrors: true },
// saas/src/i18n/settings.ts
keySeparator: false,
returnEmptyString: true,
```

Message Dify đang có khóa phẳng như `about.latestAvailable` và interpolation `{{version}}` trong `src/i18n/locales/en-US/common.json`. Chuyển sang next-intl cần chuyển cấu trúc message/ICU, không chỉ đổi import hook.

## Phạm vi và những thứ phải giữ

**In scope:** `saas/**` (trừ env chứa giá trị riêng, storage và output build), scripts frontend ở root `package.json`, catalog/lockfile khi cần, CI mới giới hạn SaaS, và deployment frontend SaaS có thể chọn riêng. Dùng `plans/` để lưu inventory/baseline của đợt chuyển.

**Out of scope:** sửa API Python, schema/database Dify, đổi auth sang Clerk, rewrite workflow engine, sửa generated contracts bằng tay, thay implementation trong `packages/dify-ui`, xóa `web/`, chuyển toàn monorepo sang npm/bun, thay backend Docker đang chạy khi chỉ refactor frontend.

Giữ các chỉnh sửa UI đang chưa commit, bao gồm modal căn giữa trong `create-app-dialog-shell.tsx` và `explore/try-app/index.tsx`. Giữ giới hạn 1024px/720px và khả năng co theo viewport. Không chạy reset/clean để lấy cây source sạch.

## Cấu trúc đích

```text
saas/
  src/
    app/
      [locale]/
        (auth)/                  # Dify signin/install, không Clerk
        (console)/               # Home/apps/agents/knowledge/settings
        (webapp)/                # Share/token routes, giữ URL bên ngoài
        layout.tsx               # Locale/root providers sau cutover
      api/                       # Chỉ endpoint Next thực sự cần
      global-error.tsx
      robots.ts
      sitemap.ts
    components/
      dify/                      # UI di chuyển từ app/components
      providers/                 # Client providers, app toast/query wiring
    features/                    # Giữ owner nghiệp vụ Dify
    libs/
      Env.ts
      I18n.ts
      I18nRouting.ts
      I18nNavigation.ts
      Logger.ts
    locales/<locale>/<namespace>.json
    styles/global.css            # Entrypoint duy nhất, vẫn dùng Dify core/tokens
    types/dify/                  # DTO/type cũ của src/models, không Drizzle schema
    service/                     # Console/public transport và query policy
    context/
    hooks/
    utils/
    validations/
    test/                        # Helpers của test Dify, không product code
  tests/integration/
  tests/e2e/
  .storybook/
  next.config.ts
  vitest.config.ts
  playwright.config.ts
```

Không di chuyển mọi component từ đầu trong một PR. Đường dẫn chuyển có manifest/codemod và các batch nhỏ. Tên route group `(console)` thay `(commonLayout)` chỉ thực hiện khi snapshot route chứng minh URL không đổi. Không đổi tên dynamic param hoặc parallel slot khi chuyển group.

## Kiểm tra ban đầu và workflow

Chạy từ root, prefix shell commands bằng `rtk`. Cần Node phù hợp `engines` root và pnpm đã ghim tại root. Không tự hạ yêu cầu engine để qua install.

```sh
rtk git status --short
rtk git diff --stat 385c25ef43..HEAD -- saas package.json pnpm-workspace.yaml
rtk git diff -- saas
rtk proxy pnpm install --frozen-lockfile
rtk proxy env NODE_OPTIONS=--max-old-space-size=4096 pnpm -C saas check:types
rtk proxy pnpm -C saas test --project unit --maxWorkers=2 src/utils/Helpers.test.ts
rtk proxy pnpm -C saas check:deps
rtk proxy pnpm -C saas check:i18n
```

Kết quả lint/deps/i18n/test hiện tại chưa được xác lập trong khảo sát này. Ghi lại exit code và phân loại lỗi cũ/mới; không coi `check:types` xanh là bằng chứng test coverage. Không chạy toàn bộ test/build nặng trong bước baseline. Tạo branch theo quy ước hiện có; commit logic nhỏ bằng conventional commit, ví dụ `refactor: separate SaaS components from routes`. Không commit/push thay đổi của người dùng nếu chưa được yêu cầu.

MCP graph đã được thử nhưng project chưa indexed; lần index trước đó trong phiên thất bại. Evidence trong kế hoạch đến từ đọc source/config và thống kê filesystem, không phải một graph đầy đủ.

## Giai đoạn 1 — Thiết lập baseline đáng tin cậy (P1, M)

1. **1.1** — Tạo inventory route/page/layout/API, imports `@/app/components`, alias `#i18n`, locale, CSS entrypoint và test discovery. Lưu báo cáo dưới `plans/` khi triển khai.
2. **1.2** — Chụp hành vi hiện tại: setup chưa cài đặt, signin/logout/refresh, SSR account bootstrap, Home, workspace switch, template modal, workflow editor, một published WebApp. Fixture dùng Dify test environment riêng; không tự tạo/reset tài khoản admin trên database cá nhân.
3. **1.3** — Sửa discovery Vitest: project Node cho test thuần, project tương thích DOM cho các test RTL hiện hữu, project Browser cho test UI đã port. Có thể cần thêm dependency DOM/test utilities vào SaaS theo workspace catalog. Không chuyển tất cả mock RTL sang Browser bằng cách đổi glob.
4. **1.4** — Chuyển/copy helper cần thiết từ `web/test` sang `saas/src/test` và sửa imports trong phạm vi SaaS; không import helper từ `web/` ở cấu hình đích. Dùng test có sẵn của login redirect, console transport, Home/template và modal làm characterization tests.
5. **1.5** — Sửa Playwright server command để dùng Next + Dify test backend, không khởi động PGlite. Thay test Counter bằng luồng Dify. Phân biệt integration Dify thật với network fixtures của UI.

**Gate:** command Helpers ở trên pass; discovery inventory ghi rõ mỗi test file thuộc đúng một project hoặc có lý do loại trừ; nhóm test thay đổi pass với `--maxWorkers=2`; Playwright smoke không yêu cầu Clerk/PGlite. Thêm script mới `migration:check` trong `saas/package.json` để kiểm tra route/import/CSS invariants từ manifest; `pnpm -C saas migration:check` phải exit 0 từ giai đoạn này.

## Giai đoạn 2 — Tách route, UI và type (P1, L)

1. **2.1** — Dùng codemod có dry-run để chuyển `src/app/components/**` sang `src/components/dify/**`. Mỗi batch cập nhật cả static/dynamic import, CSS URL, story/mock, test và relative import. Không dùng replace chuỗi không phân biệt cú pháp trên toàn repo.
2. **2.2** — Chuyển `app/query-provider.tsx`, `query-state-provider.tsx`, provider UI/notification phù hợp sang `components/providers`; route imports mới. `get-query-client.ts` chuyển sang `libs/query` nếu cần nhưng phải giữ factory/cache request lifetime hiện tại.
3. **2.3** — Chuyển DTO trong `models/` sang `types/dify/`; tạm giữ `models/Schema.ts` cho đến bước xử lý demo. Không rename generated API types.
4. **2.4** — Chuyển CSS dùng thật về `styles/`; cập nhật root layout và Storybook import cùng một entrypoint. Rebase `@source`, icon plugin, asset/font URLs và imports tới shared package theo vị trí mới. Chỉ giữ một preflight của Dify.
5. **2.5** — Làm theo contract hiện hữu trong `packages/dify-ui/docs/overlays.md`: không thêm portal hay z-index để chữa triệu chứng. Giữ scoped Jotai state, query hydration, close/focus lifecycle của modal khi đổi path.

**Gate:** `check:types`, `migration:check`, test batch pass; `rg "@/app/components" saas/src` không còn imports thực; snapshots desktop/mobile của template modal, editor và theme không mất CSS/icon. App Router manifest không nhận thư mục component thành route.

## Giai đoạn 3 — Một nguồn Env và dọn demo (P1, M)

1. **3.1** — Hợp nhất schema environment dưới `libs/Env.ts`, nhưng **giữ runtime dataset** của Dify: `getDatasetMap()` và browser runtime overrides không được bị thay bằng build-time env. Có thể để `src/env.ts` làm adapter re-export tạm; mỗi key chỉ được validate/coerce ở một owner.
2. **3.2** — Phân tách server-only secrets, public build vars và public runtime config; cập nhật `config/server.ts`, instrumentation và next config theo đó. Kiểm thử thiếu/sai kiểu config, boolean `false`/`0`, basePath và lỗi server-secret import vào client.
3. **3.3** — Dùng inventory consumer để bỏ demo Counter, demo banner/sponsors và tests liên quan. Chỉ bỏ Drizzle/PGlite/pg, schema/migration demo và scripts DB sau khi không còn consumer nghiệp vụ. Không xóa database/volume thực.
4. **3.4** — Giữ React Hook Form cho form mới theo upstream; không rewrite hàng loạt TanStack Form đang phục vụ Dify. Đánh giá API/form từng feature khi có thay đổi thật.
5. **3.5** — Dọn dependency trực tiếp theo imports/Knip. Giữ workspace packages và các adapter OpenAPI. `dev`/`build` không yêu cầu frontend DB; các dịch vụ monitoring tùy chọn tắt được khi local.

**Gate:** `check:types`, `migration:check`, `check:deps` theo baseline đã xử lý; không có `/api/counter` trong route manifest; API key/secret không xuất hiện trong HTML/browser bundle; runtime config vẫn thay được mà không rebuild; auth/session test pass.

## Giai đoạn 4 — Đưa i18n/routing về next-intl (P1, L, risk HIGH)

1. **4.1** — Tạo bảng mapping locale dựa trên `src/i18n/locale.ts` và `languages.ts`; không làm mất locale Dify chỉ vì AppConfig demo có ba locale. Giữ giá trị locale gửi Console API và legacy cookie aliases tương thích.
2. **4.2** — Tạo bộ chuyển message có phát hiện collision: khóa phẳng chứa dấu chấm sang object, `{{var}}` sang ICU, plural/context sang ICU tương ứng, rich text, apostrophe/braces escaping. Giữ empty-string có chủ đích và fallback namespace (ví dụ Contacts chỉ có một số locale). Case không chuyển an toàn phải báo lỗi có vị trí, không tự dịch/đoán.
3. **4.3** — Tạo `libs/I18n.ts` nạp namespace từ `locales/`, type augmentation riêng `types/next-intl.d.ts`; bật next-intl plugin trong next config và giữ loader/transpile/external của Dify.
4. **4.4** — Pilot Home trước: `useTranslations`/`getTranslations`, metadata, locale switcher và next-intl provider; feature chưa chuyển vẫn dùng i18next tạm, cả hai đọc cùng locale. Không nạp toàn bộ message mọi ngôn ngữ xuống client.
5. **4.5** — Sau pilot, chuyển các route page vào `[locale]` theo manifest và hợp nhất root providers. Chỉ một owner render `html/body`. Dùng `localePrefix: 'never'` để URL người dùng, callback và share token không đổi. Compose locale rewrite với CSP/nonce/frame protection/WebApp document gate trong `proxy.ts`; không copy Clerk middleware upstream. Header pathname/search phải phản ánh URL canonical đã kiểm thử.
6. **4.6** — Chuyển auth/settings, console, workflow/agent/knowledge rồi published WebApp theo batch. Trong mỗi batch đổi cả selector translation, type utility, metadata, thông báo lỗi và tests. Xử lý `#i18n`, `types/i18n.d.ts` và navigation facade theo consumers; chỉ xóa adapter/i18next dependencies khi không còn consumer thực.

**Gate:** converter tests kiểm interpolation, plural, rich text, collision và empty translation; parity inventory không giảm locale/namespace; smoke en-US/vi-VN/zh-Hans và một locale RTL; `check:i18n` dùng corpus Dify đích thay demo; route matrix đảm bảo `/`, `/signin`, `/install`, `/apps`, OAuth callback, token WebApp, basePath và các API không bị prefix/redirect loop. Cross-request locale/auth isolation test phải pass. Nếu phải thay backend callback contract để chuyển locale: STOP.

## Giai đoạn 5 — Tooling và chất lượng theo upstream (P2, M/L)

1. **5.1** — Đồng bộ cấu trúc config Oxlint/Ultracite/Oxfmt/Knip/Vitest/Playwright/Storybook với upstream đã ghim. Giữ version catalog của monorepo; không tạo lockfile npm/bun hoặc copy root package.json upstream.
2. **5.2** — Port legacy tests từ compatibility project sang Browser từng feature khi thích hợp. Node-only logic vẫn ở project Node; explicit list test phụ thuộc mock/server không chạy Browser. Không được biến mất test bằng cách đổi glob. Cuối đợt không còn tests ngoài discovery hoặc compatibility debt không có owner.
3. **5.3** — Sửa `oxfmt.config.ts` stylesheet path tới entrypoint mới; Storybook cùng alias/loader/i18n/theme/runtime env như app. Stories phải render được trong light/dark và locale pilot.
4. **5.4** — Trước khi bỏ `ignoreBuildErrors`, chứng minh checker hỗ trợ OpenAPI mapper. Nếu Next checker không hiểu mapper, CI bắt buộc chạy `tsrs --runExternalCode` trước build và ghi ngoại lệ rõ ràng; không tuyên bố Next build đang typecheck khi thực tế bỏ qua.
5. **5.5** — Lefthook chỉ xử lý file staged có liên quan SaaS, không auto-format toàn bộ mã Dify hoặc kích hoạt hook root mới ngoài phạm vi. Gate lint chỉ xanh khi không có lỗi mới và backlog cũ đã có lộ trình đến 0; không tắt rule toàn cục để đạt màu xanh.

**Gate:** `check:types`, `lint`, `check:deps`, `check:i18n` exit 0 ở trạng thái đích; selected unit/UI/Storybook tests pass. Chạy full suite trên CI với worker cap; không chạy suite lớn vô hạn trên máy local.

## Giai đoạn 6 — Build, CI và chuyển deployment frontend (P2, M)

1. **6.1** — Thêm CI SaaS có install frozen lockfile, checker, lint/deps/i18n, tests, Storybook và production build. Actions/npm scripts upstream phải được chỉnh cho pnpm workspace. Không hard-code browser image khác version Playwright đang resolve; pin tương thích khi triển khai.
2. **6.2** — Thiết kế build Docker frontend SaaS riêng có workspace package artifacts, public assets, source tracing và runtime env tương thích. Không đổi API image hoặc main compose mặc định sang SaaS trước smoke/staging pass. Tạo đường chọn rõ ràng giữa legacy web và saas.
3. **6.3** — Kiểm tra production SSR/API reachability, cookie/CSRF, websocket, uploads và share routes bằng backend Dify tương ứng. Image API local dùng khi khảo sát là published 1.19.0; không giả định mọi endpoint mới trong source checkout có sẵn trên mọi image.
4. **6.4** — Chỉ đổi default deployment sau khi staging đạt parity matrix. Giữ rollback sang web; không xóa web trong kế hoạch này.

**Gate build có giới hạn tài nguyên:**

```sh
rtk proxy env NODE_OPTIONS=--max-old-space-size=4096 nice -n 10 pnpm -C saas build
```

Kỳ vọng exit 0. Sau build, chạy start trên cổng kiểm tra riêng bằng script đã cấu hình và chạy Playwright smoke với tối đa hai worker. Toàn bộ route/auth/template-modal smoke phải chạy trên production output, không chỉ Next dev. CI phải fail khi checker/test thất bại. Tài liệu ghi rõ các khác biệt có chủ đích so với upstream.

## Done criteria tổng thể

- [ ] Route manifest không có route vô ý từ thư mục UI; URL bên ngoài tương thích.
- [ ] UI ngoài `app` theo manifest; một entrypoint CSS dùng chung app/Storybook.
- [ ] Một Env schema owner, giữ runtime injection và server/client separation.
- [ ] next-intl là i18n runtime đích; không mất locale, empty string hay interpolation.
- [ ] Test inventory được reconcile, không còn .spec bị bỏ qua im lặng.
- [ ] `pnpm -C saas migration:check` (script tạo ở giai đoạn 1) exit 0.
- [ ] `check:types`, `lint`, `check:deps`, `check:i18n` exit 0; các test được chọn pass.
- [ ] CI production build và E2E với Dify pass; không phụ thuộc demo Counter/PGlite/Clerk.
- [ ] Auth/workspace/permissions, workflow preview/editor, template modal, share app và locale pass parity matrix.
- [ ] Các thay đổi UI trước kế hoạch được giữ; chỉ paths trong scope thay đổi.
- [ ] README upstream deviations, run commands, deployment switch và rollback được cập nhật.

## STOP, rollback và bảo trì

- Nếu HEAD/các excerpt hoặc working-tree delta khác snapshot khảo sát, đối chiếu trước khi di chuyển; không ghi đè thay đổi người dùng.
- Nếu converter gặp message không biểu diễn an toàn bằng ICU, dừng feature đó và ghi ví dụ; không thay placeholder/translation bằng chuỗi đoán.
- Nếu đổi URL/cookie/CSRF, chia sẻ tenant state giữa request, mất app access gate hoặc cần thay backend/schema: STOP.
- Nếu cần bỏ cả bộ test hoặc disable checker để build: STOP. Nếu một gate thất bại hai lần sau xử lý có căn cứ: báo blocker.
- Rollback theo PR/giai đoạn; không reset repo hoặc xóa dữ liệu. Giai đoạn routing/i18n phải có rollback về runtime cũ cho đến khi parity đạt.
- Khi cập nhật upstream sau này, dùng bảng deviations và diff commit đã ghim; không ghi đè tự động toàn bộ saas bằng template mới.
- Chưa audit sâu bảo mật/backend/performance toàn dự án; runtime production, độ phủ thật của test và thời gian triển khai cần xác lập trong baseline. Không có ước lượng ngày hoàn thành đáng tin cậy trước pilot i18n và test harness.
