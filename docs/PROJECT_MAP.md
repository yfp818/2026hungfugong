# 皇府宮 (HuangFuGong) - 專案路由與架構地圖

## 核心技術棧
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database & Auth: Supabase (PostgreSQL)
- UI/Styling: Tailwind CSS, shadcn/ui, Lucide Icons
- Deployment: Google Cloud Run (asia-east1)

## 目錄結構與職責

```text
/
├─ app/                     # Next.js App Router 核心
│  ├─ (auth)/               # 登入/驗證相關群組 (預留)
│  ├─ admin/                # 後台管理系統 (需要 Admin 權限)
│  │  ├─ content/
│  │  ├─ members/
│  │  ├─ orders/
│  │  └─ settings/
│  ├─ api/                  # Route Handlers / Webhooks (例如: 金流回傳)
│  ├─ booking/              # 預約服務
│  ├─ burning/              # 燒金/代燒服務
│  ├─ campaign/             # 活動頁面
│  ├─ cart/                 # 購物車
│  ├─ lamps/                # 點燈服務
│  ├─ member/               # 信眾/會員中心 (優先使用 Server Component)
│  ├─ news/                 # 最新消息
│  └─ project/              # 專案介紹
│
├─ components/              # 系統共用元件
│  ├─ ui/                   # 無狀態 UI 元件 (由 shadcn/ui 生成，如 button, input)
│  └─ business/             # 帶有商業邏輯的聰明元件 (預留，如 MemberCard)
│
├─ context/                 # React Context (如 CartContext)
│
├─ lib/                     # 核心邏輯與第三方服務實例
│  ├─ supabase/             # Supabase 客戶端分層 (client.ts, server.ts, middleware.ts)
│  └─ utils.ts              # UI 與通用工具函式
│
└─ docs/                    # AI 開發指引與專案說明書
---

### 2. `docs/DATABASE.md` (資料庫與權限設計)

請將以下內容存為 `docs/DATABASE.md`。這能幫助 AI 寫出正確的 Supabase 查詢語法，並時刻注意安全性。

```markdown
# 資料庫綱要與 RLS 權限設計 (Supabase)

> ⚠️ **警告給 AI**：絕對不要在未經詢問的情況下修改 Schema。所有查詢必須遵循 RLS (Row Level Security) 政策。

## 核心資料表 (Tables)

### `users` (信眾/會員)
- **描述**: 儲存信眾基本資料，透過 Supabase Auth (含 LINE Provider) 建立。
- **欄位**: `id` (uuid, PK), `line_id` (text, unique), `name`, `phone`, `created_at`
- **RLS 權限**: 
  - Read/Update: 僅允許 `auth.uid() = id` 的信眾操作自己的資料。
  - Admin: 允許後台管理員完整讀寫。

### `orders` (訂單與金流)
- **描述**: 儲存購物車、結帳與付款狀態。
- **欄位**: `id` (uuid, PK), `user_id` (uuid, FK -> users.id), `total_amount`, `status`, `payment_method`, `created_at`
- **RLS 權限**: 
  - Read: 信眾僅能讀取自己的訂單 (`auth.uid() = user_id`)。
  - Insert: 允許已登入信眾建立。
  - Update: 僅限系統 (Server Actions / Webhooks) 或 Admin 更新狀態。

### `lamps` (點燈紀錄)
- **描述**: 紀錄信眾安太歲、光明燈等資訊。
- **欄位**: `id` (uuid, PK), `user_id` (uuid, FK -> users.id), `lamp_type`, `blessing_text`, `year`, `status`

### `bookings` (預約紀錄)
- **描述**: 紀錄信眾預約問事、祭改等服務。
- **欄位**: `id` (uuid, PK), `user_id` (uuid, FK), `service_type`, `booking_date`, `status`

### `campaigns` (活動企劃)
- **描述**: 廟方舉辦的法會或期間限定活動。
- **欄位**: `id` (uuid, PK), `title`, `description`, `start_date`, `end_date`, `is_active`