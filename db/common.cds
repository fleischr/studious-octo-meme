namespace invoice.common;

using { Currency, managed, cuid } from '@sap/cds/common';

// Reusable aspect for managed entities (createdAt, modifiedAt, etc.)
aspect ManagedEntity : managed {
  createdBy  : String(255);
  modifiedBy : String(255);
}

// Reusable aspect for amounts with currency
aspect Amount {
  amount       : Decimal(15, 2) @title: 'Amount';
  currency     : Currency @title: 'Currency';
  exchangeRate : Decimal(10, 6) @title: 'Exchange Rate';
  baseAmount   : Decimal(15, 2) @title: 'Base Amount' @readonly;
}

// Address information
aspect Address {
  street      : String(100);
  city        : String(100);
  postalCode  : String(20);
  country     : String(3);
  region      : String(50);
}

// Contact information
aspect ContactInfo {
  email       : String(255);
  phone       : String(50);
  fax         : String(50);
  website     : String(255);
}
