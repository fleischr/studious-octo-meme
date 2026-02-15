using invoice.service.InvoiceService as service from '../../srv/invoice-service';
annotate service.Invoices with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'createdBy',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Label : 'modifiedBy',
                Value : modifiedBy,
            },
            {
                $Type : 'UI.DataField',
                Value : invoiceNumber,
            },
            {
                $Type : 'UI.DataField',
                Value : invoiceDate,
            },
            {
                $Type : 'UI.DataField',
                Value : postingDate,
            },
            {
                $Type : 'UI.DataField',
                Value : dueDate,
            },
            {
                $Type : 'UI.DataField',
                Value : fiscalYear,
            },
            {
                $Type : 'UI.DataField',
                Value : fiscalPeriod,
            },
            {
                $Type : 'UI.DataField',
                Label : 'vendor_vendorID',
                Value : vendor_vendorID,
            },
            {
                $Type : 'UI.DataField',
                Value : vendorInvoiceRef,
            },
            {
                $Type : 'UI.DataField',
                Label : 'currency_code',
                Value : currency_code,
            },
            {
                $Type : 'UI.DataField',
                Value : grossAmount,
            },
            {
                $Type : 'UI.DataField',
                Value : netAmount,
            },
            {
                $Type : 'UI.DataField',
                Value : taxAmount,
            },
            {
                $Type : 'UI.DataField',
                Value : discountAmount,
            },
            {
                $Type : 'UI.DataField',
                Value : exchangeRate,
            },
            {
                $Type : 'UI.DataField',
                Value : baseGrossAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'baseCurrency_code',
                Value : baseCurrency_code,
            },
            {
                $Type : 'UI.DataField',
                Label : 'paymentTerms_code',
                Value : paymentTerms_code,
            },
            {
                $Type : 'UI.DataField',
                Label : 'paymentStatus_code',
                Value : paymentStatus_code,
            },
            {
                $Type : 'UI.DataField',
                Value : paymentMethod,
            },
            {
                $Type : 'UI.DataField',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Value : approver,
            },
            {
                $Type : 'UI.DataField',
                Value : approvalDate,
            },
            {
                $Type : 'UI.DataField',
                Value : approvalComments,
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrder,
            },
            {
                $Type : 'UI.DataField',
                Value : goodsReceipt,
            },
            {
                $Type : 'UI.DataField',
                Value : headerText,
            },
            {
                $Type : 'UI.DataField',
                Value : notes,
            },
            {
                $Type : 'UI.DataField',
                Value : remainingAmount,
            },
            {
                $Type : 'UI.DataField',
                Value : isOverdue,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'createdBy',
            Value : createdBy,
        },
        {
            $Type : 'UI.DataField',
            Label : 'modifiedBy',
            Value : modifiedBy,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceNumber,
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceDate,
        },
        {
            $Type : 'UI.DataField',
            Value : postingDate,
        },
    ],
);

annotate service.Invoices with {
    vendor @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Vendors',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : vendor_vendorID,
                ValueListProperty : 'vendorID',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'createdBy',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'modifiedBy',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'searchTerm',
            },
        ],
    }
};

annotate service.Invoices with {
    paymentTerms @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'PaymentTerms',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : paymentTerms_code,
                ValueListProperty : 'code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'createdBy',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'modifiedBy',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'dueDays',
            },
        ],
    }
};

annotate service.Invoices with {
    paymentStatus @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'PaymentStatuses',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : paymentStatus_code,
                ValueListProperty : 'code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'sortOrder',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'isFinal',
            },
        ],
    }
};

