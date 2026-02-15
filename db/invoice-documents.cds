namespace invoice.documents;

using { invoice.common as common } from './common';
using { invoice.master as master } from './master-data';
using { Currency, cuid } from '@sap/cds/common';

// Invoice Header
entity Invoices : common.ManagedEntity, cuid {
  // Document Information
  invoiceNumber       : String(20) @title: 'Invoice Number' @mandatory;
  invoiceDate         : Date @title: 'Invoice Date' @mandatory;
  postingDate         : Date @title: 'Posting Date';
  dueDate             : Date @title: 'Due Date' @mandatory;
  fiscalYear          : String(4) @title: 'Fiscal Year';
  fiscalPeriod        : String(2) @title: 'Fiscal Period';

  // Vendor Information
  vendor              : Association to master.Vendors @title: 'Vendor' @mandatory;
  vendorInvoiceRef    : String(50) @title: 'Vendor Invoice Reference';

  // Amounts
  currency            : Currency @title: 'Currency' @mandatory;
  grossAmount         : Decimal(15, 2) @title: 'Gross Amount' @mandatory;
  netAmount           : Decimal(15, 2) @title: 'Net Amount' @mandatory;
  taxAmount           : Decimal(15, 2) @title: 'Tax Amount';
  discountAmount      : Decimal(15, 2) @title: 'Discount Amount';

  // Exchange Rate Information
  exchangeRate        : Decimal(10, 6) @title: 'Exchange Rate';
  baseGrossAmount     : Decimal(15, 2) @title: 'Gross Amount (Base)' @readonly;
  baseCurrency        : Currency default 'USD' @title: 'Base Currency';

  // Payment Information
  paymentTerms        : Association to master.PaymentTerms @title: 'Payment Terms';
  paymentStatus       : Association to PaymentStatuses @title: 'Payment Status';
  paymentMethod       : String(20) @title: 'Payment Method';

  // Status and Workflow
  status              : String(20) @title: 'Document Status' default 'DRAFT';

  approver            : String(255) @title: 'Approver';
  approvalDate        : DateTime @title: 'Approval Date';
  approvalComments    : String(1000) @title: 'Approval Comments';

  // References
  purchaseOrder       : String(20) @title: 'Purchase Order';
  goodsReceipt        : String(20) @title: 'Goods Receipt';

  // Text Fields
  headerText          : String(255) @title: 'Header Text';
  notes               : String(1000) @title: 'Notes';

  // Compositions
  items               : Composition of many InvoiceItems on items.invoice = $self;
  attachments         : Composition of many InvoiceAttachments on attachments.invoice = $self;
  paymentHistory      : Composition of many PaymentHistory on paymentHistory.invoice = $self;

  // Calculated Fields
  virtual remainingAmount : Decimal(15, 2) @title: 'Remaining Amount';
  virtual isOverdue       : Boolean @title: 'Overdue';
}

// Invoice Line Items
entity InvoiceItems : common.ManagedEntity, cuid {
  invoice             : Association to Invoices @mandatory;
  itemNumber          : Integer @title: 'Item Number' @mandatory;

  // Item Details
  description         : String(255) @title: 'Description' @mandatory;
  quantity            : Decimal(13, 3) @title: 'Quantity';
  unitOfMeasure       : String(3) @title: 'Unit of Measure';
  unitPrice           : Decimal(15, 2) @title: 'Unit Price';

  // Amounts
  netAmount           : Decimal(15, 2) @title: 'Net Amount' @mandatory;
  taxCode             : String(2) @title: 'Tax Code';
  taxRate             : Decimal(5, 2) @title: 'Tax Rate %';
  taxAmount           : Decimal(15, 2) @title: 'Tax Amount';
  grossAmount         : Decimal(15, 2) @title: 'Gross Amount';

  // Accounting
  glAccount           : String(10) @title: 'G/L Account';
  costCenter          : String(10) @title: 'Cost Center';
  profitCenter        : String(10) @title: 'Profit Center';
  wbsElement          : String(24) @title: 'WBS Element';

  // References
  purchaseOrderItem   : String(5) @title: 'PO Item';
  materialNumber      : String(18) @title: 'Material Number';

  // Text
  notes               : String(500) @title: 'Notes';
}

// Payment Status Code List
entity PaymentStatuses {
  key code            : String(20) @title: 'Status Code';
  name                : String(100) @title: 'Status Name';
  description         : String(255) @title: 'Description';
  sortOrder           : Integer @title: 'Sort Order';
  isFinal             : Boolean default false @title: 'Final Status';
}

// Payment History Tracking
entity PaymentHistory : common.ManagedEntity, cuid {
  invoice             : Association to Invoices @mandatory;
  paymentDate         : Date @title: 'Payment Date' @mandatory;
  paymentAmount       : Decimal(15, 2) @title: 'Payment Amount' @mandatory;
  currency            : Currency @title: 'Currency';
  paymentMethod       : String(20) @title: 'Payment Method';
  paymentReference    : String(50) @title: 'Payment Reference';
  bankAccount         : Association to master.VendorBankAccounts @title: 'Bank Account';
  status              : Association to PaymentStatuses @title: 'Status';
  notes               : String(500) @title: 'Notes';
  clearingDocument    : String(20) @title: 'Clearing Document';
}

// Document Attachments
entity InvoiceAttachments : common.ManagedEntity, cuid {
  invoice             : Association to Invoices @mandatory;
  fileName            : String(255) @title: 'File Name' @mandatory;
  fileSize            : Integer @title: 'File Size (bytes)';
  mimeType            : String(100) @title: 'MIME Type';
  documentType        : String(20) @title: 'Document Type';
  description         : String(255) @title: 'Description';
  content             : LargeBinary @Core.MediaType: mimeType @Core.ContentDisposition.Filename: fileName;
  url                 : String(500) @title: 'URL';
}
