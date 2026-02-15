namespace invoice.master;

using { invoice.common as common } from './common';
using { Currency, cuid } from '@sap/cds/common';

// Vendor Master Data
entity Vendors : common.ManagedEntity {
  key vendorID        : String(10) @title: 'Vendor ID';
  name                : String(255) @title: 'Vendor Name' @mandatory;
  searchTerm          : String(100) @title: 'Search Term';
  taxID               : String(50) @title: 'Tax ID';

  // Address
  street              : String(100) @title: 'Street';
  city                : String(100) @title: 'City';
  postalCode          : String(20) @title: 'Postal Code';
  country             : String(3) @title: 'Country';
  region              : String(50) @title: 'Region';

  // Contact
  email               : String(255) @title: 'Email';
  phone               : String(50) @title: 'Phone';
  fax                 : String(50) @title: 'Fax';
  website             : String(255) @title: 'Website';
  contactPerson       : String(100) @title: 'Contact Person';

  // Payment Terms
  paymentTerms        : Association to PaymentTerms @title: 'Payment Terms';
  defaultCurrency     : Currency @title: 'Default Currency';

  // Banking Information
  bankAccounts        : Composition of many VendorBankAccounts on bankAccounts.vendor = $self;

  // Status
  isBlocked           : Boolean default false @title: 'Blocked';
  blockingReason      : String(255) @title: 'Blocking Reason';
}

// Vendor Bank Accounts
entity VendorBankAccounts : common.ManagedEntity, cuid {
  vendor              : Association to Vendors @mandatory;
  bankName            : String(100) @title: 'Bank Name' @mandatory;
  bankCountry         : String(3) @title: 'Bank Country';
  accountNumber       : String(50) @title: 'Account Number' @mandatory;
  iban                : String(34) @title: 'IBAN';
  swiftCode           : String(11) @title: 'SWIFT/BIC Code';
  accountHolder       : String(100) @title: 'Account Holder';
  isPrimary           : Boolean default false @title: 'Primary Account';
}

// Payment Terms
entity PaymentTerms : common.ManagedEntity {
  key code            : String(4) @title: 'Payment Term Code';
  description         : String(100) @title: 'Description';
  dueDays             : Integer @title: 'Due Days' @mandatory;
  discountPercent     : Decimal(5, 2) @title: 'Discount %';
  discountDays        : Integer @title: 'Discount Days';
}

// Exchange Rates
entity ExchangeRates : common.ManagedEntity {
  key sourceCurrency  : Currency @title: 'From Currency';
  key targetCurrency  : Currency @title: 'To Currency';
  key validFrom       : Date @title: 'Valid From';
  validTo             : Date @title: 'Valid To';
  rate                : Decimal(10, 6) @title: 'Exchange Rate' @mandatory;
  rateType            : String(4) @title: 'Rate Type';
}
