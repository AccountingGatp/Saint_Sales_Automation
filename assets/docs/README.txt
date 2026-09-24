SAINT SALES AUTOMATION

How to use
1. Open index.html (or the deployed Vercel URL).
2. Upload or drag-and-drop:
   - Net payments by order (required)
   - Total sales by order (required)
   - Payments by gateway summary (optional)
3. Click Process Files.
4. Review appears before Downloads.
   - Only missing values actually required by the current files are requested.
   - Enter the missing GL once and click Save.
   - The app saves that mapping in the browser, automatically reprocesses, and reuses it in future files.
5. Download the required output.

Current accounting behavior
- DRS Total GST Payable includes GST on Sales + GST on Shipping + GST on Refund.
- Manual Journal logic is unchanged; GST on Refund remains separate.
- Manual Journal / Xero date format is DD/MM/YYYY.
- New countries must use their own Revenue/Refund GLs when required.
- There is no automatic Product Revenue - Other or Taiwan/other-country fallback for missing country GLs.
- If a country GL is missing, the exact missing field appears in Review.
- Downloads stay available during Review; unresolved Xero lines remain visible with blank Account Code/Tax Rate and a REVIEW description.

Saved GL mappings
- Review mappings are stored in browser localStorage.
- They normally remain after closing the browser or shutting down/restarting the PC, as long as the same browser and site URL are used.
- Advanced Settings includes Export JSON / Import JSON for backup or moving mappings to another browser/device.

Project structure
index.html
assets/css/styles.css
assets/js/app.js
assets/js/sales-engine.js
assets/config/saint-sales-config.js
assets/config/saint-sales-mapping.json
assets/docs/Sales_Updation.pdf
assets/docs/Sales_Updation.docx
