using { invoice.service.InvoiceService as service } from '../invoice-service';

annotate service.Vendors with @(
  UI.SelectionFields: [
    vendorID,
    name,
    searchTerm,
    isBlocked
  ],

  UI.LineItem: [
    { Value: vendorID, Label: 'Vendor ID' },
    { Value: name, Label: 'Vendor Name' },
    { Value: searchTerm, Label: 'Search Term' },
    { Value: city, Label: 'City' },
    { Value: country, Label: 'Country' },
    { Value: email, Label: 'Email' },
    { Value: isBlocked, Label: 'Blocked' }
  ],

  UI.HeaderInfo: {
    TypeName: 'Vendor',
    TypeNamePlural: 'Vendors',
    Title: { Value: name },
    Description: { Value: vendorID }
  },

  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#GeneralData',
      Label: 'General Data'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#AddressData',
      Label: 'Address'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#ContactData',
      Label: 'Contact Information'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#PaymentData',
      Label: 'Payment Information'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Target: 'bankAccounts/@UI.LineItem',
      Label: 'Bank Accounts'
    }
  ],

  UI.FieldGroup #GeneralData: {
    Data: [
      { Value: vendorID, Label: 'Vendor ID' },
      { Value: name, Label: 'Vendor Name' },
      { Value: searchTerm, Label: 'Search Term' },
      { Value: taxID, Label: 'Tax ID' },
      { Value: isBlocked, Label: 'Blocked' },
      { Value: blockingReason, Label: 'Blocking Reason' }
    ]
  },

  UI.FieldGroup #AddressData: {
    Data: [
      { Value: street, Label: 'Street' },
      { Value: city, Label: 'City' },
      { Value: postalCode, Label: 'Postal Code' },
      { Value: region, Label: 'Region/State' },
      { Value: country, Label: 'Country' }
    ]
  },

  UI.FieldGroup #ContactData: {
    Data: [
      { Value: contactPerson, Label: 'Contact Person' },
      { Value: email, Label: 'Email' },
      { Value: phone, Label: 'Phone' },
      { Value: fax, Label: 'Fax' },
      { Value: website, Label: 'Website' }
    ]
  },

  UI.FieldGroup #PaymentData: {
    Data: [
      { Value: paymentTerms_code, Label: 'Payment Terms' },
      { Value: defaultCurrency_code, Label: 'Default Currency' }
    ]
  }
);

annotate service.VendorBankAccounts with @(
  UI.LineItem: [
    { Value: bankName, Label: 'Bank Name' },
    { Value: accountNumber, Label: 'Account Number' },
    { Value: iban, Label: 'IBAN' },
    { Value: swiftCode, Label: 'SWIFT Code' },
    { Value: bankCountry, Label: 'Country' },
    { Value: isPrimary, Label: 'Primary' }
  ]
);
