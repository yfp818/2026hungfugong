# Commerce Module

## 功能範圍

- 商品、購物車、服務訂單與結帳。

## 實際路由與主要檔案

- `/cart`：`app/cart/page.tsx`
- 購物車與名冊：`context/CartContext.tsx`
- 商品管理：`app/admin/settings/page.tsx`
- 訂單管理：`app/admin/orders/page.tsx`

## 實際資料來源

- `blessing_products`
- `service_orders`
- `member_profiles`
- `wallet_transactions`
- `user_contacts`
- `site_content`

## 重要流程

- 預約、點燈與代燒將項目加入 CartContext。
- `/cart` 寫入 `service_orders`，並依餘額選項更新錢包與交易紀錄。
- 結帳後同步會員與聯絡簿資料；後台讀取訂單與會員資料。
- 後台設定頁管理 `blessing_products`。

## 禁止事項

- 不得變更訂單、錢包或會員識別格式而未先核對 schema。
- 不得在沒有交易紀錄時直接調整餘額。
- 不得將結帳流程拆成不相容的第二套訂單來源。

## 效能注意事項

- 購物車只讀取結帳所需的頁尾與錢包資料。
- 訂單清單需保留既有排序與篩選，避免重複全表查詢。
