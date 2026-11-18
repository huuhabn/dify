# Danh mục quy tắc - Trừu tượng hóa Repositories (Repositories Abstraction)

## Phạm vi (Scope)
- Bao gồm: tiếp cận tầng persistence chỉ thông qua các port do consumer sở hữu, tái sử dụng các repository hiện có, và bảo toàn chiều phụ thuộc giữa các application service và adapter persistence.
- KHÔNG bao gồm: vòng đời session SQLAlchemy và các chi tiết về cấu trúc truy vấn (được xử lý bởi [hướng dẫn SQLAlchemy](BACKEND_SQLALCHEMY.md)), thiết kế table/schema/migration (được xử lý bởi [hướng dẫn database schema](BACKEND_DATABASE_SCHEMA.md)), và mẫu slice tổng thể (được xử lý bởi [hướng dẫn kiến trúc backend](BACKEND_ARCHITECTURE.md)).

## Các quy tắc (Rules)

### Chỉ tiếp cận persistence thông qua các port do consumer sở hữu
- Danh mục: khả năng bảo trì
- Mô tả: Các application service không bao giờ trực tiếp truy vấn bảng hoặc nắm giữ các persistence model. Mỗi service khai báo persistence mà nó cần dưới dạng một port trong chính module của nó, và một repository sẽ triển khai port đó. Khi một bảng đã có sẵn một repository, hãy mở rộng nó hoặc để nó triển khai port mới thay vì thêm một đường dẫn truy vấn song song.
- Ranh giới Domain: Các aggregate, entity, value object và domain service dưới thư mục `api/domain/<business_area>/` không bao giờ gọi các repository, kể cả thông qua các port trừu tượng. Các application service sẽ tải các dữ kiện cần thiết và lưu lại kết quả. Việc triển khai repository có thể import các kiểu domain để ánh xạ và gọi hành vi domain thuần túy khi cần đánh giá nguyên tử; chúng không được sao chép lại chính sách nghiệp vụ hoặc phụ thuộc vào việc điều phối của ứng dụng. Xem [kiến trúc backend](BACKEND_ARCHITECTURE.md#domain-model-và-tính-thuần-túy-purity).
- Đề xuất khắc phục:
  - Trước tiên, hãy kiểm tra `api/repositories`, `api/core/repositories` và `api/extensions/*/repositories/` để tìm repository hiện có. Nếu đã tồn tại, hãy thêm thao tác còn thiếu vào đó và phụ thuộc vào nó thông qua port của consumer.
  - Nếu chưa có, hãy khai báo port ngay cạnh service cần nó và triển khai nó trong một repository bên ngoài thư mục chỉ-để-di-chuyển `api/core/`. Repository sở hữu session của riêng mình, lọc theo toàn bộ chuỗi owner, và chỉ được kết nối (wire) trong composition root. Query port trả về các bản ghi thuần túy (plain records); aggregate repository port, trong các slice đã áp dụng aggregate, chấp nhận và trả về toàn bộ aggregate. Cả hai đều không trả về persistence model hoặc session.
- Ví dụ:
  - Không tốt: một service mở một session, truy vấn một bảng, thay đổi persistence model đã tải và commit.
  - Tốt: service gọi một thao tác trên một port mà nó khai báo, truyền vào các định danh owner. Repository đằng sau port đó thực hiện thao tác ghi có phạm vi trong một transaction có giới hạn và báo cáo mục tiêu bị thiếu bằng một application error.
  - Không tốt: các bộ lọc, phép join và phân trang cho một vùng nghiệp vụ bị lặp lại trên nhiều service khác nhau.
  - Tốt: các service dùng chung một port cho các thao tác đọc của vùng đó, và một repository duy nhất sẽ triển khai nó.
