window.SAINT_SALES_BASE_CONFIG = {
  "settings": {
    "maxRounding": 0.05,
    "australiaGstRate": 0.1
  },
  "gateways": {
    "Shopify Payments": {
      "accountCode": 251,
      "journalDescription": "Shopify Clearing Account",
      "xeroDescription": "Shopify Clearing",
      "taxRate": "BAS Excluded",
      "reportOrder": 10,
      "journalOrder": 10,
      "aliases": [
        "shopify"
      ]
    },
    "PayPal": {
      "accountCode": 252,
      "journalDescription": "PayPal Clearing Account",
      "xeroDescription": "PayPal Clearing",
      "taxRate": "BAS Excluded",
      "reportOrder": 20,
      "journalOrder": 30,
      "aliases": [
        "paypal"
      ]
    },
    "Afterpay": {
      "accountCode": 253,
      "journalDescription": "Afterpay Clearing Account",
      "xeroDescription": "Afterpay Clearing",
      "taxRate": "BAS Excluded",
      "reportOrder": 30,
      "journalOrder": 20,
      "aliases": [
        "afterpay"
      ]
    },
    "Shop Cash": {
      "accountCode": 272,
      "journalDescription": "ShopCash Clearing Account",
      "xeroDescription": "Shop Cash Clearing",
      "taxRate": "BAS Excluded",
      "reportOrder": 40,
      "journalOrder": 40,
      "aliases": [
        "shop cash",
        "shop_cash"
      ]
    }
  },
  "australia": {
    "refund": {
      "accountCode": 204,
      "description": "Refunds - Australia",
      "taxRate": "GST on Income",
      "order": 10
    },
    "shipping": {
      "accountCode": 254,
      "description": "Shipping Income - AU",
      "taxRate": "GST on Income"
    },
    "revenue": {
      "accountCode": 257,
      "description": "Product Revenue - AU",
      "taxRate": "GST on Income"
    }
  },
  "gst": {
    "accountCode": 820,
    "description": "GST",
    "refundDescription": "GST on Refund",
    "taxRate": "BAS Excluded"
  },
  "exportShipping": {
    "accountCode": 250,
    "description": "Shipping Income - Other",
    "taxRate": "BAS Excluded"
  },
  "rounding": {
    "accountCode": 860,
    "description": "Rounding",
    "taxRate": "BAS Excluded"
  },
  "fallbackRevenue": {
    "accountCode": "",
    "descriptionPrefix": "Product Revenue",
    "taxRate": "BAS Excluded",
    "order": 900
  },
  "fallbackRefund": {
    "accountCode": "",
    "descriptionPrefix": "Refunds",
    "taxRate": "BAS Excluded",
    "order": 900,
    "needsReview": true
  },
  "fallbackOtherTax": {
    "accountCode": "",
    "descriptionPrefix": "Other Tax",
    "taxRate": "BAS Excluded",
    "order": 900,
    "needsReview": true
  },
  "countries": {
    "United States": {
      "revenueAccount": 258,
      "revenueDescription": "Product Revenue - US",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 10,
      "refundAccount": 208,
      "refundDescription": "Refunds - United States",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 20,
      "taxAccount": 221,
      "taxDescription": "Other Tax - US",
      "taxRate": "BAS Excluded",
      "taxOrder": 10
    },
    "New Zealand": {
      "revenueAccount": 259,
      "revenueDescription": "Product Revenue -NZ",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 20,
      "refundAccount": 207,
      "refundDescription": "Refunds - New Zealand",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 30
    },
    "United Kingdom": {
      "revenueAccount": 261,
      "revenueDescription": "Product Revenue - UK",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 30,
      "refundAccount": 211,
      "refundDescription": "Refunds - United Kingdom",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 40
    },
    "Canada": {
      "revenueAccount": 262,
      "revenueDescription": "Product Revenue - CA",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 40,
      "refundAccount": 219,
      "refundDescription": "Refunds - Canada",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 50
    },
    "Ireland": {
      "revenueAccount": 279,
      "revenueDescription": "Product Revenue – Ireland",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 50
    },
    "Germany": {
      "revenueAccount": 280,
      "revenueDescription": "Product Revenue - Germany",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 60,
      "refundAccount": 223,
      "refundDescription": "Refunds - Germany",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 60
    },
    "Belgium": {
      "revenueAccount": 283,
      "revenueDescription": "Product Revenuw -Belgium",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 70
    },
    "Italy": {
      "revenueAccount": 284,
      "revenueDescription": "Product Revenue – Italy",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 80,
      "refundAccount": 296,
      "refundDescription": "Refunds - Italy",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 70
    },
    "Spain": {
      "revenueAccount": 286,
      "revenueDescription": "Product Revenue – Spain",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 90,
      "refundAccount": 337,
      "refundDescription": "Refunds - Spain",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 80
    },
    "France": {
      "revenueAccount": 303,
      "revenueDescription": "Product Revenue - France",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 100,
      "refundAccount": 340,
      "refundDescription": "Refunds - France",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 100
    },
    "Netherlands": {
      "revenueAccount": 306,
      "revenueDescription": "Product Revenue – Netherlands",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 110,
      "refundAccount": 298,
      "refundDescription": "Refunds - Netherlands",
      "refundTaxRate": "BAS Excluded",
      "refundOrder": 90
    },
    "Portugal": {
      "revenueAccount": 320,
      "revenueDescription": "Product Revenue - Portugal",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 120
    },
    "Poland": {
      "revenueAccount": 326,
      "revenueDescription": "Product Revenue - Poland",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 130
    },
    "Isle Of Man": {
      "revenueAccount": 327,
      "revenueDescription": "Product Revenue - Isle Of Man",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 140
    },
    "Switzerland": {
      "revenueAccount": 336,
      "revenueDescription": "Product Revenue - Switzerland",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 150
    },
    "Denmark": {
      "revenueAccount": 338,
      "revenueDescription": "Product Revenue - Denmark",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 160
    },
    "Vietnam": {
      "revenueAccount": "",
      "revenueDescription": "Product Revenue - Vietnam",
      "revenueTaxRate": "BAS Excluded",
      "revenueOrder": 990
    }
  }
};
