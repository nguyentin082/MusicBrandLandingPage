# CMS 2lab (Sveltia)

Trang quản trị:

- **https://2lab.vn/admin**: nội dung thật, commit vào nhánh `main`.
- **https://staging.2lab.vn/admin**: thử nghiệm (CMS, AI viết bài), commit vào nhánh `staging`. Không hiện trên Google.

Mọi thay đổi trong CMS là một commit lên nhánh của trang đó. Không có nút "Hủy" sau khi Lưu, nhưng mọi phiên bản cũ đều còn trong lịch sử Git.

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
    - `ALLOWED_DOMAINS` = `2lab.vn, staging.2lab.vn, localhost`
4. Trong `cms/config.yml`, bỏ comment dòng `base_url` và điền URL của Worker.

Khi chưa có Worker, vẫn đăng nhập được bằng **Sign In Using Access Token**. Tạo một fine-grained token chỉ cho repo này, với quyền Contents và Pull requests (read/write).

### 2. Ảnh trên Cloudflare R2

1. Trong Cloudflare → R2 → Manage API tokens, tạo token riêng cho CMS:
    - Quyền: **Object Read & Write**
    - Phạm vi: **chỉ bucket ảnh của site**
2. Thêm CORS cho bucket (R2 → bucket → Settings → CORS policy):
    ```json
    [
        {
            "AllowedOrigins": [
                "https://2lab.vn",
                "https://www.2lab.vn",
                "https://staging.2lab.vn",
                "http://localhost:3000"
            ],
            "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
    ```
3. Trong `cms/config.yml`, bỏ comment khối `media_libraries`, rồi điền `bucket`, `account_id` và `access_key_id`. Access Key ID không phải bí mật. Secret key chỉ đưa riêng cho từng người duyệt.

Mọi ảnh đều lên R2. Thư viện lưu ảnh vào repo đã bị tắt (`media_libraries.default: false`), vì ảnh trong Git làm repo phình mãi (xóa file thì ảnh vẫn nằm trong lịch sử) và mỗi lần tải ảnh lại kích hoạt một lần build.

Dán hoặc kéo ảnh thẳng vào ô ảnh vẫn có thể khiến Sveltia lưu ảnh vào `public/uploads/`. Vì vậy trang `/admin` chặn thêm một lớp: commit nào có file trong `public/uploads/` sẽ không được gửi, CMS báo lỗi lưu và nhắc tải ảnh lên tab **Cloudflare R2**. Nội dung đang sửa vẫn còn nguyên trong khung soạn thảo.

### 3. Gemini (dịch và chọn model AI)

Key Gemini chỉ nằm trên server. Trang `/admin` gửi mọi lệnh gọi Gemini qua `app/api/cms/gemini`, kèm token GitHub của người đang đăng nhập. Route chỉ cho qua người có quyền push vào repo nội dung.

1. Tạo một Google Cloud project riêng cho CMS, rồi tạo key tại [Google AI Studio](https://aistudio.google.com/api-keys).
2. Trong Google Cloud → APIs & Services → Credentials, mở key, ở **API restrictions** chỉ chọn _Generative Language API_.
3. Đặt quota hoặc budget alert cho project đó.
4. Trong Vercel → Settings → Environment Variables, thêm `GEMINI_API_KEY` (không có tiền tố `NEXT_PUBLIC_`). Nếu repo nội dung đổi tên, thêm `CMS_GITHUB_REPO` = `owner/repo`.

Gỡ ai đó khỏi repo trên GitHub là họ mất quyền dùng Gemini trong CMS, không cần đổi key. Khi chạy `npm run dev`, route bỏ qua bước kiểm tra GitHub để dùng được với **Work with Local Repository**. Muốn thử thì thêm `GEMINI_API_KEY` vào `.env.local`.

### 4. Vercel

**Repo và nhánh mà CMS commit vào** không ghi cứng trong `cms/config.yml`. Route `app/api/cms/config` đọc file này và phục vụ ở `/admin/config.yml`, thay `backend.repo` và `backend.branch` bằng:

- `CMS_GITHUB_BRANCH` nếu có đặt;
- nếu không, nhánh mà Vercel đang deploy (`VERCEL_GIT_COMMIT_REF`): bản production sửa `main`, bản preview của một nhánh sửa chính nhánh đó;
- nếu không có cả hai thì dùng `main`.

`CMS_GITHUB_REPO` (dạng `owner/repo`) thay repo theo cách tương tự. Giá trị được lấy lúc build, nên đổi biến xong phải Redeploy. Khi dev trên máy, đặt `CMS_GITHUB_BRANCH` trong `.env.local`.

Thêm biến `PREVIEW_TOKEN` (một chuỗi ngẫu nhiên dài, tạo bằng `openssl rand -hex 24`). Người duyệt xem bài nháp tại `https://2lab.vn/<vi|en>/blog/preview/<slug>?token=<PREVIEW_TOKEN>`. Sai token thì trang trả 404. Lộ link thì đổi token trên Vercel rồi Redeploy.

`vercel.json` bỏ qua build khi commit chỉ sửa `content/topics/`, `content/settings/`, `.github/`, `scripts/content/` hoặc `docs/`. Mọi thay đổi khác, kể cả bài viết, đều build như bình thường.

### 5. Staging (staging.2lab.vn)

Nhánh `staging` là môi trường thử. Luồng làm việc: `feat/*` → `staging` → `main`.

1. Vercel → Settings → Domains → Add `staging.2lab.vn`, chọn **Git Branch** = `staging`.
2. DNS của `2lab.vn`: thêm `CNAME staging → cname.vercel-dns.com`. Trên Cloudflare, chọn **DNS only**.
3. Biến môi trường mục **Preview** trên Vercel dùng cho staging. Không đặt `CMS_GITHUB_BRANCH` cho Preview; CMS tự dùng nhánh `staging`.
4. Thêm `staging.2lab.vn` vào CORS của R2 và `ALLOWED_DOMAINS` của Worker (như ở trên).

Mọi bản deploy không phải production đều trả `robots.txt` chặn toàn bộ và header `X-Robots-Tag: noindex`, nên staging không bị Google index.

Bài và chủ đề tạo trên staging sẽ theo vào `main` khi merge. Xóa nội dung thử trước khi merge `staging → main`. Thỉnh thoảng merge `main → staging` để staging có đủ bài mới.

### 6. AI viết bài (GitHub Actions)

`.github/workflows/write-post.yml` chạy khi có commit sửa `content/topics/`. Action viết mọi chủ đề đang ở trạng thái **Chờ viết** hoặc **Cần viết lại**, ghi `content/blog/{vi,en}/<slug>.mdx` với `draft: true`, chuyển chủ đề sang **Chờ duyệt**, rồi commit lại vào đúng nhánh đó. Kết quả hoặc lỗi được ghi vào ô **Nhật ký AI** của chủ đề.

Cài đặt trong GitHub → repo → Settings → Secrets and variables → Actions:

- Secret `GEMINI_API_KEY`: bắt buộc. Nên dùng một key riêng, khác key của Vercel.
- Secret `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID`: không bắt buộc. Có thì Action gửi link duyệt bài qua Telegram.
- Variable `GEMINI_MODEL`: không bắt buộc, dùng thay model trong **Cài đặt AI**.
- Variable `SITE_URL`: không bắt buộc, mặc định là `https://2lab.vn`. Khi chạy trên nhánh `staging`, link gửi qua Telegram luôn là `https://staging.2lab.vn`.

Muốn chạy tay: vào tab Actions → **AI write post** → Run workflow, chọn nhánh, điền slug của chủ đề nếu chỉ muốn viết một chủ đề.

AI không bao giờ viết đè một bài đang xuất bản. Muốn AI viết lại bài đó, tick **Bản nháp** cho bài trước.

Khi Action bắt đầu viết, chủ đề chuyển ngay sang **AI đang viết**. Nếu Action lỗi hoặc bị hủy giữa chừng, chủ đề tự quay về **Ý tưởng** (hoặc **Chờ duyệt** nếu đã có bài), kèm lý do trong Nhật ký AI.

Hashtag Instagram do code tạo từ **Thẻ** của bài (bỏ dấu, viết liền, thêm `#2lab`), nên muốn đổi hashtag thì sửa Thẻ.

Nếu Google ngừng model đang chọn, Nhật ký AI sẽ báo "Model … không dùng được". Vào **Cài đặt AI → Model Gemini** chọn model khác.

### Chỉ viết đúng Thông tin studio

AI chỉ được viết rằng 2lab có, làm hoặc cam kết điều gì khi điều đó có trong **Cài đặt AI → Thông tin studio**. Quy định này nằm trong code, sửa Cài đặt AI không gỡ được.

- Trước khi viết, AI đối chiếu chủ đề với Thông tin studio. Chủ đề nhắc tới dịch vụ không có trong danh sách (ví dụ thiết kế artwork, phát hành) thì AI không viết rằng 2lab làm, và ghi một cảnh báo.
- Sau khi viết, AI rà lại toàn bộ bài và nội dung mạng xã hội, gỡ những câu nói về 2lab mà danh sách không có. Câu nào còn nghi ngờ được ghi vào **Cảnh báo của AI** với dấu ❗.
- 2lab có thêm dịch vụ mới: thêm vào Thông tin studio trước, rồi mới tạo chủ đề.

### Không công khai giá

Website, blog và mạng xã hội không nêu giá. Khách hàng phải liên hệ để được báo giá.

- **Cài đặt AI** không có ô bảng giá. Đừng thêm giá vào bất kỳ ô nào, vì repo và prompt không phải nơi giữ bí mật.
- Quy định không nêu giá nằm trong code của Action, nên sửa Cài đặt AI không gỡ được nó.
- Sau khi viết, Action quét giá trong mọi trường của bài, kể cả nội dung mạng xã hội. Nếu thấy giá, AI phải sửa lại một lần. Nếu vẫn còn, Action không ghi bài và báo lỗi trong Nhật ký AI.
- Khi duyệt bài do người viết, bạn vẫn phải tự kiểm tra phần này.

### In đậm bị hỏng khi lưu bài cũ

Trình soạn thảo của Sveltia không nhận chữ in đậm khi dấu `**` nằm sát dấu câu ASCII ở bên trong và một ký tự như `—`, `“` hay chữ cái ở bên ngoài, ví dụ `**"tai của thế giới"**—nó`. Lưu bài đó trong CMS sẽ biến chữ in đậm thành `\*\*` hiện nguyên trên trang.

- Bài do AI viết được sửa tự động trước khi ghi.
- Với bài viết tay hoặc bài cũ, chạy `npm run content:fix-emphasis`. Lệnh này đưa dấu câu ra ngoài phần in đậm (`"**tai của thế giới**"—nó`), trang vẫn hiển thị như cũ. Thêm `-- --check` để chỉ liệt kê, không sửa.

### Thử trên máy

1. Chạy `npm run dev`, mở `http://localhost:3000/admin`.
2. Chọn **Work with Local Repository**, rồi chọn thư mục repo. Cách này cần Chrome hoặc Edge.
3. CMS ghi thẳng vào file trên máy, không commit. Kiểm tra kết quả bằng `git diff`.

### Nâng cấp Sveltia

Phiên bản được khóa trong `public/admin/index.html`. Đọc [release notes](https://github.com/sveltia/sveltia-cms/releases) trước khi đổi số phiên bản.
