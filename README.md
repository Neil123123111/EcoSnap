# EcoSnap

Form báo cáo dạng web (tối ưu responsive cho mobile). Người dùng chỉ cần upload ảnh chụp bãi rác. Hệ thống CV tự động đánh giá mức độ nghiêm trọng và loại rác, hệ thống NLP tự động trích xuất địa chỉ từ mô tả giọng nói/văn bản. UI hiển thị bản đồ nhiệt (heatmap) các điểm đen môi trường công khai.

---

## Tổng quan thư mục

- `backend/` : FastAPI + Uvicorn
- `frontend/` : React + TypeScript + Vite

---

## Yêu cầu môi trường

- Node.js (>=16)
- npm / yarn
- Python (>=3.9, tốt nhất 3.10+)
- pip

---

## Backend - Cài đặt và chạy

1. Di chuyển vào thư mục backend:

```bash
cd backend
```

2. Tạo môi trường ảo và kích hoạt:

macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

Windows (PowerShell):

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

3. Cài dependencies:

```bash
pip install -r requirements.txt
```

4. Chạy server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Kiểm tra API:

- Truy cập: `http://localhost:8000/docs`

---

## Frontend - Cài đặt và chạy

1. Di chuyển vào thư mục frontend:

```bash
cd frontend
```

2. Cài dependencies:

```bash
npm install
# hoặc
# yarn
```

3. Chạy dev server:

```bash
npm run dev
# hoặc
# yarn dev
```

4. Mở trình duyệt:

- Thường là `http://localhost:5173`

> Frontend mặc định gọi API backend tại `http://localhost:8000` (xem `src/services/api.ts`). Nếu backend chạy chế độ khác, chỉnh URL ở đó.

---

## Kiểm thử nhanh

1. Start backend
2. Start frontend
3. Truy cập UI
4. Upload ảnh và kiểm tra các bước:
   - ‌Xử lý mô tả bằng NLP
   - ‌Dự đoán loại rác / mức độ nghiêm trọng
   - ‌Hiển thị heatmap

---

## Khắc phục sự cố thường gặp

- Lỗi CORS: đảm bảo backend đang chạy và middleware CORS đã enable (có trong `app/main.py`).
- Lỗi kết nối từ frontend: kiểm tra `baseURL` trong `frontend/src/services/api.ts`.
- Lỗi dependency backend: dùng `pip install -r requirements.txt` lại trong virtualenv.

---

## Ghi chú

- Repo hiện sử dụng API cơ bản: chỉ có route prefix `/reports` (xem `backend/app/routes/report.py`).
- Nếu dự định deploy, nên bổ sung cấu hình biến môi trường, https và bảo mật upload file.


