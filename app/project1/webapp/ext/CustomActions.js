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
        onTokenizePress: function (oEvent) {
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
            let tokenizeARInvURL = "/odata/v4/defactor/tokenizeARInvoice";
            let arTokenizationReqData = {
                reqData : {
                    InvoiceDate : aData[0].CreationDate,
                    Documents : aData[0].AccountingDocument,
                    CreditorsTaxNumber : aData[0].VATRegistration,
                    AssetTitle : "Billing Doc RWA",
                    CreditorLegalName : "Innovative SAP User",
                    InvoiceAmount : aData[0].TotalGrossAmount,
                    PaymentStatus : aData[0].OverallBillingStatus,
                    AssetId : aData[0].BillingDocument,
                    CreditorOfficialLocation : aData[0].IncotermsLocation1, 
                    DebtorDetails : "SoldToParty|"+aData[0].SoldToParty,
                    PaymentHistory : aData[0].InvoiceClearingStatus,
                    PaymentDueDate : aData[0].BillingDocumentDate
                }
            }
            BusyIndicator.show();
            let chainid = parseInt(window.appGlobals && window.appGlobals.chainid ? window.appGlobals.chainid : "11155111");
            let internalWalletId = parseInt(window.appGlobals && window.appGlobals.internalWalletId ? window.appGlobals.internalWalletId : "1");
            try {
                $.ajax({
                    url: '/odata/v4/defactor/',
                    method: "GET",
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    
                    success: function (data, textStatus, jqXHR) {
                        var csrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
                        $.ajax({
                            url: "/odata/v4/defactor/tokenizeARInvoice",
                            method: "POST",
                            data: JSON.stringify(arTokenizationReqData),
                            contentType: "application/json",
                            headers: { 
                                "x-creator-wallet": window.appGlobals && window.appGlobals.creatorWallet ? window.appGlobals.creatorWallet : "",
                                "x-defactor-token": window.appGlobals && window.appGlobals.defactorJwt ? window.appGlobals.defactorJwt : "",
                                "x-chainid" : chainid,
                                "X-CSRF-Token": csrfToken,
                                "x-defactor-template-uuid" : "6c220776-6094-4d53-863d-1872d224d7ba",
                                "x-internal-wallet-id": internalWalletId
                            },
                            success: function(data) {
                                BusyIndicator.hide();
                                MessageToast.show("Tokenization successful!");
                                MessageBox.success(`Successfully tokenized AR Invoice: ${aData[0].BillingDocument}. See ${data.BlockExplorerLink} for details.`);
                             },
                             
                            error: function(err) { 
                                BusyIndicator.hide();
                                MessageBox.error("Tokenization failed.");
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