sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/library",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
], function(MessageBox,coreLibrary,MessageToast,BusyIndicator) {
    "use strict";
    //Search-Term: CustomActions
    return {
        onNetworkSelect: function(oEvent) {
            var oComboBox = oEvent.getSource();
            var sChainId = oComboBox.getSelectedKey();
            if (!window.appGlobals) {
                window.appGlobals = {};
            }
            window.appGlobals.chainId = sChainId;
            console.log("Network selected, chainId set to:", sChainId);
        },
        onWalletDialogClose: function(oEvent) {
            console.log("Dialog closed"); 
            this._oConnectDialog.close();
        },
        onConnectToTempoPress: function(oEvent) {
            var oController;
            // Try to get the controller from the ListReport view by ID
            var oView = sap.ui.getCore().byId("BillingDocumentList");
            if (oView && oView.getController) {
                oController = oView.getController();
            }
            // Fallback: try to use this._controller if set elsewhere
            if (!oController && this._controller) {
                oController = this._controller;
            }
            if (!oController) {
                sap.m.MessageToast.show("Controller not found.");
                return;
            }
            if (!oController._oConnectDialog) {
                oController._oConnectDialog = sap.ui.xmlfragment(
                    "project1.ext.fragment.ConnectToTempo",
                    oController
                );
                oController.getView().addDependent(oController._oConnectDialog);
            }
            oController._oConnectDialog.open();
        },
        onWalletSelectionChange : function(oEvent) {
            // Get selected item
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext();

            // Extract your data from the context
            var sProviderWalletId = oContext.getProperty("providerwalletid");
            var sAddress = oContext.getProperty("address");
            var sInternalWalletId = oContext.getProperty("ID");
            
            window.appGlobals.internalWalletId = sInternalWalletId;
            window.appGlobals.creatorWallet = sAddress;
            MessageToast.show("Connected wallet " + sAddress);

            // Example: show in console
            console.log("Selected Wallet ID:", sProviderWalletId);
            console.log("Selected Address:", sAddress);
        },
        onPayInvoicePress: function (oEvent) {
            // 'this' is the FE ListReport controller
            var api = this._controller.getExtensionAPI();
            var aCtx = api.getSelectedContexts(); // works with requiresSelection=true

            if (!aCtx || !aCtx.length) {
                MessageToast.show("Please select at least one invoice.");
                return;
            }

            var aData = aCtx.map(function (c) { return c.getObject(); });
            // TODO: call your action/backend here
            // console.log("Selected Invoices:", aData);
            var oModel = this._controller.getView().getModel();
            let payAPInvoiceURL = "/invoice/payAPInvoice";
            let arTokenizationReqData = {
                reqData : {
                    InvoiceNumber : aData[0].invoiceNumber,
                    InvoiceDate : aData[0].invoiceDate,
                    VendorID : aData[0].vendor_vendorID,
                    PurchaseOrder: aData[0].purchaseOrder,
                    PurchaseOrderLines : '',
                    VendorDocXRef1: aData[0].vendorInvoiceRef,
                    VendorDocXRef2: aData[0].ID,
                    VendorDocXRef3: '',
                    VendorAddress: '0x930e7F4719678d74f10cD1446F3a4b100f13C0Ef',
                    TaxAddress: '0x9b85A2eeaaC93139d155d27915d09ae5e2f4c05a',
                    NetAmount : aData[0].netAmount,
                    TaxAmount : aData[0].taxAmount,
                    TotalAmount: aData[0].grossAmount,
                    Currency: aData[0].baseCurrency_code
                }
            }
            BusyIndicator.show();
            let chainid = parseInt(window.appGlobals && window.appGlobals.chainid ? window.appGlobals.chainid : "11155111");
            let internalWalletId = parseInt(window.appGlobals && window.appGlobals.internalWalletId ? window.appGlobals.internalWalletId : "3");
            try {
                $.ajax({
                    url: '/invoice/',
                    method: "GET",
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    
                    success: function (data, textStatus, jqXHR) {
                        var csrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
                        $.ajax({
                            url: payAPInvoiceURL,
                            method: "POST",
                            data: JSON.stringify(arTokenizationReqData),
                            contentType: "application/json",
                            headers: { 
                                "x-creator-wallet": window.appGlobals && window.appGlobals.creatorWallet ? window.appGlobals.creatorWallet : "",
                                "x-chainid" : chainid,
                                "X-CSRF-Token": csrfToken,
                                "x-internal-wallet-id": internalWalletId
                            },
                            success: function(data) {
                                BusyIndicator.hide();
                                MessageToast.show("Payment successful!");
                                MessageBox.success(`Successfully paid AP Invoice: ${aData[0].invoiceNumber}. See ${data.BlockExplorerLink1} for net payment details and ${data.BlockExplorerLink2} for tax details`);
                             },
                             
                            error: function(err) { 
                                BusyIndicator.hide();
                                MessageBox.error("AP Payment failed.");
                            }
                        });
                        // oModel.loadData(
                        //     tokenizeARInvURL,
                        //     JSON.stringify(arTokenizationReqData), // JSON data as a string
                        //     true, // Asynchronous
                        //     "POST", // HTTP method
                        //     false, // No username needed
                        //     false, // No password needed
                        //     {
                        //         "Content-Type": "application/json;charset=utf-8", // Custom headers
                        //         "X-CSRF-Token": csrfToken // Include the CSRF token here
                        //     }
                        // ).then(
                        //     function (data) {
                        //         // Handle successful response here
                        //         BusyIndicator.hide();
                        //         MessageBox.success("Tokenization successful!");
                        //     },
                        //     function (error) {
                        //         // Handle error response here
                        //         BusyIndicator.hide();
                        //         MessageBox.error("Error tokenizing invoice");
                        //     }
                        // );
                    },
                    error: function (error) {
                        BusyIndicator.hide();
                        MessageBox.error("Error fetching CSRF token");
                        console.error("CSRF token fetch error:", error);
                    }
                });

            } catch (e) {
                sap.m.MessageBox.error(e?.message || "Tokenization failed.");
            }

        },
        onTokenizeBillingDocument: function(oEvent) {
            var oController;
            // Try to get the controller from the ListReport view by ID
            var oView = sap.ui.getCore().byId("BillingDocumentList");
            if (oView && oView.getController) {
                oController = oView.getController();
            }
            // Fallback: try to use this._controller if set elsewhere
            if (!oController && this._controller) {
                oController = this._controller;
            }
            if (!oController) {
                sap.m.MessageToast.show("Controller not found.");
                return;
            }
            var oModel = oController.getView().getModel();
            var oTable;
            var aContent = oController.getView().getContent();
            for (var i = 0; i < aContent.length; i++) {
                if (typeof aContent[i].getSelectedContexts === "function") {
                    oTable = aContent[i];
                    break;
                }
            }
            if (!oTable) {
                MessageToast.show("Table not found.");
                return;
            }
            var aContexts = oTable.getSelectedContexts();
            if (!aContexts.length) {
                MessageToast.show("Please select at least one invoice.");
                return;
            }
            var sDocumentId = aContexts[0].getObject().ID;
            oModel.callAction("/tokenizeBillingDocument", {
                context: aContexts[0],
                headers: {
                    "x-creator-wallet": window.appGlobals && window.appGlobals.creatorWallet ? window.appGlobals.creatorWallet : "",
                    "x-defactor-jwt": window.appGlobals && window.appGlobals.defactorJwt ? window.appGlobals.defactorJwt : ""
                },
                method: "POST",
                urlParameters: {
                    documentID: sDocumentId
                },
                success: function(oData) {
                    MessageToast.show("Tokenization successful!");
                },
                error: function(oError) {
                    MessageBox.error("Tokenization failed.");
                }
            });
        }
    };
});