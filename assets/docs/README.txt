SAINT SALES AUTOMATION

How to use
1. Open index.html.
2. Upload or drag-and-drop:
   - Net payments by order (required)
   - Total sales by order (required)
   - Payments by gateway summary (optional)
3. Click Process Files.
4. Review appears before Downloads.
   - If a missing GL can be fixed in the app, enter only that GL and click Save.
   - Saving automatically reprocesses all outputs.
   - Other source/reconciliation issues remain visible for review.
5. Download the required output.

Important behavior
- Downloads are never disabled because of Review items.
- If an Xero mapping is still unresolved, the downloadable Xero CSV keeps that monetary line with a blank Account Code/Tax Rate and a "REVIEW -" description so the amount is not silently omitted.
- Resolve Review items before posting the Xero journal.
- Manual Journal / Xero date format is DD/MM/YYYY.
- Detailed reconciliation/journal previews and Advanced Settings are collapsed by default to keep the UI minimal.
- View SOP opens the original Sales Updation SOP PDF in a new tab.

Project structure
index.html
assets/css/styles.css
assets/js/app.js
assets/js/sales-engine.js
assets/config/saint-sales-config.js
assets/config/saint-sales-mapping.json
assets/docs/Sales_Updation.pdf
assets/docs/Sales_Updation.docx

Current Sales Xero CSV update:
- Product Revenue - Peru = GL 273
- Refunds - Peru = GL 274
- Product Revenue - Hong Kong = GL 267
- Product Revenue - Singapore = GL 268
- Explicit GST (820) and GST on Refund (820) rows are excluded from the Xero CSV only.
- DRS and Manual Journal calculations remain separate: DRS Total GST includes refund GST; Manual Journal GST logic remains unchanged.
- New countries never fall back to Other/Taiwan/another country. Missing country GLs are shown in Review.
