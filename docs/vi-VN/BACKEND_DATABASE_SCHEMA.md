# Danh mục quy tắc — Thiết kế DB Schema

## Phạm vi (Scope)
- Bao gồm: kế thừa model/base, ranh giới schema trong model property, thiết kế schema hỗ trợ multi-tenant, kiểm tra độ dư thừa của index, tính tương thích giữa các dialect trong model, và tính tương thích đa cơ sở dữ liệu trong migrations.
- KHÔNG bao gồm: vòng đời session, ranh giới transaction và các mẫu thực thi truy vấn (được xử lý bởi [hướng dẫn SQLAlchemy](BACKEND_SQLALCHEMY.md)).

## Các quy tắc (Rules)

### Không truy vấn bảng khác bên trong `@property`
- Danh mục: [khả năng bảo trì, hiệu năng]
- Mô tả: Một `@property` của model không được mở session hoặc truy vấn các bảng khác. Điều này che giấu các mối phụ thuộc giữa các model, liên kết chặt chẽ các đối tượng schema với việc truy cập dữ liệu và có thể gây bùng nổ truy vấn N+1 khi lặp qua tập hợp dữ liệu.
- Đề xuất khắc phục:
  - Giữ các property của model thuần túy và chỉ cục bộ trên các trường đã được tải sẵn.
  - Chuyển việc lấy dữ liệu giữa các bảng sang các phương thức của service/repository.
  - Đối với các thao tác đọc danh sách/hàng loạt, hãy lấy dữ liệu liên quan cần thiết một cách tường minh (join/preload/bulk query) trước khi tính toán các giá trị phái sinh.
- Ví dụ:
  - Không tốt:
    ```python
    class Conversation(TypeBase):
        __tablename__ = "conversations"

        @property
        def app_name(self) -> str:
            with Session(db.engine, expire_on_commit=False) as session:
                app = session.execute(select(App).where(App.id == self.app_id)).scalar_one()
                return app.name
    ```
  - Tốt:
    ```python
    class Conversation(TypeBase):
        __tablename__ = "conversations"

        @property
        def display_title(self) -> str:
            return self.name or "Untitled"


    # Tầng service/repository thực hiện truy vấn hàng loạt rõ ràng cho các dòng App liên quan.
    ```

### Ưu tiên thêm `tenant_id` vào định nghĩa model
- Danh mục: khả năng bảo trì
- Mô tả: Trong các domain multi-tenant, hãy đưa `tenant_id` vào định nghĩa schema bất cứ khi nào entity thuộc về dữ liệu do tenant sở hữu. Điều này tăng cường an toàn phân lập dữ liệu và giúp các chiến lược phân vùng/sharding trong tương lai trở nên khả thi khi khối lượng dữ liệu tăng trưởng.
- Đề xuất khắc phục:
  - Thêm một cột `tenant_id` và đảm bảo các ràng buộc unique/index liên quan bao gồm chiều tenant khi thích hợp.
  - Truyền `tenant_id` qua các hợp đồng service/repository để giữ cho các đường dẫn truy cập luôn nhận biết được tenant.
  - Ngoại lệ: nếu một bảng được thiết kế rõ ràng dưới dạng metadata toàn cục không nằm trong phạm vi tenant, hãy ghi chép lại quyết định thiết kế đó một cách rõ ràng.
- Ví dụ:
  - Không tốt:
    ```python
    from sqlalchemy.orm import Mapped


    class Dataset(TypeBase):
        __tablename__ = "datasets"
        id: Mapped[str] = mapped_column(StringUUID, primary_key=True)
        name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    ```
  - Tốt:
    ```python
    from sqlalchemy.orm import Mapped


    class Dataset(TypeBase):
        __tablename__ = "datasets"
        id: Mapped[str] = mapped_column(StringUUID, primary_key=True)
        tenant_id: Mapped[str] = mapped_column(StringUUID, nullable=False, index=True)
        name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    ```

### Phát hiện và tránh các index trùng lặp/dư thừa
- Danh mục: hiệu năng
- Mô tả: Xem xét các định nghĩa index để tránh dư thừa theo quy tắc tiền tố bên trái nhất (leftmost-prefix). Ví dụ: index `(a, b, c)` có thể bao quát hầu hết các tra cứu cho `(a, b)`. Giữ cả hai có thể làm tăng chi phí ghi và khiến bộ tối ưu hóa (optimizer) chọn kế hoạch thực thi không tối ưu.
- Đề xuất khắc phục:
  - Trước khi thêm index, so sánh với các composite index hiện có theo quy tắc leftmost-prefix.
  - Loại bỏ hoặc tránh tạo các tiền tố dư thừa trừ khi có nhu cầu mẫu truy vấn đã được kiểm chứng.
  - Áp dụng cùng tiêu chuẩn đánh giá này trong cả `__table_args__` của model và DDL tạo index trong migration.
- Ví dụ:
  - Không tốt:
    ```python
    __table_args__ = (
        sa.Index("idx_msg_tenant_app", "tenant_id", "app_id"),
        sa.Index("idx_msg_tenant_app_created", "tenant_id", "app_id", "created_at"),
    )
    ```
  - Tốt:
    ```python
    __table_args__ = (
        # Giữ lại index rộng hơn trừ khi profiling chứng minh cần có index ngắn riêng.
        sa.Index("idx_msg_tenant_app_created", "tenant_id", "app_id", "created_at"),
    )
    ```

### Tránh sử dụng dialect chỉ dành riêng cho PostgreSQL trong model; bọc trong `models.types`
- Danh mục: khả năng bảo trì
- Mô tả: Định nghĩa model/schema nên tránh sử dụng trực tiếp các cấu trúc chỉ dành cho PostgreSQL trong các model nghiệp vụ. Khi cần hành vi đặc thù của cơ sở dữ liệu, hãy đóng gói hành vi đó trong `api/models/types.py` bằng cả triển khai dialect của PostgreSQL lẫn MySQL, sau đó sử dụng lớp trừu tượng đó từ mã model.
- Đề xuất khắc phục:
  - Không đặt trực tiếp các kiểu/toán tử chỉ dành cho dialect vào cột model khi có thể sử dụng lớp bọc tương thích di động (portable wrapper).
  - Thêm hoặc mở rộng các wrapper trong `models.types` (ví dụ: `AdjustedJSON`, `LongText`, `BinaryData`) để chuẩn hóa hành vi giữa PostgreSQL và MySQL.
- Ví dụ:
  - Không tốt:
    ```python
    from sqlalchemy.dialects.postgresql import JSONB
    from sqlalchemy.orm import Mapped


    class ToolConfig(TypeBase):
        __tablename__ = "tool_configs"
        config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    ```
  - Tốt:
    ```python
    from sqlalchemy.orm import Mapped

    from models.types import AdjustedJSON


    class ToolConfig(TypeBase):
        __tablename__ = "tool_configs"
        config: Mapped[dict] = mapped_column(AdjustedJSON(), nullable=False)
    ```

### Phòng tránh sự không tương thích trong migration bằng kiểm tra dialect và kiểu dữ liệu dùng chung
- Danh mục: khả năng bảo trì
- Mô tả: Các tập lệnh migration dưới thư mục `api/migrations/versions/` phải tính đến sự không tương thích giữa PostgreSQL/MySQL một cách rõ ràng. Đối với DDL hoặc giá trị mặc định nhạy cảm với dialect, hãy rẽ nhánh theo dialect đang hoạt động (ví dụ: `conn.dialect.name == "postgresql"`), và ưu tiên tái sử dụng các trừu tượng tương thích từ `models.types` khi có thể áp dụng.
- Đề xuất khắc phục:
  - Trong hàm upgrade/downgrade của migration, liên kết connection và rẽ nhánh theo dialect cho các đoạn SQL không tương thích.
  - Tái sử dụng các wrapper trong `models.types` khi định nghĩa cột để giữ cho hành vi luôn đồng bộ với các model lúc runtime.
  - Tránh logic migration chỉ áp dụng cho một dialect trừ khi có một ngoại lệ tương thích có chủ đích đã được ghi chép lại.
- Ví dụ:
  - Không tốt:
    ```python
    with op.batch_alter_table("dataset_keyword_tables") as batch_op:
        batch_op.add_column(
            sa.Column(
                "data_source_type",
                sa.String(255),
                server_default=sa.text("'database'::character varying"),
                nullable=False,
            )
        )
    ```
  - Tốt:
    ```python
    def _is_pg(conn) -> bool:
        return conn.dialect.name == "postgresql"


    conn = op.get_bind()
    default_expr = sa.text("'database'::character varying") if _is_pg(conn) else sa.text("'database'")

    with op.batch_alter_table("dataset_keyword_tables") as batch_op:
        batch_op.add_column(sa.Column("data_source_type", sa.String(255), server_default=default_expr, nullable=False))
    ```
