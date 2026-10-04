# CMS 2lab (Sveltia)

Trang quản trị: **https://2lab.vn/admin**

Mọi thay đổi trong CMS là một commit lên nhánh `main` của repo. Không có nút "Hủy" sau khi Lưu, nhưng mọi phiên bản cũ đều còn trong lịch sử Git.

## Dành cho người duyệt

### Đăng nhập

Bấm **Sign In with GitHub**. Tài khoản GitHub của bạn phải được mời vào repo với quyền ghi.

Lần đầu tải ảnh lên, CMS sẽ hỏi **R2 Secret Access Key**. Hỏi quản trị viên lấy key và nhập một lần. Key được lưu trên trình duyệt của bạn, không gửi đi đâu khác.

### Tạo chủ đề cho AI viết

1. Vào **Chủ đề → New**.
2. Điền **Chủ đề**, **Từ khóa tiếng Việt**, **Từ khóa tiếng Anh**, và **Ghi chú cho AI** nếu có.
3. Để trạng thái **Ý tưởng** nếu chưa muốn viết, hoặc chọn **Chờ viết** để AI bắt đầu. Sau đó bấm **Save**.

### Duyệt bài

1. Vào **Bài viết**, dùng bộ lọc **Bản nháp**.
2. Mở bài, sửa bản tiếng Việt và tiếng Anh. Nút chuyển ngôn ngữ nằm ở đầu khung soạn thảo.
3. Đọc mục **Cảnh báo của AI**. Kiểm tra từng ý, xử lý xong thì xóa.
4. Đọc mục **Mạng xã hội** và sửa nếu cần.
5. Nếu bài chưa ổn: mở chủ đề tương ứng, chọn **Cần viết lại**, ghi **Góp ý khi viết lại**, rồi bấm Save.
6. Nếu bài ổn: bỏ tick **Bản nháp**, bấm **Save**. Website sẽ cập nhật sau vài phút.

### Lưu ý

- **Slug** (tên file, phần cuối URL) không đổi được sau khi tạo bài.
- Muốn dịch tự động: bấm biểu tượng dịch trong khung soạn thảo và chọn **Google Gemini**. Không cần nhập API key.
- Không ghi thông tin cá nhân của khách hàng vào bài hay vào ghi chú cho AI.

## Dành cho quản trị viên: cài đặt lần đầu

### 1. Đăng nhập GitHub (OAuth)

1. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) lên Cloudflare Workers bằng nút **Deploy** trong README.
2. Tạo GitHub OAuth App tại GitHub → Settings → Developer settings → OAuth Apps:
    - Homepage URL: `https://2lab.vn`
    - Authorization callback URL: `https://<worker>.workers.dev/callback`
3. Trong Worker, thêm các biến:
    - `GITHUB_CLIENT_ID`
    - `GITHUB_CLIENT_SECRET`
    - `ALLOWED_DOMAINS` = `2lab.vn, localhost`
4. Trong `public/admin/config.yml`, bỏ comment dòng `base_url` và điền URL của Worker.

Khi chưa có Worker, vẫn đăng nhập được bằng **Sign In Using Access Token**. Tạo một fine-grained token chỉ cho repo này, với quyền Contents và Pull requests (read/write).

### 2. Ảnh trên Cloudflare R2

1. Trong Cloudflare → R2 → Manage API tokens, tạo token riêng cho CMS:
    - Quyền: **Object Read & Write**
    - Phạm vi: **chỉ bucket ảnh của site**
2. Thêm CORS cho bucket (R2 → bucket → Settings → CORS policy):
    ```json
    [
        {
            "AllowedOrigins": ["https://2lab.vn", "http://localhost:3000"],
            "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
    ```
3. Trong `public/admin/config.yml`, bỏ comment khối `media_libraries`, rồi điền `bucket`, `account_id` và `access_key_id`. Access Key ID không phải bí mật. Secret key chỉ đưa riêng cho từng người duyệt.

### 3. Gemini (dịch và chọn model AI)

Key Gemini chỉ nằm trên server. Trang `/admin` gửi mọi lệnh gọi Gemini qua `app/api/cms/gemini`, kèm token GitHub của người đang đăng nhập. Route chỉ cho qua người có quyền push vào repo nội dung.

1. Tạo một Google Cloud project riêng cho CMS, rồi tạo key tại [Google AI Studio](https://aistudio.google.com/api-keys).
2. Trong Google Cloud → APIs & Services → Credentials, mở key, ở **API restrictions** chỉ chọn _Generative Language API_.
3. Đặt quota hoặc budget alert cho project đó.
4. Trong Vercel → Settings → Environment Variables, thêm `GEMINI_API_KEY` (không có tiền tố `NEXT_PUBLIC_`). Nếu repo nội dung đổi tên, thêm `CMS_GITHUB_REPO` = `owner/repo`.

Gỡ ai đó khỏi repo trên GitHub là họ mất quyền dùng Gemini trong CMS, không cần đổi key. Khi chạy `npm run dev`, route bỏ qua bước kiểm tra GitHub để dùng được với **Work with Local Repository**. Muốn thử thì thêm `GEMINI_API_KEY` vào `.env.local`.

### 4. Vercel

`vercel.json` bỏ qua build khi commit chỉ sửa `content/topics/`, `content/settings/`, `.github/`, `scripts/content/` hoặc `docs/`. Mọi thay đổi khác, kể cả bài viết, đều build như bình thường.

### Thử trên máy

1. Chạy `npm run dev`, mở `http://localhost:3000/admin`.
2. Chọn **Work with Local Repository**, rồi chọn thư mục repo. Cách này cần Chrome hoặc Edge.
3. CMS ghi thẳng vào file trên máy, không commit. Kiểm tra kết quả bằng `git diff`.

### Nâng cấp Sveltia

Phiên bản được khóa trong `public/admin/index.html`. Đọc [release notes](https://github.com/sveltia/sveltia-cms/releases) trước khi đổi số phiên bản.
