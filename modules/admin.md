# Admin Module

## 功能範圍

- 管理後台、管理員登入與後台資料管理。

## 實際路由與主要檔案

- `/admin`：`app/admin/page.tsx`、`app/admin/layout.tsx`
- `/admin/orders`：`app/admin/orders/page.tsx`
- `/admin/members`：`app/admin/members/page.tsx`
- `/admin/content`：`app/admin/content/page.tsx`
- `/admin/settings`：`app/admin/settings/page.tsx`
- 路由保護：`app/middleware.ts`
- 登入：`app/admin/LoginButton.tsx`、`lib/auth/options.ts`

## 實際資料來源

- `service_orders`、`special_project_orders`、`member_profiles`
- `wallet_transactions`、`site_content`、`news_events`
- `blessing_services`、`blessing_products`、`flash_campaigns`
- `campaign_bank_accounts`、`special_projects`、Supabase Storage `images`

## 重要流程

- `/admin` 以 NextAuth session 的 LINE User ID 比對 `ADMIN_LINE_USER_IDS`。
- middleware 也保護 `/admin/:path*`。
- 後台管理訂單、會員餘額、內容、服務、活動與專案。

## 禁止事項

- 不得公開或硬編碼管理員、密碼、secret 或環境變數。
- 不得改變既有登入、middleware 或管理員權限流程而未核對實際程式。
- 不得未確認影響就修改錢包、訂單或 Storage 寫入。

## 效能注意事項

- 後台清單維持既有查詢與 client-side 篩選；避免重複載入。
- 上傳圖片只在使用者選擇檔案後執行。
