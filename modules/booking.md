# Booking Module

## 功能範圍

- 線上預約濟事問事。

## 實際路由與主要檔案

- `/booking`：`app/booking/page.tsx`
- 名冊與購物車：`context/CartContext.tsx`
- 結帳：`app/cart/page.tsx`

## 實際資料來源

- CartContext 的 `contacts`、`selfProfile` 與 `sharedInfo`。
- 結帳時寫入 `service_orders`。

## 重要流程

- 透過 NextAuth LINE 登入。
- 使用本人或常用名冊帶入資料。
- 建立 `booking` 購物車項目後導向點燈、代燒或 `/cart`。
- `/cart` 將項目轉為服務訂單。

## 禁止事項

- 不得直接取代 NextAuth LINE 登入。
- 不得繞過 CartContext 或 `/cart` 另建預約寫入流程。
- 不得把可編輯姓名或電話當作登入身分。

## 效能注意事項

- 僅使用共用名冊資料，不得在表單輸入期間重複查詢。
- 維持現有一次加入購物車的提交流程。
