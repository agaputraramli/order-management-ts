# order-management-ts

API backend untuk mengelola order pembelian menggunakan Express dan TypeScript.

---

## Fitur

- Endpoint **POST /api/orders** untuk membuat order.
- Delay pemrosesan 3 detik secara asynchronous (non-blocking).
- Generate nomor order unik dengan format:  
  `ORDER-{ID_CUSTOMER}-{TGLBULANTAHUN}-{RUNNING_NUMBER}`.
- Simpan data order ke file `.json` dalam folder `/database/customer-order/`.
- Retry penyimpanan file hingga maksimal 3 kali jika gagal.
- Cegah order bersamaan dari customer yang sama (concurrency lock).
- Data customer diambil dari file `mock/customers.json`.

---

## Contoh Request

```json
{
  "name": "Jhon Doe",
  "address": "Test Address",
  "payment_type": "Transfer",
  "items": [
    { "id_product": 1, "name": "Product a", "price": 5000, "qty": 2 }
  ]
}
