# B2B AP Invoice Payments with Tempo Stablecoins, Privy - integrated to SAP BTP

This entry demonstrates a B2B SaaS meant for the SAP BTP cloud ecosystem.

SAP is the leading financial management system used by Fortune 500s

Outgoing AP payments for SAP are typically handled by a legacy process known as F110. This relies on the SAP system to retain and use very private bank records for their vendors and put together a very sensitive file transmission in which all the account and routing numbers and other contact details are shared to the bank to begin payments that then take several business days to reach full settlement.

With a blockchain like Tempo and wallet platforms like Privy - you could implement faster global B2B payments. And if an ecosystem of vendors/banks/enterprises were to opt-in for it - there could be far fewer privacy incidents with wallets than typical bank accounts.

This entry shows a basic example of an enterprise paying an invoice on Tempo with a Privy wallet.

I didn't really write any custom smart contracts for this hackathon - because I don't think businesses really need those. Its better for there to be industry-standard smart contracts and network functionality - and I consider that to really be one Tempos real strengths.

## How to set up

After ```npm install``` - run ```cds deploy``` and tehn ```cds watch``` to run locally.

In your .env enter your Privy api credentials and wallet id. Fund it from the Tempo testnet.

From localhost open the invoice fiori/sapui5 app.

You'll see a list of invoices. Click go to get a list of invoices. Now click buttons to pay invoices with stablecoins on Tempo!

## About the hackathon entrant

Ryan Fleischmann is a SAP BTP Architect at AppZen - a leading AI startup in AP automation and fraud prevention. Ryan previously also recently worked at Thomson Reuters ONESOURCE where he led teams integrating SAP BTP with ONESOURCE's tax provision, statutory reporting, global trade, ESG and AI platforms and products. Ryan has worked with various other ERP/SAP implementations for nearly 14 years now.

Ryan's previous history in web3 includes working with Defactor, the Enterprise Ethereum Alliance, Baseline Protocol, KlimaDAO/Carbonmark, and Provide

## Wat now?

This could evolve into a multitenant B2B SaaS on SAP BTP - where it could scale to new enterprises.