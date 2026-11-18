# Danh mục quy tắc — Các mẫu SQLAlchemy (SQLAlchemy Patterns)

## Phạm vi (Scope)
- Bao gồm: vòng đời session và transaction trong SQLAlchemy, cấu trúc truy vấn, giới hạn phạm vi tenant (tenant scoping), ranh giới raw SQL, và các biện pháp bảo vệ đồng thời (concurrency safeguards) trên đường dẫn ghi.
- KHÔNG bao gồm: chi tiết thiết kế table/model schema và migration (được xử lý bởi [hướng dẫn database schema](BACKEND_DATABASE_SCHEMA.md)).

## Các quy tắc (Rules)

### Sử dụng context manager Session với hành vi kiểm soát transaction tường minh
- Danh mục: thực hành tốt nhất (best practices)
- Mô tả: Vòng đời của Session và transaction phải tường minh và có giới hạn rõ ràng trên các đường dẫn ghi (write paths). Việc thiếu commit có thể âm thầm bỏ qua các bản cập nhật dự kiến, trong khi các transaction tùy tiện hoặc kéo dài làm tăng mức độ tranh chấp, thời gian giữ lock và nguy cơ deadlock.
- Đề xuất khắc phục:
  - Sử dụng **`session.commit()` tường minh** sau khi hoàn thành một đơn vị ghi liên quan.
  - Hoặc sử dụng **context manager `session.begin()`** để tự động commit/rollback trên một khối lệnh có phạm vi.
  - Giữ thời gian transaction ngắn: tránh I/O mạng, tính toán nặng hoặc các tác vụ không liên quan bên trong transaction.
- Ví dụ:
  - Không tốt:
    ```python
    # Thiếu commit: thay đổi có thể không bao giờ được lưu.
    with Session(db.engine, expire_on_commit=False) as session:
        run = session.get(WorkflowRun, run_id)
        run.status = "cancelled"

    # Transaction kéo dài: thực hiện I/O bên ngoài bên trong một DB transaction.
    with Session(db.engine, expire_on_commit=False) as session, session.begin():
        run = session.get(WorkflowRun, run_id)
        run.status = "cancelled"
        call_external_api()
    ```
  - Tốt:
    ```python
    # Lựa chọn 1: commit tường minh.
    with Session(db.engine, expire_on_commit=False) as session:
        run = session.get(WorkflowRun, run_id)
        run.status = "cancelled"
        session.commit()

    # Lựa chọn 2: transaction có phạm vi với tự động commit/rollback.
    with Session(db.engine, expire_on_commit=False) as session, session.begin():
        run = session.get(WorkflowRun, run_id)
        run.status = "cancelled"

    # Đưa các công việc không liên quan đến DB ra ngoài phạm vi transaction.
    call_external_api()
    ```

### Bắt buộc giới hạn phạm vi theo `tenant_id` trên các truy vấn tài nguyên dùng chung
- Danh mục: bảo mật
- Mô tả: Các thao tác đọc và ghi đối với các bảng dùng chung phải được giới hạn theo `tenant_id` để ngăn chặn rò rỉ dữ liệu hoặc làm sai lệch dữ liệu giữa các tenant khác nhau.
- Đề xuất khắc phục: Thêm điều kiện `tenant_id` vào tất cả các truy vấn entity do tenant sở hữu và truyền ngữ cảnh tenant qua các interface của service/repository.
- Ví dụ:
  - Không tốt:
    ```python
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    workflow = session.execute(stmt).scalar_one_or_none()
    ```
  - Tốt:
    ```python
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.tenant_id == tenant_id,
    )
    workflow = session.execute(stmt).scalar_one_or_none()
    ```

### Ưu tiên sử dụng biểu thức SQLAlchemy thay vì raw SQL theo mặc định
- Danh mục: khả năng bảo trì
- Mô tả: Việc dùng raw SQL chỉ nên là trường hợp ngoại lệ. Các biểu thức ORM/Core dễ phát triển hơn, an toàn hơn khi kết hợp và nhất quán hơn với toàn bộ codebase.
- Đề xuất khắc phục: Viết lại các câu lệnh raw SQL đơn giản thành biểu thức `select/update/delete` của SQLAlchemy; chỉ giữ raw SQL khi các ràng buộc kỹ thuật rõ ràng đòi hỏi.
- Ví dụ:
  - Không tốt:
    ```python
    row = session.execute(
        text("SELECT * FROM workflows WHERE id = :id AND tenant_id = :tenant_id"),
        {"id": workflow_id, "tenant_id": tenant_id},
    ).first()
    ```
  - Tốt:
    ```python
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.tenant_id == tenant_id,
    )
    row = session.execute(stmt).scalar_one_or_none()
    ```

### Bảo vệ đường dẫn ghi bằng các cơ chế đồng thời an toàn (concurrency safeguards)
- Danh mục: chất lượng
- Mô tả: Các đường dẫn có nhiều writer đồng thời mà không có kiểm soát đồng thời rõ ràng có thể âm thầm ghi đè dữ liệu của nhau. Hãy chọn biện pháp bảo vệ dựa trên mức độ tranh chấp, phạm vi lock và chi phí thông lượng (throughput) thay vì chỉ mặc định dùng một chiến lược duy nhất.
- Đề xuất khắc phục:
  - **Khóa lạc quan (Optimistic locking)**: Sử dụng khi mức độ tranh chấp thường thấp và việc thử lại (retry) được chấp nhận. Thêm điều kiện bảo vệ theo version (hoặc updated_at) trong mệnh đề `WHERE` và coi `rowcount == 0` là một xung đột.
  - **Khóa phân tán Redis (Redis distributed lock)**: Sử dụng khi đoạn găng (critical section) kéo dài qua nhiều bước/tiến trình (hoặc bao gồm các hiệu ứng phụ ngoài database) và bạn cần loại trừ tương hỗ (mutual exclusion) giữa các worker.
  - **SELECT ... FOR UPDATE**: Sử dụng khi mức độ tranh chấp cao trên cùng các dòng dữ liệu và yêu cầu tuần tự hóa nghiêm ngặt bên trong transaction. Giữ transaction ngắn để giảm thời gian chờ lock và nguy cơ deadlock.
  - Trong mọi trường hợp, hãy giới hạn phạm vi theo `tenant_id` và xác minh số lượng dòng bị ảnh hưởng cho các lệnh ghi có điều kiện.
- Ví dụ:
  - Không tốt:
    ```python
    # Không có tenant scope, không phát hiện xung đột, và không có lock trên đường dẫn ghi bị tranh chấp.
    session.execute(update(WorkflowRun).where(WorkflowRun.id == run_id).values(status="cancelled"))
    session.commit()  # âm thầm ghi đè các cập nhật đồng thời
    ```
  - Tốt:
    ```python
    # 1) Khóa lạc quan (tranh chấp thấp, thử lại khi xung đột)
    result = session.execute(
        update(WorkflowRun)
        .where(
            WorkflowRun.id == run_id,
            WorkflowRun.tenant_id == tenant_id,
            WorkflowRun.version == expected_version,
        )
        .values(status="cancelled", version=WorkflowRun.version + 1)
    )
    if result.rowcount == 0:
        raise WorkflowStateConflictError("stale version, retry")

    # 2) Khóa phân tán Redis (đoạn găng xuyên suốt nhiều worker)
    lock_name = f"workflow_run_lock:{tenant_id}:{run_id}"
    with redis_client.lock(lock_name, timeout=20):
        session.execute(
            update(WorkflowRun)
            .where(WorkflowRun.id == run_id, WorkflowRun.tenant_id == tenant_id)
            .values(status="cancelled")
        )
        session.commit()

    # 3) Khóa bi quan với SELECT ... FOR UPDATE (tranh chấp cao)
    run = session.execute(
        select(WorkflowRun).where(WorkflowRun.id == run_id, WorkflowRun.tenant_id == tenant_id).with_for_update()
    ).scalar_one()
    run.status = "cancelled"
    session.commit()
    ```
