const cds = require('@sap/cds');

module.exports = class InvoiceService extends cds.ApplicationService {

  async init() {

    const { Invoices, InvoiceItems, PaymentHistory, PaymentTerms, ExchangeRates } = this.entities;

    // ========== BEFORE CREATE/UPDATE HANDLERS ==========

    // Before creating invoice - generate invoice number if not provided
    this.before('CREATE', 'Invoices', async (req) => {
      const invoice = req.data;

      if (!invoice.invoiceNumber) {
        invoice.invoiceNumber = await this.generateInvoiceNumber();
      }

      // Set posting date if not provided
      if (!invoice.postingDate) {
        invoice.postingDate = new Date().toISOString().split('T')[0];
      }

      // Calculate due date if payment terms provided
      if (invoice.paymentTerms_code && invoice.invoiceDate) {
        invoice.dueDate = await this.calculateDueDate(
          invoice.invoiceDate,
          invoice.paymentTerms_code
        );
      }

      // Set fiscal year and period
      const fiscalDate = new Date(invoice.postingDate);
      invoice.fiscalYear = fiscalDate.getFullYear().toString();
      invoice.fiscalPeriod = (fiscalDate.getMonth() + 1).toString().padStart(2, '0');

      // Get exchange rate and calculate base amount
      if (invoice.currency_code && invoice.baseCurrency_code && invoice.currency_code !== invoice.baseCurrency_code) {
        invoice.exchangeRate = await this.getExchangeRate(
          invoice.currency_code,
          invoice.baseCurrency_code,
          invoice.invoiceDate
        );
        invoice.baseGrossAmount = invoice.grossAmount * invoice.exchangeRate;
      } else {
        invoice.exchangeRate = 1;
        invoice.baseGrossAmount = invoice.grossAmount;
      }

      // Set default payment status
      invoice.paymentStatus_code = 'PENDING';
    });

    // Before creating invoice item - validate and calculate amounts
    this.before('CREATE', 'InvoiceItems', async (req) => {
      const item = req.data;

      // Calculate amounts if quantity and unit price provided
      if (item.quantity && item.unitPrice && !item.netAmount) {
        item.netAmount = item.quantity * item.unitPrice;
      }

      // Calculate tax amount
      if (item.taxRate && item.netAmount) {
        item.taxAmount = item.netAmount * (item.taxRate / 100);
        item.grossAmount = item.netAmount + item.taxAmount;
      } else {
        item.taxAmount = 0;
        item.grossAmount = item.netAmount || 0;
      }
    });

    // After creating/updating items - recalculate invoice totals
    this.after(['CREATE', 'UPDATE'], 'InvoiceItems', async (data, req) => {
      const invoiceID = req.data.invoice_ID;
      if (invoiceID) {
        await this.recalculateInvoiceTotals(invoiceID);
      }
    });

    this.after('DELETE', 'InvoiceItems', async (data, req) => {
      const invoiceID = data.invoice_ID;
      if (invoiceID) {
        await this.recalculateInvoiceTotals(invoiceID);
      }
    });

    // ========== VALIDATION HANDLERS ==========

    this.before('UPDATE', 'Invoices', async (req) => {
      if (req.data.ID) {
        const invoice = await SELECT.one.from(Invoices).where({ ID: req.data.ID });

        // Prevent editing paid or cancelled invoices
        if (invoice && (invoice.status === 'PAID' || invoice.status === 'CANCELLED')) {
          req.error(400, `Cannot modify invoice in ${invoice.status} status`);
        }
      }
    });

    this.before('DELETE', 'Invoices', async (req) => {
      const invoice = await SELECT.one.from(Invoices).where({ ID: req.data.ID });

      // Only allow deletion of draft invoices
      if (invoice && invoice.status !== 'DRAFT') {
        req.error(400, 'Only draft invoices can be deleted');
      }
    });

    // ========== ACTION HANDLERS ==========

    // Submit invoice for approval
    this.on('submit', 'Invoices', async (req) => {
      const { ID } = req.params[0];

      // Validate invoice is complete
      const invoice = await SELECT.one.from(Invoices).where({ ID });

      if (!invoice) {
        return req.error(404, 'Invoice not found');
      }

      if (invoice.status !== 'DRAFT') {
        return req.error(400, 'Only draft invoices can be submitted');
      }

      // Check required fields
      if (!invoice.vendor_vendorID || !invoice.grossAmount) {
        return req.error(400, 'Invoice missing required fields');
      }

      // Update status
      await UPDATE(Invoices).set({ status: 'SUBMITTED' }).where({ ID });

      return SELECT.one.from(Invoices).where({ ID });
    });

    // Approve invoice
    this.on('approve', 'Invoices', async (req) => {
      const { ID } = req.params[0];
      const { comments } = req.data;

      const invoice = await SELECT.one.from(Invoices).where({ ID });

      if (!invoice) {
        return req.error(404, 'Invoice not found');
      }

      if (invoice.status !== 'SUBMITTED') {
        return req.error(400, 'Only submitted invoices can be approved');
      }

      await UPDATE(Invoices).set({
        status: 'APPROVED',
        approver: req.user.id || 'system',
        approvalDate: new Date().toISOString(),
        approvalComments: comments
      }).where({ ID });

      return SELECT.one.from(Invoices).where({ ID });
    });

    // Reject invoice
    this.on('reject', 'Invoices', async (req) => {
      const { ID } = req.params[0];
      const { reason } = req.data;

      const invoice = await SELECT.one.from(Invoices).where({ ID });

      if (!invoice) {
        return req.error(404, 'Invoice not found');
      }

      if (invoice.status !== 'SUBMITTED') {
        return req.error(400, 'Only submitted invoices can be rejected');
      }

      await UPDATE(Invoices).set({
        status: 'REJECTED',
        approver: req.user.id || 'system',
        approvalDate: new Date().toISOString(),
        approvalComments: reason
      }).where({ ID });

      return SELECT.one.from(Invoices).where({ ID });
    });

    // Cancel invoice
    this.on('cancel', 'Invoices', async (req) => {
      const { ID } = req.params[0];
      const { reason } = req.data;

      await UPDATE(Invoices).set({
        status: 'CANCELLED',
        notes: reason
      }).where({ ID });

      return SELECT.one.from(Invoices).where({ ID });
    });

    // Recalculate totals action
    this.on('recalculateTotals', 'Invoices', async (req) => {
      const { ID } = req.params[0];
      await this.recalculateInvoiceTotals(ID);
      return SELECT.one.from(Invoices).where({ ID });
    });

    // ========== FUNCTION IMPLEMENTATIONS ==========

    this.on('getExchangeRate', async (req) => {
      const { from, to, date } = req.data;
      return await this.getExchangeRate(from, to, date);
    });

    this.on('calculateDueDate', async (req) => {
      const { invoiceDate, paymentTermCode } = req.data;
      return await this.calculateDueDate(invoiceDate, paymentTermCode);
    });

    this.on('getOverdueInvoices', async () => {
      const today = new Date().toISOString().split('T')[0];
      return await SELECT.from(Invoices).where({
        dueDate: { '<': today },
        and: [
          { status: { '!=': 'PAID' } },
          { status: { '!=': 'CANCELLED' } }
        ]
      });
    });

    this.on('getVendorStatistics', async (req) => {
      const { vendorID } = req.data;

      const invoices = await SELECT.from(Invoices).where({ vendor_vendorID: vendorID });
      const payments = await SELECT.from(PaymentHistory)
        .columns('invoice_ID', 'paymentDate')
        .where(invoices.map(inv => ({ invoice_ID: inv.ID })));

      const today = new Date().toISOString().split('T')[0];

      return {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.grossAmount || 0), 0),
        avgPaymentDays: this.calculateAvgPaymentDays(invoices, payments),
        overdueCount: invoices.filter(inv =>
          inv.dueDate < today &&
          inv.status !== 'PAID' &&
          inv.status !== 'CANCELLED'
        ).length
      };
    });

    this.on(['READ', 'QUERY'],'EnterpriseDigitalWallet', async (req) => {
      const ADDRESS = process.env.ORG_PUBLIC_ADDRESS;
      let test_wallet = {
        ID : 1, 
        address : ADDRESS,
        providerid: "local",
        providername : "local",
        orgid: "local",
        orgname: "local",
        providerwalletid: "TestWallet",
        internalWalletID: 1
      }
      let turnkey_wallet = {
        ID : 2,
        address: "0x9b85A2eeaaC93139d155d27915d09ae5e2f4c05a",
        providerid: "TURNKEY",
        providername : "Turnkey",
        orgid: "6cd4813e-2bf3-48ca-91c6-c391c220e174",
        orgname: "Developer Turnkey Account",
        providerwalletid : "e6eba4e7-5e3d-5574-97ee-ad4c6e86a15e",
        internalWalletID: 2
      };
      let privy_wallet = {
        ID : 3,
        address: "0x76f3374327ef12655360f6638DC65CC35ee7E6A3",
        providerid : "PRIVY",
        providername : "Privy",
        orgid : "cmlk8u5dh00mu0djvovl08xk9",
        orgname: "Hermes B2B Tempo AP invoice payments",
        providerwalletid: "e3f4l65qb0ktnuxvsnnqhqqh",
        internalWalletID: 3
      };
      let wallets = [test_wallet,turnkey_wallet,privy_wallet];
      return wallets;
    });

     this.on('payAPInvoice', async (req) => {
      console.log(req.data.reqData);
      let creator_wallet = req.headers['x-creator-wallet'];
      let chain_id = req.headers['x-chainid'];
      let internal_wallet = req.headers['x-internal-wallet-id'];
      let tokenizeARInvoice_resp = {};
      try{
        var validationError = false;
        if(!creator_wallet) {
          req.error(400, "Missing header x-creator-wallet");
          validationError = true;
        }
        if(!chain_id) {
          req.error(400, "Missing header x-chainid");
          validationError = true;
        }
        if(validationError === true) {
          throw "Input error";
        }
      } catch(error) {
        return false;
      }
    });

    // ========== HELPER METHODS ==========

    // Generate sequential invoice number
    this.generateInvoiceNumber = async function() {
      const year = new Date().getFullYear();
      const prefix = `INV${year}`;

      const lastInvoice = await SELECT.one.from(Invoices)
        .where`invoiceNumber like ${prefix + '%'}`
        .orderBy`invoiceNumber desc`;

      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-6));
        nextNumber = lastNumber + 1;
      }

      return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    };

    // Get exchange rate for date
    this.getExchangeRate = async function(from, to, date) {
      if (from === to) return 1;

      const rate = await SELECT.one.from(ExchangeRates).where({
        sourceCurrency_code: from,
        targetCurrency_code: to,
        validFrom: { '<=': date },
        and: { validTo: { '>=': date } }
      });

      if (rate) {
        return rate.rate;
      }

      // If no rate found, try inverse
      const inverseRate = await SELECT.one.from(ExchangeRates).where({
        sourceCurrency_code: to,
        targetCurrency_code: from,
        validFrom: { '<=': date },
        and: { validTo: { '>=': date } }
      });

      if (inverseRate) {
        return 1 / inverseRate.rate;
      }

      // Default to 1 if no rate found
      return 1;
    };

    // Calculate due date based on payment terms
    this.calculateDueDate = async function(invoiceDate, paymentTermCode) {
      const terms = await SELECT.one.from(PaymentTerms).where({ code: paymentTermCode });

      if (!terms) return invoiceDate;

      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + terms.dueDays);

      return dueDate.toISOString().split('T')[0];
    };

    // Recalculate invoice totals from items
    this.recalculateInvoiceTotals = async function(invoiceID) {
      const items = await SELECT.from(InvoiceItems).where({ invoice_ID: invoiceID });

      const netAmount = items.reduce((sum, item) => sum + (item.netAmount || 0), 0);
      const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const grossAmount = items.reduce((sum, item) => sum + (item.grossAmount || 0), 0);

      await UPDATE(Invoices).set({
        netAmount,
        taxAmount,
        grossAmount
      }).where({ ID: invoiceID });
    };

    // Calculate average payment days
    this.calculateAvgPaymentDays = function(invoices, payments) {
      let totalDays = 0;
      let count = 0;

      payments.forEach(payment => {
        const invoice = invoices.find(inv => inv.ID === payment.invoice_ID);
        if (invoice && invoice.invoiceDate && payment.paymentDate) {
          const invoiceDate = new Date(invoice.invoiceDate);
          const paymentDate = new Date(payment.paymentDate);
          const days = Math.floor((paymentDate - invoiceDate) / (1000 * 60 * 60 * 24));
          totalDays += days;
          count++;
        }
      });

      return count > 0 ? Math.round(totalDays / count) : 0;
    };

    return super.init();
  }
};
