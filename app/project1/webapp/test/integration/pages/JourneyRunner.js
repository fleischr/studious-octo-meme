sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project1/test/integration/pages/InvoicesList",
	"project1/test/integration/pages/InvoicesObjectPage",
	"project1/test/integration/pages/InvoiceItemsObjectPage"
], function (JourneyRunner, InvoicesList, InvoicesObjectPage, InvoiceItemsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project1') + '/test/flpSandbox.html#project1-tile',
        pages: {
			onTheInvoicesList: InvoicesList,
			onTheInvoicesObjectPage: InvoicesObjectPage,
			onTheInvoiceItemsObjectPage: InvoiceItemsObjectPage
        },
        async: true
    });

    return runner;
});

