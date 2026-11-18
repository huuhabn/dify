# Kiểm duyệt nghiêm ngặt cho các lượt gọi mô hình (Strict moderation for model invocations)

`ModerationService.check` là một use case có thể tái sử dụng cho các tính năng hiện có: `keywords`, `openai_moderation` và `api`. Nó nhận một `AppRequestContext` đã được tiếp nhận, một `ModerationRule`, văn bản, và giai đoạn `input` hoặc `output`. Nó không phụ thuộc vào Flask, persistence model hay bộ quản lý hàng đợi ứng dụng (app queue managers).

Một giai đoạn (phase) được bật chỉ trả về sau khi được phê duyệt. Bất kỳ kết luận vi phạm (flagged verdict) nào cũng sẽ kích hoạt `ModerationRejectedError`, bao gồm cả các kết luận API yêu cầu thay thế thay vì từ chối. Lỗi backend sẽ được lan truyền thay vì âm thầm phê duyệt văn bản. Các giai đoạn bị tắt sẽ không thực hiện bất kỳ I/O kiểm duyệt nào. Các chính sách nghiêm ngặt được chọn khi lắp ráp mô hình (model assembly). Các quy tắc OpenAI cấp ứng dụng tiếp nhận các lỗi nền tảng có kiểu (typed platform failures) để áp dụng hành vi thay thế đã cấu hình; chúng không bao giờ lên lịch một lượt kiểm tra OpenAI thứ hai.

## Kiểm duyệt nền tảng tự động (Automatic platform moderation)

`HOSTED_MODERATION_ENABLED` kiểm soát tính năng kiểm duyệt nền tảng tự động trên Cloud và mặc định là `false`. Nó chỉ có hiệu lực khi `DEPLOYMENT_EDITION=CLOUD`, khớp với ranh giới phiên bản dùng để cấu thành hạn ngạch AI Credits. Các triển khai ngoài Cloud sẽ bỏ qua switch này. Khi bị tắt hoặc ngoài Cloud, không có chính sách tự động nào được tạo ra hoặc inject vào. Các chính sách mô hình tường minh và kiểm duyệt từ khóa/API cấp ứng dụng vẫn khả dụng trong mọi phiên bản. Tính năng Kiểm duyệt Mô hình cấp ứng dụng (App-level Model Moderation) là một no-op âm thầm khi mô hình không được chấp nhận cho kiểm duyệt tín dụng AI tự động; việc bật cấu hình ứng dụng của nó không đồng nghĩa với việc chọn một provider kiểm duyệt cho tenant.

Khi được bật, các Cloud LLM sử dụng system provider có hạn ngạch nhóm tín dụng (credit-pool quota) hiện tại là `TRIAL` hoặc `PAID` sẽ tự động nhận tính năng kiểm duyệt đầu vào và đầu ra. Điều này bao gồm các hạn ngạch `CREDITS` và hạn ngạch cũ `TIMES` (vốn giữ trước 1 credit cho mỗi lượt gọi). Quy tắc này áp dụng cho các mô hình do manager tạo, các lượt truy cập trúng credential-cache, và các cấu trúc `ModelInstance` trực tiếp, bao gồm cả các hạn ngạch tín dụng đã cạn kiệt hoặc không giới hạn. Các chế độ hạn ngạch Cloud dùng key tùy chỉnh (custom-key), phi LLM và dựa trên token không nhận chính sách tự động này. Việc chỉ cấu hình định danh dự phòng (fallback identifier) không tự động kích hoạt kiểm duyệt.

Ví dụ: một quản trị viên có thể bật kiểm duyệt và ghim một fallback tùy chọn:

```dotenv
DEPLOYMENT_EDITION=CLOUD
HOSTED_MODERATION_ENABLED=true
HOSTED_OPENAI_API_KEY=<server-owned-api-key>
HOSTED_MODERATION_PLUGIN_UNIQUE_IDENTIFIER=langgenius/openai:<version>@<checksum>
```

Chính sách này sử dụng `langgenius/openai/openai` / `omni-moderation-latest` với `HOSTED_OPENAI_API_KEY` do máy chủ sở hữu cùng các cài đặt tùy chọn về base/organization của OpenAI. Các thông tin xác thực này không yêu cầu phải bật OpenAI LLM trial/paid provider hoặc khởi tạo hạn ngạch Cloud hosting. Trước tiên, nó khám phá provider `langgenius/openai/openai` của tenant và yêu cầu bản cài đặt từ Marketplace, khả năng kiểm duyệt, danh tính gói chính thức và manifest đã được xác minh. Nếu lộ trình đó vắng mặt, không đáng tin cậy hoặc thất bại, nó sẽ sử dụng `HOSTED_MODERATION_PLUGIN_UNIQUE_IDENTIFIER`, một fallback `langgenius/openai:<version>@<checksum>` được ghim sẵn do SRE cung cấp. Kết luận vi phạm là quyết định cuối cùng: nó không bao giờ kích hoạt fallback để tìm kiếm một kết luận khác. Định danh fallback chỉ được xác thực nếu cần; một plugin tenant hoạt động tin cậy không yêu cầu nó. Việc thiếu cả hai lộ trình, thiếu thông tin xác thực nền tảng hoặc backend không hoạt động sẽ dẫn đến lỗi đóng (fail closed). API key của người dùng không bao giờ bị đem ra thay thế.

Lộ trình tenant đã xác minh sử dụng `/plugin/{tenant_id}/dispatch/moderation/invoke`, ủy quyền cho plugin thông qua bản ghi cài đặt của tenant. Thay vào đó, lộ trình fallback SRE sử dụng `/v2/invoke/dispatch/moderation/invoke` với header bắt buộc `X-Plugin-Unique-Identifier` và `tenant_id` đã được tiếp nhận trong JSON. Cả hai lộ trình đều giữ xác thực server-key của daemon, thông tin xác thực nền tảng và danh tính gói được ghim. Một request tùy ý từ client không thể tự chọn direct dispatch hoặc thay thế định danh fallback do server quản lý.

Lộ trình v2 là bề mặt gọi runtime trực tiếp sẵn có của daemon, ban đầu được giới thiệu cho các cuộc gọi CLI từ xa Slim. Nó phân tích định danh được cung cấp, giữ nguyên ngữ cảnh thực thi tenant và định tuyến cụm, đồng thời không truy vấn các bản cài đặt plugin của tenant. Nó không phải là một endpoint cài đặt hay API công khai của tenant. Runtime dự phòng phải được triển khai trước và sẵn sàng cho daemon; direct dispatch không tự động tải một package bị thiếu. Fallback vẫn là quyết định tin cậy do SRE sở hữu, trong khi các package do tenant chọn vẫn cần kiểm tra Marketplace và manifest đã xác minh. Kiểm duyệt không tạo một instance mô hình tenant hay đi qua `CreditPoolService`, vì vậy nó không giữ trước cũng như không trừ credit của người dùng. LLM đích vẫn giữ nguyên cơ chế hạch toán bình thường, bao gồm việc tính phí dung lượng đã tiêu thụ khi đầu ra bị từ chối.

Tính năng cũ `HostingModerationFeature` và danh sách cho phép `HOSTED_MODERATION_PROVIDERS` đã bị loại bỏ. `HOSTED_MODERATION_ENABLED` kiểm soát chính sách nền tảng Cloud. Việc kiểm tra đoạn văn bản đầu vào ngẫu nhiên trước đây được thay thế bằng kiểm tra phân đoạn hoàn chỉnh (complete segmented checks).

Một chính sách được cung cấp tường minh sẽ bổ sung cho kiểm duyệt nền tảng đang bật thay vì vô hiệu hóa nó. Khi switch bị tắt, chỉ có chính sách tường minh được áp dụng.

## Sở hữu cấp ứng dụng và cơ chế thay thế (App-level ownership and replacement)

Mỗi bộ bảo vệ mô hình (model guard) sở hữu độc quyền các lượt kiểm tra đầu vào và đầu ra của nó. Kiểm duyệt Mô hình cấp ứng dụng (App Model Moderation) không bao giờ chủ động gọi OpenAI, chọn thông tin xác thực hoặc lưu cache nội dung đã được phê duyệt. Cấu hình của nó chỉ chọn câu trả lời thay thế khi có một sự từ chối thực tế từ nền tảng. Việc vô hiệu hóa một giai đoạn của ứng dụng không vô hiệu hóa các bước kiểm tra bắt buộc của nền tảng. Các lượt gọi mô hình khác nhau vẫn độc lập ngay cả khi nội dung văn bản của chúng giống hệt nhau.

Các bước kiểm tra và lựa chọn câu trả lời của ứng dụng là các hàm không trạng thái (stateless functions) dựa trên cấu hình ứng dụng đã được tiếp nhận. Khởi động ứng dụng sẽ inject một port chính sách phi trạng thái. Không có bản ghi thực thi, biến ngữ cảnh, hàng đợi thất bại hoặc kênh phụ từ mô hình tới phản hồi nào. Mỗi lần gọi mô hình vẫn tự thực hiện các bước kiểm tra riêng của mình.

Các kết luận đầu vào của ứng dụng được xử lý trước khi sinh nội dung: việc từ chối xuất trực tiếp (direct-output rejection) sẽ trả về câu trả lời cài đặt sẵn (preset) như một câu trả lời bình thường, trong khi các ghi đè (overrides) tiếp tục với các đầu vào đã được viết lại. Các kết luận đầu ra của ứng dụng được xử lý bởi consumer phản hồi, không phải dưới dạng lỗi node. Chúng thay thế câu trả lời thông qua các sự kiện tin nhắn thông thường và lưu lại nội dung thay thế đó.

Các lỗi nội bộ của mô hình vẫn thuộc trách nhiệm của Graphon. Các cơ chế thử lại (retries), giá trị mặc định, nhánh lỗi, sự kiện node và trạng thái kết thúc không bị thay đổi. Một lỗi từ chối mô hình đã xử lý hoặc kiểm tra không khả dụng không bao giờ ghi đè lên một câu trả lời đã được phục hồi. Một lỗi xảy ra sau đó không được phân loại lại dựa trên kết quả kiểm duyệt trước đó. Các workflow thất bại vẫn giữ nguyên hợp đồng lỗi gốc của Graphon; không có kiểu ngoại lệ nào được dựng lại từ văn bản hoặc sự kiện node trong lịch sử. Điều này không yêu cầu thay đổi Graphon hay phụ thuộc của nó.

Các quy tắc ứng dụng về Từ khóa và API vẫn sử dụng `ModerationService.evaluate` và giữ lại ngữ nghĩa phản hồi trực tiếp (direct-reply) và ghi đè văn bản (text-override). Chúng là các chính sách độc lập, không phải kiểm tra lặp lại OpenAI, và không thể vượt qua kiểm duyệt nền tảng. Backend đầu vào chỉ nhận các biến dạng chuỗi và câu truy vấn. Tệp tin, danh sách tệp và các giá trị phi văn bản khác không bị kiểm tra cũng như không được gửi đến các API extension; chúng giữ nguyên không đổi cho quá trình sinh nội dung, kể cả khi API ghi đè văn bản đầu vào. Tên tệp, URL, metadata và nội dung nhị phân không phải là văn bản kiểm duyệt.

Kiểm tra đầu ra chạy tuần tự trên consumer phản hồi mà không cần khóa worker hay khóa đánh giá. Kiểm tra streaming chỉ kiểm tra các phân đoạn mới; kiểm tra completion chỉ kiểm tra phần đuôi chưa được kiểm tra, không bao giờ kiểm tra lại toàn bộ stream. Câu trả lời trực tiếp thay thế toàn bộ phản hồi; ghi đè API thay thế phân đoạn bị đánh dấu trong khi giữ lại phần đầu ra trước đó và các delta sau này. Đầu ra dạng chặn (blocking output) sử dụng kích thước phân đoạn non-stream. Các phân đoạn không có sự chồng lấn hoặc ngữ cảnh xuyên ranh giới. Văn bản stream chưa kiểm tra sẽ được đệm lại thay vì hiển thị hoặc gửi đến bộ tổng hợp giọng nói. Một phân đoạn ngắn cuối cùng sẽ được kiểm tra trước khi phân phát. Chỉ các tiền tố đã được phê duyệt mới có thể nhìn thấy trước khi có một sự thay thế sau đó. Trước khi một Chatflow tạm dừng để đợi người dùng nhập liệu, phần đuôi đầu ra đang chờ xử lý của nó sẽ được kiểm tra và phân phát trước sự kiện `workflow_paused`. Ảnh chụp nhanh khi tạm dừng lưu trữ câu trả lời đã được phê duyệt hoặc đã được thay thế, vì vậy việc tiếp tục lại sẽ không làm mất văn bản được đệm hoặc kiểm tra lại phần tiền tố.

Các điểm vào ứng dụng (application entry points) gọi cùng một adapter ứng dụng phi trạng thái; không cần wrapper request nào để kích hoạt hành vi chính xác. Các caller kernel độc lập không có container ứng dụng vẫn giữ phương án dự phòng factory từ khóa/API. Nút bật App OpenAI của chúng vẫn là no-op và không bao giờ chọn một provider tenant độc lập. Việc sử dụng độc lập khả năng OpenAI vẫn giữ nguyên thông tin xác thực của tenant, việc hạch toán và hành vi xử lý lỗi. Đó là một thao tác độc lập rõ ràng, không phải là đường dẫn thực thi được chọn bởi nút bật App Model Moderation.

Điểm vào `/invoke/app` của plugin sử dụng cùng hành vi sinh nội dung của ứng dụng. Lệnh gọi xác thực quyền sở hữu của tenant trước khi thực hiện công việc mô hình. Các request lồng nhau hoặc tiếp theo không có trạng thái kiểm duyệt tích lũy để kế thừa.

Các cuộc gọi gateway Remote Agent LLM không vận chuyển các kiểu lỗi node workflow cục bộ. Kiểm duyệt Mô hình ứng dụng cục bộ không bao giờ phát hành các kiểm tra hosted hoặc tenant và không thể suy ra một kết luận từ xa có kiểu từ văn bản. Các quy tắc ứng dụng đã cấu hình khác vẫn độc lập. Một cờ phê duyệt do client cung cấp tuyệt đối không bao giờ được phép bỏ qua các bước kiểm tra của nền tảng.

Đối với việc sinh nội dung Chatbot trực tiếp và Agent Chat cũ, quy tắc OpenAI ứng dụng được bật sẽ sử dụng câu trả lời đặt trước (preset) không rỗng của giai đoạn cụ thể đó khi nền tảng từ chối lượt gọi. Các chế độ chat này sử dụng mặc định tiếng Anh `This message can’t be processed.` khi không có preset phù hợp nào được cấu hình, bao gồm cả khi kiểm duyệt ứng dụng hoặc giai đoạn đó bị tắt. Giá trị mặc định được giải quyết lúc runtime, không được ghi vào cấu hình ứng dụng. Các backend kiểm duyệt ứng dụng khác giữ lại các quy tắc kết luận và thay thế riêng của chúng; preset của chúng không được tái sử dụng cho một trường hợp từ chối nền tảng riêng biệt.

Phản hồi chat sử dụng sự kiện `message` hoặc `message_replace` hiện có, tiếp theo là `message_end`, mà không để lộ phân đoạn bị từ chối. Một bản thay thế bao quát toàn bộ câu trả lời, bao gồm cả bất kỳ tiền tố nào đã được phân phát trước đó, và câu trả lời được lưu trữ khớp với bản thay thế. Việc render nó không gọi lại mô hình hay ước tính lại lượng token sử dụng. Chatflow không có nhánh chuyển ngoại lệ nền tảng thành preset: các trường hợp node mô hình bị từ chối sẽ tuân theo chiến lược lỗi node đã cấu hình của chúng. Các kết luận đầu vào và đầu ra từ khóa/API của chính nó vẫn sử dụng cơ chế xử lý thay thế thông thường của App, mà không ép buộc lỗi node nội bộ đè lên kết quả của chính workflow.

Các lượt kiểm tra không khả dụng là lỗi kỹ thuật, không phải kết luận nội dung, và không bao giờ trở thành câu trả lời. Lỗi kiểm tra App trực tiếp và lỗi mô hình có kiểu không được xử lý sẽ sinh ra lỗi an toàn `moderation_unavailable`. Lỗi workflow nội bộ giữ nguyên hình chiếu gốc của Graphon. Sự không khả dụng trong lịch sử không thể thay đổi một phản hồi thành công hoặc phân loại lại một lỗi kết thúc không liên quan. Không có kiểm tra không khả dụng nào trở thành preset hoặc câu trả lời chat mặc định. Lỗi chính sách mô hình tường minh ngoài nền tảng cũng được giữ nguyên. Completion, Workflow, RAG và các đường dẫn non-chat khác giữ lại lỗi kiểm duyệt thông thường khi không có preset phù hợp. Các lỗi Remote New Agent giữ lại cơ chế xử lý transport hiện có; các lỗi upstream tùy ý không được suy đoán là bị nền tảng từ chối từ văn bản của chúng.

Các trường hợp nền tảng từ chối sẽ phát ra log cảnh báo chứa tenant, app và giai đoạn (phase). Lỗi trên lộ trình tenant cũng ghi log cảnh báo fallback. Nội dung được kiểm duyệt và API key không bao giờ được đưa vào các thông điệp log này.

## Lỗi ứng dụng (App errors)

Các bộ bảo vệ gắn liền với mô hình sẽ điều chỉnh lỗi kiểm duyệt theo hợp đồng `AppGenerateError` hiện có, nhờ đó cơ chế xử lý lỗi tác vụ sẽ bảo toàn chúng và bộ chuyển đổi phản hồi sẽ phát ra sự kiện SSE `error` thông thường. Các client Console sử dụng toast thông báo lỗi hiện có của chúng:

Lỗi ứng dụng mang các định danh kiểm duyệt ổn định và thông báo an toàn, không mang mã trạng thái HTTP hay payload phản hồi. Các HTTP handler và bộ chuyển đổi phản hồi SSE chỉ chuyển đổi chúng thành các ngoại lệ HTTP chuyên dụng sau khi đã cân nhắc việc thay thế câu trả lời. Những ngoại lệ HTTP đó sở hữu mã trạng thái, mã lỗi công khai và phần mô tả, giữ cho ánh xạ HTTP và SSE luôn nhất quán. Các lỗi backend đầu vào và đầu ra của từ khóa/API được điều chỉnh thành cùng một lỗi không khả dụng; thông tin chẩn đoán riêng tư vẫn nằm trong nguyên nhân gốc (cause) và log máy chủ, không bao giờ có trong phản hồi gửi tới client.

| Điều kiện | Mã lỗi (Code) | Trạng thái sự kiện (Event status) | Thông báo (Message) |
| --- | --- | --- | --- |
| Nội dung bị từ chối | `moderation_rejected` | 400 | Thông báo từ chối đã cấu hình, hoặc fallback theo từng giai đoạn cụ thể |
| Kiểm tra không khả dụng hoặc thất bại | `moderation_unavailable` | 503 | This message can’t be processed right now. Please try again later. |

Các trạng thái này mô tả payload lỗi SSE, không phải mã trạng thái HTTP của một stream đã được mở. Các request non-streaming trên Console, Service API và Web API trả về cùng mã và thông báo với mã trạng thái HTTP tương ứng. Lỗi kiểm tra giữ lại nguyên nhân gốc trong log backend nhưng không bao giờ để lộ thông tin xác thực nền tảng hoặc chẩn đoán plugin cho client. Lỗi tạo từ provider giữ lại phân loại hiện có của chúng. Khi một lỗi xuất hiện, các phân đoạn đã được phê duyệt vẫn hiển thị; cả hai lỗi đều không gửi đi phân đoạn bị từ chối hoặc chưa được kiểm tra.
Các ứng dụng chat có thể render việc từ chối của nền tảng bằng một preset khớp hoặc câu trả lời mặc định được mô tả ở trên thay vì trả về payload lỗi này.

Lỗi đánh giá đầu ra của ứng dụng sử dụng cùng hợp đồng `moderation_unavailable`. Consumer phản hồi sẽ dừng ngay việc tiêu thụ đầu ra trong hàng đợi, lưu trạng thái lỗi của tin nhắn và phát ra sự kiện lỗi hiện có. Handler giữ lại lỗi đầu tiên mà không cần khóa; completion không thể thử lại để biến nó thành phê duyệt. Đầu ra cấp ứng dụng đã được gửi đi sẽ không bị rút lại bởi lỗi này; các model guard của nền tảng tiếp tục kiểm tra các phân đoạn trước khi phân phát.

## Lệnh gọi mô hình (Model invocation)

Lấy service từ composition root và liên kết chính sách trong quá trình lắp ráp mô hình (model assembly). Các lượt gọi mô hình riêng lẻ không bao giờ chấp nhận một ghi đè kiểm duyệt:

```python
from core.plugin.impl.model_runtime_factory import create_plugin_model_assembly
from extensions.application_services.moderation import build_llm_moderation_guard
from extensions.ext_application_services import application_services
from graphon.model_runtime.entities.model_entities import ModelType
from machinery.context import AppRequestContext
from services.moderation_service import ModerationRule

guard = build_llm_moderation_guard(
    AppRequestContext(tenant_id=tenant_id, app_id=app_id),
    service=application_services().moderation,
    rule=ModerationRule(
        type="keywords",
        config={
            "keywords": "blocked phrase\nanother phrase",
            "inputs_config": {"enabled": True, "preset_response": "Input rejected"},
            "outputs_config": {"enabled": True, "preset_response": "Output rejected"},
        },
    ),
)

assembly = create_plugin_model_assembly(tenant_id=tenant_id, moderation=guard)
model_instance = assembly.model_manager.get_model_instance(
    tenant_id=tenant_id,
    provider=provider,
    model_type=ModelType.LLM,
    model=model_name,
)
result = model_instance.invoke_llm(prompt_messages=prompt_messages, stream=False)
```

Sử dụng cùng cấu trúc cấu hình như kiểm duyệt ứng dụng. OpenAI sử dụng `type="openai_moderation"`; extension API sử dụng `type="api"` với `api_based_extension_id` được giới hạn trong tenant đã tiếp nhận. Một `app_id` rỗng được cho phép đối với các lệnh gọi không thuộc ứng dụng; các extension API sẽ nhận nó mà không đổi. Guard sẽ snapshot cấu hình để các biến đổi sau đó từ caller không thể vô hiệu hóa các bước kiểm tra của nó.

`ModelManager.for_tenant(..., moderation=guard)`, `create_plugin_model_manager(..., moderation=guard)`, và việc khởi tạo trực tiếp `ModelInstance(..., moderation=guard)` đều hỗ trợ cùng một liên kết này. Chính sách đi theo mọi LLM do manager tạo, bao gồm cả thông tin xác thực trong bộ nhớ cache và việc phân giải mô hình mặc định. Nó được hiển thị dưới dạng chỉ đọc trên instance, và các liên kết tenant không khớp sẽ thất bại trước khi phân giải thông tin xác thực. Các khả năng phi LLM không kế thừa các chính sách LLM, do đó các cuộc gọi mô hình kiểm duyệt không tự kiểm duyệt đệ quy chính chúng.

Chủ sở hữu assembly cung cấp một phạm vi đáng tin cậy cho các chính sách tường minh. Việc lựa chọn tự động sử dụng cấu hình hạn ngạch triển khai và provider đáng tin cậy, không bao giờ dùng metadata của request do caller cung cấp. Các giao diện runtime/client plugin thô vẫn là hạ tầng, không phải là các điểm vào nghiệp vụ được kiểm duyệt.

Cả hai giới hạn phân đoạn đều bắt buộc khi tạo một guard. Assembly production luôn cung cấp các giới hạn số dương đã được cấu hình; không có chế độ đệm toàn bộ stream không giới hạn nào được chọn khi bỏ qua giới hạn.

## Đảm bảo và đánh đổi (Guarantees and trade-offs)

- Kiểm tra đầu vào diễn ra trước khi gọi mô hình và giữ trước hạn ngạch. Tất cả các vai trò prompt, các phần văn bản của tin nhắn đa phương thức (multimodal), và các đối số công cụ assistant đều được kiểm tra dưới dạng các phân đoạn non-stream độc lập, do đó các prompt dài được bao quát hoàn toàn mà không cần gửi một request kiểm duyệt quá khổ. Mỗi tin nhắn prompt được nền tảng kiểm tra có chuỗi phân đoạn riêng. Mỗi lần gọi mô hình thực hiện các bước kiểm tra riêng của nó; việc xử lý phản hồi của ứng dụng không lên lịch một request kiểm duyệt khác.
- Các dictionary Agent gateway không trong suốt được kiểm tra thông qua các bản sao đã được xác thực. Payload gốc và các trường extension đặc thù của provider được chuyển tiếp mà không đổi.
- Kiểm tra đầu ra kiểm tra văn bản completion, đối số công cụ và payload cấu trúc gốc ngay cả khi văn bản tin nhắn của chúng trống. Nội dung hình ảnh, âm thanh, video và tài liệu nhị phân không được kiểm tra bởi các backend kiểm duyệt văn bản này.
- Tên công cụ được kiểm tra ở cả đầu ra streaming và non-streaming, bao gồm cả các delta chỉ có tên. Các trường tên streaming được thu thập riêng biệt để metadata công cụ lặp lại không thể làm phân mảnh văn bản đối số đang được kiểm tra.
- Đầu ra non-stream được kiểm tra theo các phân đoạn độc lập có kích thước `MODERATION_NON_STREAM_SEGMENT_SIZE` ký tự. Mọi phân đoạn phải vượt qua trước khi kết quả gốc được trả về.
- Đầu ra streaming được đệm cho đến khi đạt `MODERATION_BUFFER_SIZE` ký tự, sau đó được kiểm tra trước khi các chunk gốc được giải phóng. Phân đoạn một phần cuối cùng cũng được kiểm tra trước khi phát hành. Các chunk của provider được giữ nguyên vẹn, do đó một phân đoạn có thể vượt quá ngưỡng đã cấu hình. Một trường hợp từ chối sau đó sẽ dừng stream và giữ lại các phân đoạn đã được phân phát trước đó; các consumer cấp mô hình hiện tại không thể rút lại các byte đó.
- Phân đoạn là ranh giới kiểm duyệt: mỗi phân đoạn được kiểm tra độc lập, không mang văn bản qua ranh giới phân đoạn hoặc kiểm tra lại toàn bộ tài liệu khi hoàn thành. Nội dung yêu cầu ngữ cảnh liên phân đoạn có thể không được phát hiện. Mặc định là 2000 ký tự cho đầu vào và đầu ra non-stream, và ngưỡng đệm 300 ký tự cho đầu ra streaming ở cả kiểm duyệt cấp ứng dụng và cấp mô hình.
- Lượng sử dụng mô hình đã tiêu thụ được quyết toán trước khi kiểm tra đầu ra, bao gồm cả các completion bị từ chối. Lỗi provider hoặc lỗi kiểm duyệt không phải là sự phê duyệt hay việc thử lại mô hình.
- Đầu ra có cấu trúc (structured output) tự động sử dụng chính sách của instance mô hình của nó. Quá trình polling của workflow áp dụng chính sách tương tự trước khi gửi tác vụ và cho các kết quả kết thúc thành công, sau khi quyết toán mức độ sử dụng. Đầu vào bị từ chối sẽ không gửi tác vụ cũng như không giữ trước hạn ngạch mô hình; đầu ra thành công bị từ chối không được hoàn lại hạn ngạch đã tiêu thụ.
- Guard bảo vệ các kết quả trả về, không bảo vệ các observer callback cấp provider. Các callback không được tự ý phát hành nội dung mô hình chưa qua kiểm duyệt.
- Các mô hình nằm ngoài tính năng kiểm duyệt nền tảng tự động đang bật vẫn giữ nguyên hành vi gọi và streaming hiện có trừ khi một chính sách tường minh được cung cấp.

Adapter API tải các bản ghi extension trong phạm vi tenant trong một session repository ngắn, sau đó giải mã thông tin xác thực và thực hiện HTTP bên ngoài session đó. Nó yêu cầu một trường boolean `flagged` rõ ràng trong mọi kết luận API.

## Xử lý sự cố RAG (RAG failure handling)

`ModerationInvocationError` xác định các lỗi kiểm duyệt mô hình mà không để lộ các phụ thuộc application-service cho consumer RAG. Cả việc từ chối và việc dịch vụ không khả dụng đều là kết thúc cho thao tác bị ảnh hưởng, không phải là kết quả rỗng mang tính cố gắng tối đa (best-effort empty results). Lỗi đầu vào diễn ra trước khi sử dụng mô hình; lỗi đầu ra giữ nguyên phí mô hình đã tiêu thụ.

Định dạng QA lan truyền các lỗi kiểm duyệt trong chế độ xem trước (preview) và đánh chỉ mục (indexing). Các worker future có giới hạn trả lỗi về cho điều phối viên lập chỉ mục (indexing coordinator), người sẽ đánh dấu tài liệu là bị lỗi thay vì hoàn thành một chỉ mục QA rỗng hoặc một phần. Các worker giữ các lô 10-chunk, do đó một lô bị lỗi sẽ không gửi các lô tiếp theo hoặc phát sinh thêm các lệnh gọi mô hình cho chúng. Các lỗi sinh QA thông thường vẫn giữ nguyên cách xử lý cố gắng tối đa hiện có.

Định tuyến dataset theo function-call cũng lan truyền các lỗi kiểm duyệt. Các lỗi định tuyến thông thường vẫn có thể không chọn dataset nào, nhưng lỗi kiểm duyệt tuyệt đối không bao giờ được hiểu là một truy xuất rỗng thành công.

Lọc metadata tự động ở cả RAG cũ và KnowledgeFS sẽ dừng lại khi có lỗi kiểm duyệt thay vì tiếp tục mà không có điều kiện tự động nào. KnowledgeFS phát ra một sự kiện node thất bại với kiểu ngoại lệ kiểm duyệt và không đưa ra yêu cầu truy xuất. Các lỗi trích xuất và phân tích cú pháp thông thường vẫn giữ nguyên hành vi dự phòng hiện có.

Xem trước tóm tắt đoạn văn và cha-con (parent-child summary previews) bảo toàn các lỗi kiểm duyệt từ các worker future của chúng. Các adapter ước tính đánh chỉ mục và application service chuyển tiếp hợp đồng lỗi kiểm duyệt dùng chung mà không thay đổi, vì vậy các HTTP handler hiện có trả về `moderation_rejected` (400) hoặc `moderation_unavailable` (503) thay vì lỗi ước tính chỉ mục chung chung. Các lỗi xem trước thông thường vẫn giữ các thông báo lỗi tổng hợp hiện có.

Quá trình tạo tóm tắt ngầm ghi nhận `ERROR` trên bản tóm tắt bị ảnh hưởng và không lưu hoặc vector hóa đầu ra LLM bị lỗi. Các phân đoạn khác vẫn có thể hoàn thành; trạng thái lập chỉ mục của tài liệu gốc độc lập với trạng thái tóm tắt của nó.
