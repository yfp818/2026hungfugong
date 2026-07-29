# Temple Module

## 功能範圍

- 當月點燈與代燒服務。

## 實際路由與主要檔案

- `/lamps`：`app/lamps/page.tsx`
- `/burning`：`app/burning/page.tsx`
- 共用名冊與購物車：`context/CartContext.tsx`

## 實際資料來源

- `blessing_products`，以 `category` 的 `lamp` 或 `burning` 篩選。
- `user_contacts`、`member_profiles`、CartContext。

## 重要流程

- 使用 NextAuth LINE 登入後載入商品與常用名冊。
- 選擇品項、填寫祈福資料後加入購物車。
- 頁面會同步聯絡資料與會員主檔，再由 `/cart` 建立服務訂單。

## 禁止事項

- 不得更換 LINE 登入或自行改動商品分類值。
- 不得直接略過購物車而改寫訂單流程。
- 不得假設聯絡簿欄位或 constraints，須先核對 schema。

## 效能注意事項

- 商品僅查詢對應 category。
- 不得因輸入欄位變動重複載入商品或名冊。
