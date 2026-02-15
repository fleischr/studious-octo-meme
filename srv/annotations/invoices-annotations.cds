using { invoice.service.InvoiceService as service } from '../invoice-service';

// ========== LIST PAGE ANNOTATIONS ==========

annotate service.Invoices with @(
  UI.SelectionFields: [
    invoiceNumber,
    vendor_vendorID,
    invoiceDate,
    status,
    paymentStatus_code
  ],
  UI.LineItem: [
    { Value: invoiceNumber, Label: 'Invoice Number' },
    { Value: vendor.name, Label: 'Vendor' },
    { Value: invoiceDate, Label: 'Invoice Date' },
    { Value: dueDate, Label: 'Due Date' },
    { Value: grossAmount, Label: 'Gross Amount' },
    { Value: currency_code, Label: 'Currency' },
    { Value: status, Label: 'Status' },
    { Value: paymentStatus.name, Label: 'Payment Status' }
  ]
);

// ========== OBJECT PAGE ANNOTATIONS ==========

annotate service.Invoices with @(
  UI.HeaderInfo: {
    TypeName: 'Invoice',
    TypeNamePlural: 'Invoices',
    Title: { Value: invoiceNumber },
    Description: { Value: vendor.name }
  },

  UI.HeaderFacets: [
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#HeaderData',
      Label: 'Invoice Details'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#AmountData',
      Label: 'Amounts'
    }
  ],

  UI.FieldGroup #HeaderData: {
    Data: [
      { Value: invoiceNumber, Label: 'Invoice Number' },
      { Value: invoiceDate, Label: 'Invoice Date' },
      { Value: dueDate, Label: 'Due Date' },
      { Value: status, Label: 'Status' }
    ]
  },

  UI.FieldGroup #AmountData: {
    Data: [
      { Value: grossAmount, Label: 'Gross Amount' },
      { Value: currency_code, Label: 'Currency' },
      { Value: netAmount, Label: 'Net Amount' },
      { Value: taxAmount, Label: 'Tax Amount' }
    ]
  },

  UI.Facets: [
    {
      $Type: 'UI.CollectionFacet',
      Label: 'General Information',
      Facets: [
        {
          $Type: 'UI.ReferenceFacet',
          Target: '@UI.FieldGroup#GeneralInfo',
          Label: 'Invoice Details'
        },
        {
          $Type: 'UI.ReferenceFacet',
          Target: '@UI.FieldGroup#VendorInfo',
          Label: 'Vendor Information'
        }
      ]
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#PaymentInfo',
      Label: 'Payment Information'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#AmountDetails',
      Label: 'Amount Details'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: 'items/@UI.LineItem',
      Label: 'Line Items'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: 'attachments/@UI.LineItem',
      Label: 'Attachments'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: 'paymentHistory/@UI.LineItem',
      Label: 'Payment History'
    }
  ],

  UI.FieldGroup #GeneralInfo: {
    Data: [
      { Value: invoiceNumber, Label: 'Invoice Number' },
      { Value: invoiceDate, Label: 'Invoice Date' },
      { Value: postingDate, Label: 'Posting Date' },
      { Value: dueDate, Label: 'Due Date' },
      { Value: fiscalYear, Label: 'Fiscal Year' },
      { Value: fiscalPeriod, Label: 'Fiscal Period' },
      { Value: purchaseOrder, Label: 'Purchase Order' },
      { Value: goodsReceipt, Label: 'Goods Receipt' },
      { Value: headerText, Label: 'Header Text' },
      { Value: notes, Label: 'Notes' }
    ]
  },

  UI.FieldGroup #VendorInfo: {
    Data: [
      { Value: vendor_vendorID, Label: 'Vendor' },
      { Value: vendorInvoiceRef, Label: 'Vendor Invoice Reference' }
    ]
  },

  UI.FieldGroup #PaymentInfo: {
    Data: [
      { Value: paymentTerms_code, Label: 'Payment Terms' },
      { Value: paymentStatus_code, Label: 'Payment Status' },
      { Value: paymentMethod, Label: 'Payment Method' },
      { Value: approver, Label: 'Approver' },
      { Value: approvalDate, Label: 'Approval Date' },
      { Value: approvalComments, Label: 'Approval Comments' }
    ]
  },

  UI.FieldGroup #AmountDetails: {
    Data: [
      { Value: currency_code, Label: 'Currency' },
      { Value: grossAmount, Label: 'Gross Amount' },
      { Value: netAmount, Label: 'Net Amount' },
      { Value: taxAmount, Label: 'Tax Amount' },
      { Value: discountAmount, Label: 'Discount Amount' },
      { Value: exchangeRate, Label: 'Exchange Rate' },
      { Value: baseCurrency_code, Label: 'Base Currency' },
      { Value: baseGrossAmount, Label: 'Base Gross Amount' }
    ]
  }
);

// ========== FIELD-LEVEL ANNOTATIONS ==========

annotate service.Invoices with {
  vendor @(
    Common.Label: 'Vendor',
    Common.ValueList: {
      CollectionPath: 'Vendors',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: vendor_vendorID, ValueListProperty: 'vendorID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'searchTerm' }
      ]
    }
  );

  currency @(
    Common.Label: 'Currency'
  );

  paymentTerms @(
    Common.Label: 'Payment Terms',
    Common.ValueList: {
      CollectionPath: 'PaymentTerms',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: paymentTerms_code, ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'description' }
      ]
    }
  );

  status @(
    Common.Label: 'Status',
    Common.FieldControl: #ReadOnly
  );
};

// ========== INVOICE ITEMS ANNOTATIONS ==========

annotate service.InvoiceItems with @(
  UI.LineItem: [
    { Value: itemNumber, Label: 'Item' },
    { Value: description, Label: 'Description' },
    { Value: quantity, Label: 'Quantity' },
    { Value: unitOfMeasure, Label: 'UoM' },
    { Value: unitPrice, Label: 'Unit Price' },
    { Value: netAmount, Label: 'Net Amount' },
    { Value: taxRate, Label: 'Tax Rate %' },
    { Value: taxAmount, Label: 'Tax Amount' },
    { Value: grossAmount, Label: 'Gross Amount' }
  ],

  UI.FieldGroup #ItemDetails: {
    Data: [
      { Value: itemNumber, Label: 'Item Number' },
      { Value: description, Label: 'Description' },
      { Value: quantity, Label: 'Quantity' },
      { Value: unitOfMeasure, Label: 'Unit of Measure' },
      { Value: unitPrice, Label: 'Unit Price' },
      { Value: netAmount, Label: 'Net Amount' },
      { Value: taxCode, Label: 'Tax Code' },
      { Value: taxRate, Label: 'Tax Rate %' },
      { Value: taxAmount, Label: 'Tax Amount' },
      { Value: grossAmount, Label: 'Gross Amount' }
    ]
  },

  UI.FieldGroup #AccountingDetails: {
    Data: [
      { Value: glAccount, Label: 'G/L Account' },
      { Value: costCenter, Label: 'Cost Center' },
      { Value: profitCenter, Label: 'Profit Center' },
      { Value: wbsElement, Label: 'WBS Element' },
      { Value: purchaseOrderItem, Label: 'PO Item' },
      { Value: materialNumber, Label: 'Material Number' }
    ]
  }
);

// ========== ATTACHMENTS ANNOTATIONS ==========

annotate service.InvoiceAttachments with @(
  UI.LineItem: [
    { Value: fileName, Label: 'File Name' },
    { Value: documentType, Label: 'Document Type' },
    { Value: description, Label: 'Description' },
    { Value: fileSize, Label: 'File Size' },
    { Value: mimeType, Label: 'Type' },
    { Value: createdAt, Label: 'Uploaded On' }
  ]
);

annotate service.InvoiceAttachments with {
  content @Core.MediaType: mimeType;
};

// ========== PAYMENT HISTORY ANNOTATIONS ==========

annotate service.PaymentHistory with @(
  UI.LineItem: [
    { Value: paymentDate, Label: 'Payment Date' },
    { Value: paymentAmount, Label: 'Amount' },
    { Value: currency_code, Label: 'Currency' },
    { Value: paymentMethod, Label: 'Method' },
    { Value: paymentReference, Label: 'Reference' },
    { Value: status.name, Label: 'Status' },
    { Value: clearingDocument, Label: 'Clearing Doc' }
  ]
);
