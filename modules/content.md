# Content Module

## 功能範圍

- 快閃活動、公告、獨立專案與首頁內容。

## 實際路由與主要檔案

- 首頁：`app/page.tsx`
- `/campaign/[id]`：`app/campaign/[id]/page.tsx`
- `/news/[id]`：`app/news/[id]/page.tsx`
- `/project/[id]`：`app/project/[id]/page.tsx`
- 活動表單：`components/FlashCampaignSection.tsx`
- 後台內容與設定：`app/admin/content/page.tsx`、`app/admin/settings/page.tsx`

## 實際資料來源

- `site_content`、`news_events`、`flash_campaigns`
- `campaign_bank_accounts`、`special_projects`、`special_project_orders`
- Supabase Storage `images`

## 重要流程

- 首頁讀取內容、公告、啟用活動、服務與啟用專案。
- Campaign 頁讀取指定 `flash_campaigns` 與指定帳戶資料。
- News 頁讀取單篇 `news_events`；Project 頁建立 `special_project_orders`。
- 後台可管理首頁、公告、活動、指定帳戶與獨立專案。

## 禁止事項

- 不得假設通知有獨立路由、資料表或元件；目前未找到對應實作。
- 不得未確認資料表與 Storage 寫入就修改內容管理流程。
- 不得改寫既有活動或專案訂單格式。

## 效能注意事項

- 詳情頁以 route id 查詢單一內容。
- 首頁維持現有啟用條件與排序，避免額外重複查詢。
