using { invoice.documents as docs } from '../db/invoice-documents';
using { invoice.master as master } from '../db/master-data';
using { Currency } from '@sap/cds/common';

namespace invoice.service;

// Main Invoice Processing Service
service InvoiceService @(path: '/invoice') {

  // Invoice Management
  entity Invoices as projection on docs.Invoices
    actions {
      action submit() returns Invoices;
      action approve(comments: String) returns Invoices;
      action reject(reason: String) returns Invoices;
      action cancel(reason: String) returns Invoices;
      action recalculateTotals() returns Invoices;
    };

  entity InvoiceItems as projection on docs.InvoiceItems;

  // Payment Management
  entity PaymentHistory as projection on docs.PaymentHistory;
  entity PaymentStatuses as projection on docs.PaymentStatuses;

  // Document Attachments
  entity InvoiceAttachments as projection on docs.InvoiceAttachments;

  // Master Data (Read/Write)
  entity Vendors as projection on master.Vendors;
  entity VendorBankAccounts as projection on master.VendorBankAccounts;
  entity PaymentTerms as projection on master.PaymentTerms;

  // Exchange Rates
  entity ExchangeRates as projection on master.ExchangeRates;

  // Custom Functions
  function getExchangeRate(
    from: String,
    to: String,
    date: Date
  ) returns Decimal(10, 6);

  function calculateDueDate(
    invoiceDate: Date,
    paymentTermCode: String
  ) returns Date;

  // Analytics Functions
  function getOverdueInvoices() returns many Invoices;
  function getVendorStatistics(vendorID: String) returns {
    totalInvoices: Integer;
    totalAmount: Decimal(15, 2);
    avgPaymentDays: Integer;
    overdueCount: Integer;
  };

  entity EnterpriseDigitalWallet {
      key ID : Integer;
      address : String;
      providerid: String;
      providername : String;
      orgid: String;
      orgname: String;
      providerwalletid: String;
  };

  type payAPInvoice_req {
    InvoiceDate : String;
    VendorID : String;
    PurchaseOrder: String;
    PurchaseOrderLines : String;
    VendorDocXRef1: String;
    VendorDocXRef2: String;
    VendorDocXRef3: String;
    VendorAddress: String;
    TotalAmount: String;
    Currency: String;
  }

  type payAPInvoice_resp {
      NetworkChainId : String;
      TxnHash : String;
      WalletAddress : String;
      Message : String;
  }

  action payAPInvoice( reqData : payAPInvoice_req ) returns payAPInvoice_resp;
}

// Separate Read-Only Service for Reporting
service ReportingService @(path: '/reporting') {

  @readonly entity InvoiceReport as select from docs.Invoices {
    *,
    vendor.name as vendorName,
    vendor.vendorID as vendorCode,
    paymentStatus.name as paymentStatusName
  };

  @readonly entity VendorReport as select from master.Vendors {
    vendorID,
    name,
    searchTerm,
    city,
    country,
    isBlocked
  };
}
