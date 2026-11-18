# Kiến trúc Backend

Backend sử dụng kiến trúc ports-and-adapters (cổng và bộ điều hợp), với các application service điều phối domain aggregate và domain service khi độ phức tạp nghiệp vụ đòi hỏi. Mỗi khả năng nghiệp vụ (business capability) là một slice. Các application service nắm giữ các use case và khai báo các port cho mọi thứ chúng cần từ bên ngoài. Các adapter triển khai các port đó, và một tầng transport mỏng tiếp nhận các yêu cầu và chuyển đổi chúng. Một composition root duy nhất sẽ kết nối các thành phần lại với nhau. [Hướng dẫn API agent](../../api/AGENTS.md) yêu cầu đọc tài liệu này trước khi thay đổi backend; tài liệu này giải thích kiến trúc và cách thức đánh giá (review) mã nguồn. Kernel thực thi cũ (legacy execution kernel) chỉ dành cho việc di chuyển (migration-only): tuyệt đối không đề xuất tạo tệp mới hoặc trích xuất triển khai vào đó.

Hầu hết các service hiện có là application service: chúng điều phối các use case, việc lưu trữ dữ liệu (persistence) và các khả năng khác. Các slice đã được di chuyển chủ yếu làm việc với các bản ghi thuần túy (plain records), do đó các quy tắc nghiệp vụ vẫn tập trung trong các application service và repository. Mã domain mới hoặc được trích xuất sẽ nằm trong gói chuyên dụng `api/domain/` được mô tả bên dưới, nơi chứa các domain model đã được trích xuất cho đến nay, chẳng hạn như workflow comments.

Tên lớp không quyết định vai trò kiến trúc. Ví dụ: [`WorkflowRunAgg`](../../api/services/workflow_run_agg.py) điều phối việc thực thi, lưu trữ và phát hành sự kiện, đồng thời phụ thuộc vào các repository cụ thể và hạ tầng runtime. Nó là một thành phần điều phối ứng dụng có sự phụ thuộc kế thừa (legacy coupling), không phải là một DDD aggregate thuần túy. Hãy trích xuất hành vi nghiệp vụ của nó trước khi di chuyển bất kỳ thứ gì vào gói domain; việc chỉ di chuyển hoặc đổi tên toàn bộ lớp sẽ không thiết lập được ranh giới kiến trúc.

## Các tầng kiến trúc (Layers)

Chiều phụ thuộc hướng vào lõi ứng dụng (application core). Các tầng bên ngoài biết về các tầng bên trong; các tầng bên trong không bao giờ biết về các tầng bên ngoài.

- **Transport**: tiếp nhận caller, xác thực đầu vào, ánh xạ đầu vào đó sang input của ứng dụng, gọi một use case, dịch các lỗi ứng dụng thành lỗi giao thức (protocol errors) và tuần tự hóa kết quả trả về. Tầng này không chứa quy tắc nghiệp vụ và không bao giờ can thiệp vào tầng persistence.
- **Application layer (Tầng ứng dụng)**: các application service sở hữu các use case và logic điều phối. Chúng làm việc với các giá trị thuần túy (plain values), danh tính caller đã được tiếp nhận, các domain object và các port mà chúng khai báo. Chúng không bao giờ phụ thuộc vào web framework, ORM, persistence model, cấu hình, hàng đợi tác vụ (task queues), mã transport hoặc các adapter cụ thể.
- **Domain layer (Tầng nghiệp vụ domain)**: các aggregate, entity, value object và domain service sở hữu trạng thái nghiệp vụ, bất biến (invariants), chuyển trạng thái (transitions) và chính sách (policies). Chúng không thực hiện I/O ngoại vi và không phụ thuộc vào tầng ứng dụng hay hạ tầng. Tầng ứng dụng và tầng domain cùng nhau tạo thành lõi ứng dụng (application core); đây là một ranh giới logic, không phải thư mục cũ `api/core/`.
- **Infrastructure (Hạ tầng)**: các repository và adapter khác triển khai các port trên cơ sở dữ liệu, cache, hàng đợi tác vụ, dịch vụ bên ngoài, kernel thực thi và mã nguồn cũ. Chúng phụ thuộc vào các hợp đồng (contracts) mà chúng triển khai, không bao giờ phụ thuộc vào tầng transport.
- **Composition root**: nơi duy nhất lựa chọn các bản triển khai cụ thể, đọc cấu hình và khởi tạo các service. Mọi thành phần khác đều nhận các phụ thuộc của mình thông qua cơ chế này.
- **Persistence models**: chỉ mô tả các bảng cơ sở dữ liệu và không làm gì khác.
- **Shared support types and utilities**: kiểu danh tính caller không phụ thuộc framework và các tiện ích độc lập nghiệp vụ mà bất kỳ tầng nào cũng có thể sử dụng.

Các hợp đồng ranh giới import (import-boundary contracts) mã hóa các quy tắc định hướng này và chạy trong quá trình linting. Hãy coi việc vi phạm ranh giới là một lỗi thiết kế cần sửa, không phải là một trường hợp ngoại lệ để ghi nhận bỏ qua.

## Application services

Một module ứng dụng phải tài liệu hóa ranh giới và các quy tắc nghiệp vụ của nó, bao gồm:

- **Values**: các bản ghi bất biến (immutable records) cho kết quả và dữ liệu đầu vào. Các bản ghi chỉ mang dữ liệu, không mang hành vi; chúng không phải là entity hay value object của DDD chỉ vì chúng được đặt tên là `Entity`. Mỗi trường tùy chọn (optional) đều phải tài liệu hóa ý nghĩa khi nó vắng mặt. Trạng thái thuộc về hợp đồng ứng dụng hoặc thuộc về domain model khi nó tham gia vào hành vi domain, không bao giờ chỉ thuộc về tầng persistence.
- **Ports**: các giao diện do chính consumer sở hữu và được đặt tên theo vai trò mà chúng đảm nhận: persistence cho use case này, truy vấn chỉ đọc (read-only query), gateway tới hệ thống bên ngoài hoặc mã cũ, hoặc một khả năng hẹp như thông báo (notification), xác thực (verification) hoặc mã hóa (encryption). Query port trả về các bản ghi (records). Persistence port hiện tại chấp nhận và trả về các bản ghi, và trả về aggregate trong các slice đã áp dụng aggregate. Tài liệu của một port là hợp đồng mà mọi adapter phải tuân thủ: phạm vi sở hữu (owner scope), ranh giới giao dịch (transaction boundary), các quy tắc nó thực thi, cơ chế đồng thời (concurrency mechanism) đằng sau mỗi quy tắc đó và các lỗi mà nó ném ra.
- **Errors**: một lớp lỗi ứng dụng cơ sở (application error base) cho mỗi slice với các kiểu con cụ thể mang thông báo hướng tới người dùng. Chuyển đổi các lỗi domain thành các lỗi này tại ranh giới ứng dụng khi cần thiết để bảo toàn hợp đồng công khai. Cả lỗi ứng dụng và lỗi domain đều không mang mã trạng thái giao thức (protocol status) hoặc khuôn dạng phản hồi (response shape); lỗi domain thuộc về gói domain và không bao giờ kế thừa từ lỗi ứng dụng.
- **Services**: nhận các port và cài đặt thuần túy khi khởi tạo. Mỗi use case nhận danh tính caller đã tiếp nhận trước tiên, suy ra phạm vi từ danh tính đó, lấy các dữ kiện cần thiết cho hành vi domain, kích hoạt hành vi đó, gọi các port với định danh owner rõ ràng và trả về các bản ghi. Trong các slice chưa có domain model, các quy tắc nghiệp vụ hiện tại vẫn nằm ở đây cho đến khi được trích xuất. Khi đã được trích xuất, domain sẽ là chủ sở hữu quy tắc; không lặp lại quy tắc trong service.

Hãy chia tách một vùng nghiệp vụ lớn thành các hợp đồng chung, các port, mỗi nhóm use-case một module và các adapter, thay vì gom vào một module lớn duy nhất. Một thao tác đọc không có quy tắc nào ngoài phạm vi owner có thể là một query port mà một repository triển khai trực tiếp; hãy thêm service khi thao tác đọc đó phát sinh thêm quy tắc.

## Application services và domain services

Một application service triển khai một use case: nó xác định công việc nào cần thực hiện và theo thứ tự nào. Một domain service triển khai một thao tác nghiệp vụ không thuộc về một entity hay value object một cách tự nhiên. Việc gọi nhiều repository hoặc gửi thông báo là công việc điều phối (orchestration), không phải là lý do để tạo ra một domain service. Các vai trò này tuân theo sự phân tách trong [tài liệu tham khảo DDD của Eric Evans](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf); ranh giới domain không có I/O và các port do ứng dụng sở hữu là chính sách cụ thể của repository này.

| Mối quan tâm | Application service | Domain service |
| --- | --- | --- |
| **Trách nhiệm** | Điều phối một use case và nhánh thành công hoặc thất bại của nó. | Thể hiện một phép tính, quyết định hoặc chính sách nghiệp vụ mà không có entity nào sở hữu tự nhiên. |
| **Đầu vào** | Danh tính caller đã tiếp nhận và dữ liệu đầu vào của use case; tải các dữ kiện khác qua port. | Các domain object và dữ kiện nghiệp vụ rõ ràng đã được caller thu thập sẵn. |
| **Trạng thái** | Điều phối tiến trình; trạng thái nghiệp vụ thuộc về các domain object khi đã có domain model. | Không có định danh hay vòng đời lưu trữ độc lập; hoạt động trên trạng thái được cung cấp. |
| **Phụ thuộc** | Hành vi domain và các port persistence, query, gateway do consumer sở hữu. | Các kiểu domain và helper thuần túy; không chứa repository, application service hay port I/O. |
| **Persistence** | Yêu cầu repository port tải hoặc lưu; adapter sở hữu session và transaction. | Không truy vấn, lưu, commit hoặc dùng ORM object, kể cả qua interface được inject. |
| **Thông báo** | Yêu cầu gửi qua port sau khi commit thành công. | Có thể tạo ra kết quả nghiệp vụ hoặc giá trị sự kiện (event value); không bao giờ tự gửi đi. |

Hãy giữ quy tắc trên chính entity hoặc aggregate khi đó là chủ sở hữu tự nhiên của nó. Chỉ sử dụng domain service cho thao tác domain còn lại có thể liên quan đến nhiều domain object. Một hàm có tên rõ ràng là đủ cho một chính sách phi trạng thái (stateless) nhỏ; không bắt buộc phải tạo interface hoặc class service. Việc đơn thuần tác động đến nhiều object không biến một thao tác thành domain service, và việc dùng domain service không làm cho các thao tác ghi vào nhiều aggregate trở nên nguyên tử (atomic).

## Domain model và tính thuần túy (Purity)

Trong DDD, một **aggregate** là một ranh giới nhất quán (consistency boundary), không phải là phép tổng hợp cơ sở dữ liệu (database aggregation) hay một tập hợp các phụ thuộc hạ tầng:

- **Entity**: một đối tượng nghiệp vụ có định danh tồn tại xuyên suốt các thay đổi trạng thái. Các phương thức của nó thực thi các hành vi hợp lệ của chính nó. Một child entity được thay đổi thông qua aggregate root của nó để root có thể bảo vệ các bất biến trên toàn bộ aggregate.
- **Value object**: một giá trị nghiệp vụ được xác định bởi các thuộc tính của nó, không có định danh độc lập. Nó có thể xác thực các bất biến của mình và cung cấp các thao tác nghiệp vụ; nó không đơn thuần là một bản ghi input hay response của ứng dụng.
- **Aggregate**: một root entity cùng với bất kỳ child entity hoặc value object nào mà các bất biến của chúng phải được duy trì cùng nhau. Root kiểm soát các thay đổi đối với ranh giới. Một entity đơn lẻ cũng có thể là một aggregate; không cần phản chiếu mọi mối quan hệ bảng hay tải toàn bộ vùng nghiệp vụ theo mặc định.
- **Domain service**: một chính sách hoặc thao tác nghiệp vụ không có entity hay value object nào sở hữu tự nhiên. Nó có thể gọi hành vi domain, nhưng phải tôn trọng ranh giới aggregate và không thể bỏ qua các bất biến của chúng.

Logic nghiệp vụ thuần túy có thể thay đổi trạng thái trong bộ nhớ của một aggregate. Tính thuần túy ở đây có nghĩa là không có các hiệu ứng phụ bên ngoài (external side effects) và các phụ thuộc hạ tầng tiềm ẩn, chứ không phải mọi phương thức đều phải trả về một đối tượng bất biến mới. Với cùng một trạng thái nghiệp vụ và đầu vào rõ ràng, quyết định đưa ra phải có tính tái lập (reproducible). Hãy truyền thời gian hiện tại, các định danh được tạo, dữ kiện thành viên hoặc các giá trị chính sách vào khi một quy tắc cần đến chúng; không lấy chúng từ đồng hồ hệ thống, biến toàn cục framework, cấu hình, cơ sở dữ liệu hay hệ thống từ xa bên trong domain.

Aggregate, entity, value object và domain service tuyệt đối không được truy vấn hoặc lưu trữ dữ liệu, quản lý session hoặc transaction, phát thông báo database, điều phối signal, đưa task vào hàng đợi, gửi email, truy cập cache/storage, hoặc gọi API bên ngoài. Việc che giấu các thao tác này đằng sau một repository, notifier, callback hoặc event bus được inject không biến chúng thành logic domain. Application service sẽ thu thập các dữ kiện cần thiết và thực hiện các hiệu ứng thông qua port của chính nó; adapter sẽ triển khai các thao tác kỹ thuật đó.

Một thao tác domain có thể trả về hoặc ghi nhận một domain event thuần túy mô tả một sự kiện nghiệp vụ. Việc ghi nhận giá trị đó trong bộ nhớ hoàn toàn khác với việc phát hành (publish) nó ra bên ngoài. Việc điều phối ứng dụng chịu trách nhiệm xử lý kết quả và sắp xếp việc gửi sau khi trạng thái tương ứng đã được commit. Mã domain không cần biết về dispatcher, cơ chế thử lại (retry) hay bảng outbox. Hãy sử dụng kết quả trực tiếp khi một event không mang lại giá trị gia tăng nào.

## Vị trí đặt mã nguồn và các phụ thuộc

Đặt mã domain thuần túy dưới thư mục `api/domain/<business_area>/`, được nhóm theo khả năng nghiệp vụ. Giữ các use case ứng dụng và các port của chúng dưới `api/services/`, các adapter persistence dưới `api/repositories/`, và việc kết nối (wiring) trong `api/extensions/ext_application_services.py` cùng các module `application_services/` của nó. Vị trí adapter runtime hiện có có thể giữ nguyên vị trí cũ. Gói domain mới tạo ra một ranh giới rõ ràng mà không yêu cầu đổi tên cây thư mục application-service.

Ví dụ: slice bình luận workflow (workflow comment) sử dụng bố cục sau:

```text
api/
  domain/
    workflow_comments/
      workflow_comment_agg.py  # WorkflowCommentAgg, child entity, value objects, và domain event của nó
      errors.py                # Các lỗi nghiệp vụ mà application service sẽ biên dịch lại
  services/
    app/
      workflow_comment_service.py          # Use cases, records, và ports
      workflow_comment_errors.py           # Application errors mà tầng transport sẽ ánh xạ
      workflow_comment_mention_gateway.py  # Adapter gửi thông báo
  repositories/
    app/
      workflow_comment_repository.py       # Ánh xạ SQLAlchemy và transactions
  extensions/
    ext_application_services.py            # Composition root
```

Hãy giữ aggregate và các kiểu con nhỏ của nó cùng nhau cho đến khi việc tách ra module riêng trở nên hữu ích. Tên lớp root kết thúc bằng `Agg`, và tệp module Python kết thúc bằng `_agg.py`; các child entity sử dụng tên nghiệp vụ thông thường. Đặt tên domain service theo chính sách hoặc thao tác của chúng. Không tạo các thư mục chung chung như `aggregates/`, `entities/` và `services/` làm phân mảnh một mô hình nghiệp vụ trên cây thư mục. `api/models/` vẫn là nơi ánh xạ persistence, `api/core/` vẫn là kernel thực thi chỉ-để-di-chuyển (migration-only), và `api/libs/` không phụ thuộc nghiệp vụ không phải là nơi đặt các quy tắc sản phẩm.

Các câu lệnh import hướng từ application service sang mã domain. Repository có thể import các kiểu domain để tái tạo và lưu trữ aggregate, cũng như các port ứng dụng mà chúng triển khai. Mã domain tuyệt đối không import `services`, `repositories`, `models`, `controllers`, `extensions`, `configs`, `tasks`, hay gói `core` cũ. Nó sử dụng các kiểu domain của riêng mình, các giá trị thư viện chuẩn và các helper thuần túy có sự phụ thuộc bảo toàn ranh giới này. Transport tiếp tục gọi các use case ứng dụng và nhận các bản ghi (records). Hãy giữ kín các chi tiết nội bộ domain của từng vùng nghiệp vụ; một slice khác muốn truy cập vào nó phải thông qua các hợp đồng và port ứng dụng.

Trong slice đó, [`WorkflowCommentAgg`](../../api/domain/workflow_comments/workflow_comment_agg.py) sở hữu các quy tắc nội dung bình luận, chỉ người tạo mới được sửa, và việc giải quyết một chiều (one-way resolution), còn mention value object của nó chỉ giữ lại các thành viên workspace được cung cấp. [`WorkflowCommentService`](../../api/services/app/workflow_comment_service.py) lấy các dữ kiện thành viên đó, áp dụng một hành vi bên trong một thay đổi repository, chuyển đổi lỗi của domain thành lỗi của slice, và gửi thông báo cho các sự kiện mention của aggregate sau khi commit. Repository thực thi phạm vi owner và kiểm soát đồng thời bằng cách khóa dòng bình luận cho thay đổi đó, và adapter Celery hiện có sẽ thực hiện gửi thông báo. Tầng lưu trữ và bộ gửi thông báo hoàn toàn nằm ngoài aggregate.

## Adapters

- **Repositories** triển khai các port persistence và query. Mỗi thao tác sở hữu database session của riêng mình: một thao tác đọc ngắn hoặc một giao dịch ghi có ranh giới rõ ràng. Mỗi câu lệnh đều lọc theo toàn bộ chuỗi owner. Các dòng dữ liệu trở thành bản ghi (records), hoặc aggregate trong các slice đã áp dụng, trước khi session đóng lại, do đó session, persistence model và lazy relationship không bao giờ vượt qua port. Một repository phụ thuộc vào các hợp đồng ứng dụng mà nó triển khai và các kiểu domain mà nó ánh xạ, không bao giờ phụ thuộc vào tầng điều phối ứng dụng.
- **Quy tắc trong repositories**: một repository chỉ thực thi một quy tắc nghiệp vụ khi quy tắc đó phải được đảm bảo tính nguyên tử cùng với thao tác ghi. Khi các writer đồng thời có thể thay đổi trạng thái mà quy tắc đọc, nó sử dụng một cơ chế từ phần [tính nhất quán (consistency)](#tính-nhất-quán-consistency). Đối với một quy tắc domain đã được trích xuất, hãy tái sử dụng hành vi domain khi đánh giá nó bên trong một transaction; không tạo ra một bản triển khai chính sách thứ hai trong adapter. Database constraint và conditional write vẫn là các cơ chế thực thi cần thiết. Port phải tài liệu hóa mọi quy tắc mà các adapter của nó thực thi.
- **Runtime adapters** triển khai các port còn lại đối với cache, hàng đợi tác vụ, dịch vụ enterprise hoặc bên ngoài, kernel thực thi hoặc mã cũ. Chúng dịch các lỗi của bên thứ ba thành lỗi ứng dụng.
- **Tái sử dụng**: một repository có thể triển khai nhiều port do consumer sở hữu. Hãy mở rộng nó thay vì thêm một đường dẫn truy vấn song song; xem [hướng dẫn repositories](BACKEND_REPOSITORIES.md).

## Tính nhất quán (Consistency)

Mỗi thao tác repository chạy trong session riêng của nó và không có transaction nào kéo dài toàn bộ một use case, vì vậy một quy tắc mà một service kiểm tra trước khi ghi sẽ không đảm bảo tính nguyên tử với thao tác ghi đó. Việc chuyển bước kiểm tra vào bên trong transaction ghi tự nó không giải quyết được vấn đề: ở mức cô lập mặc định (default isolation level), hai transaction đồng thời đều có thể nhìn thấy cùng một trạng thái và cùng ghi dữ liệu.

Đối với mỗi quy tắc mà các writer đồng thời có thể phá vỡ, hãy chỉ rõ cơ chế thực thi nó và tài liệu hóa cơ chế đó trên port:

- **Một database constraint**, chẳng hạn như ràng buộc unique hoặc check, được dịch thành lỗi của slice khi bị vi phạm.
- **Một conditional write (ghi có điều kiện)**, chẳng hạn như bản cập nhật được bảo vệ bởi trạng thái hiện tại mong đợi hoặc bởi version, coi số lượng dòng bị ảnh hưởng bằng 0 là một xung đột (conflict).
- **Một lock hoặc mức độ cô lập chặt chẽ hơn** được giữ xuyên suốt quá trình kiểm tra và ghi, có cơ chế thử lại hoặc báo lỗi rõ ràng khi xung đột.

Một bước kiểm tra chỉ đọc các giá trị không bao giờ thay đổi sau khi tạo (chẳng hạn như ai đã tạo bản ghi) không cần cơ chế điều phối thêm bên trong transaction ghi, ngoại trừ việc xử lý trường hợp bản ghi bị xóa đồng thời.

## Composition root

Đăng ký mọi application service trong composition root và nhóm các service liên quan theo vùng nghiệp vụ. Khởi tạo các adapter cụ thể tại đó, đọc cấu hình tại đó và truyền các giá trị thuần túy vào. Application service không bao giờ tự xây dựng các phụ thuộc hạ tầng của mình, và không thành phần nào bên ngoài root được phép tạo repository hoặc khởi tạo instance application-service ở cấp độ module. Các hàm domain thuần túy và domain object không cần đăng ký service.

## Tầng Transport

Một handler xử lý:

1. Khai báo quyền tiếp nhận (admission), bao gồm kiểm tra vai trò và quyền hạn, trả về danh tính caller không phụ thuộc framework.
2. Xác thực request và ánh xạ nó vào bản ghi input của use case. Nó giải quyết các quy ước giao thức tại đây, ví dụ như secret bị ẩn (masked secret) mà client gửi ngược lại.
3. Gọi chính xác một use case nhận được từ composition root.
4. Dịch các lỗi ứng dụng thành các lỗi giao thức đã thiết lập và giữ nguyên trạng thái, mã lỗi cùng thông báo hiện có.
5. Tuần tự hóa các bản ghi trả về bằng các schema response chung, tuân theo [hướng dẫn API schema](../../api/controllers/API_SCHEMA_GUIDE.md).

## Quy tắc nghiệp vụ (Business rules)

- Truyền định danh owner một cách tường minh vào mọi lệnh gọi port. Bên dưới tầng transport, tuyệt đối không đọc tenant hoặc account từ các biến toàn cục của framework.
- Giữ I/O ngoại vi bên ngoài các transaction đang mở. Hãy hiện thực hóa (materialize) dữ liệu cần thiết cho I/O và đóng session trước.
- Kích hoạt các hiệu ứng phụ (side effects) sau khi thao tác ghi đã commit. Port ghi trả về những gì hiệu ứng phụ cần, và application service sẽ kích hoạt nó thông qua port của chính service đó. Một domain event hoặc thay đổi trạng thái trong bộ nhớ đơn thuần không phải là bằng chứng của việc commit thành công.
- Giữ persistence model không chứa logic truy cập session, truy vấn, bộ nhớ đệm và hành vi ứng dụng. Repository sẽ ánh xạ các trạng thái do ứng dụng hoặc domain sở hữu thành các cột nguyên thủy.
- Chỉ ném lỗi giao thức và dựng phản hồi tại tầng transport.
- Tương tác với slice khác thông qua các hợp đồng và port của slice đó, không bao giờ thông qua repository hoặc thành phần nội bộ của nó.

Việc gửi đi sau commit (post-commit dispatch) đơn thuần không đảm bảo việc phân phát thành công: tiến trình có thể gặp sự cố giữa lúc commit và lúc gửi thông báo. Khi một use case yêu cầu phân phát bền vững (durable delivery), hãy lưu ý định phân phát cùng với thay đổi trạng thái trong cùng một transaction của repository và gửi nó sau đó với cơ chế thử lại và tính lũy thừa (idempotency), ví dụ thông qua mẫu transactional outbox. Đây là mối quan tâm của tầng ứng dụng và hạ tầng; nó không thêm bất kỳ phụ thuộc database hay thông báo nào vào domain. Các cơ chế thông báo đặc thù của database cũng thuộc về adapter và phải tôn trọng khả năng hiển thị của commit (commit visibility).

## Hợp đồng ranh giới (Boundary contracts)

Mỗi slice mới hoặc được di chuyển phải bổ sung hai hợp đồng ranh giới import trong cùng một lần thay đổi. Một hợp đồng giữ cho module ứng dụng không bị phụ thuộc vào framework, persistence, cấu hình, hàng đợi tác vụ và mã transport. Hợp đồng còn lại ngăn handler tiếp cận tầng persistence ngoại trừ thông qua composition root. Danh sách ngoại lệ kế thừa (legacy layering baseline) chỉ được phép thu hẹp: tuyệt đối không thêm ngoại lệ mới, và hãy xóa ngoại lệ cho mỗi phụ thuộc mà quá trình di chuyển đã loại bỏ.

Tệp `api/.importlinter` liệt kê `domain` trong số các gói gốc của nó, và hợp đồng `domain-boundary` của nó bao quát các aggregate, entity, value object và domain service. Nó cấm các phụ thuộc vào application, persistence, framework, cấu hình, hàng đợi, transport và kernel cũ, bao gồm cả các lệnh import gián tiếp qua helper. Hãy bảo toàn các hợp đồng application và transport của từng slice; quy tắc domain sẽ bổ sung cho chúng. Kiểm tra import không phát hiện được I/O ẩn sau các khả năng được inject, vì vậy hãy xem xét kỹ lưỡng cả chữ ký hàm và hành vi khi review.

## Di chuyển mã nguồn cũ (Migrating legacy code)

Các service cũ tự quản lý session, các handler trực tiếp truy vấn persistence model, và mã kernel gọi service đều là nợ kỹ thuật cần di chuyển (migration debt). Khi một thay đổi chạm đến chúng:

- Chuyển các use case bị tác động vào một slice, đồng thời xóa mã bị thay thế và các bài test của nó trong cùng một thay đổi. Không để lại các wrapper chuyển tiếp (forwarding wrappers).
- Bảo toàn hợp đồng công khai: các route, thứ tự admission, HTTP status code, mã lỗi cùng thông báo, và các trường trong response. Hãy ghi chú rõ ràng về tính tương thích kế thừa có chủ đích ở nơi nó được duy trì.
- Thêm các hợp đồng ranh giới của slice và thu hẹp danh sách ngoại lệ kế thừa.

## Kiểm thử (Tests)

Tuân theo [hướng dẫn kiểm thử](../../api/README.md#testing) của tài liệu nhà phát triển backend.

## Thư viện trung lập nghiệp vụ (Business-agnostic libraries)

Các thư viện dùng chung không được sở hữu chính sách sản phẩm hoặc logic điều phối. Hãy chuyển các quyết định nghiệp vụ sang chủ sở hữu domain của chúng, hoặc sang slice ứng dụng sở hữu cho đến khi nó có một domain model, và chỉ giữ lại các tiện ích hỗ trợ độc lập nghiệp vụ trong thư viện.

## Tiêu chí đánh giá mã nguồn (Review checks)

Đánh dấu mỗi phát hiện cùng với quy tắc mà nó vi phạm:

- Một handler can thiệp vào persistence, truy vấn dữ liệu, gọi mã cũ mà một slice đã thay thế, hoặc quyết định chính sách nghiệp vụ.
- Một application module phụ thuộc vào framework, persistence, cấu hình hoặc hàng đợi tác vụ, hoặc ném ra các lỗi giao thức.
- Một port để lộ session hoặc persistence model, một aggregate tiếp cận tầng transport, hoặc một thao tác adapter thiếu bộ lọc theo chuỗi owner.
- Một quy tắc mà các writer đồng thời có thể phá vỡ mà không có cơ chế cụ thể: database constraint, conditional write, hoặc lock/mức cô lập được giữ xuyên suốt quá trình kiểm tra và ghi.
- Một quy tắc nghiệp vụ được thực thi trong repository mà port của nó không ghi nhận trong tài liệu.
- Các phụ thuộc được lựa chọn bên ngoài composition root.
- Một slice mới hoặc được di chuyển thiếu các hợp đồng ranh giới, có hợp đồng bị suy yếu hoặc thêm ngoại lệ baseline mới.
- Các persistence model có thêm hành vi. Chúng không bao giờ được trở thành domain model.
- Một aggregate root có tên không kết thúc bằng `Agg`, một child entity được đặt tên như thể nó là một aggregate, hoặc một thành phần điều phối được trình bày như một domain service hoặc aggregate.
- Mã domain nằm ngoài gói vùng nghiệp vụ của nó, hoặc một domain object/service phụ thuộc vào application service, port I/O, session, persistence model, cấu hình hoặc hạ tầng. Bao gồm cả các phụ thuộc thông báo và phát hành sự kiện ẩn sau interface.
- Mã mới nằm trong kernel thực thi cũ, hoặc chính sách sản phẩm nằm trong thư viện dùng chung.
- Các bài kiểm thử vi phạm [hướng dẫn kiểm thử backend](../../api/README.md#testing).
