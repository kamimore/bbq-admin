<script>
export default {
    name: "VendorDetails",
    props: {
        ledgerEntryInfo: {
            type: Object,
            default: () => [],
        },
    },
    data() {
        return {
            paymentInfoHeaders: [
                {
                    text: "Posting Date",
                    value: "ledgerEntryInfo.PostingDate",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Beneficiary Bank",
                    value: "ledgerEntryInfo.BeneficiaryBank",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Transaction UTR No",
                    value: "ledgerEntryInfo.TransactionUTR",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Transaction Amount",
                    value: "ledgerEntryInfo.TransactionAmount",
                    align: "center",
                    sortable: false,
                },
            ],
            InvoiceInfoHeaders: [
                { text: "Posting Date", value: "ledgerEntryInfo.PostingDate", align: "center", sortable: false },
                {
                    text: "Invoice No",
                    value: "ledgerEntryInfo.InvoiceNo",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Document No",
                    value: "ledgerEntryInfo.DocumentNo",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "Amount",
                    value: "ledgerEntryInfo.Amount",
                    align: "center",
                    sortable: false,
                },
            ],
            DocumentInfoHeaders: [
                {
                    text: "File Name",
                    value: "ledgerEntryInfo.FileName",
                    align: "center",
                    sortable: false,
                },
                {
                    text: "File Link",
                    value: "ledgerEntryInfo.FileLink",
                    align: "center",
                    sortable: false,
                },
            ],
        };
    },
    methods: {},
};
</script>
<template lang="pug">
.row.payment-info
    .col-md-12.page-header.logo_text
        .logo1.text-left
            img(src="@assets/images/logo1.png") 
        //- .contract-heading.text-center.mt-3
            //- h3 Payment Information
    .payment-view
        .container
            .cv
                .mb-2
                    .card
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Payment Advice
                        .card-body
                            v-app
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    :headers="paymentInfoHeaders",
                                    :items="ledgerEntryInfo.PaymentItems",
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items="{ item }")
                                        td.text-center {{ item.PostingDate ? item.PostingDate : '-' | dateFormat }}
                                        td.text-center {{ item.BeneficiaryBank ? item.BeneficiaryBank : '-' }}
                                        td.text-center {{ item.TransactionUTR || '-' }}
                                        td.text-center {{ item.TransactionAmount }}
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Invoice Details
                        .card-body
                            v-app
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    :headers="InvoiceInfoHeaders",
                                    :items="ledgerEntryInfo.InvoiceItems",
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items="{ item }")
                                        td.text-center {{ item.PostingDate ? item.PostingDate : '-' | dateFormat }}
                                        td.text-center {{ item.InvoiceNo ? item.InvoiceNo : '-' }}
                                        td.text-center {{ item.DocumentNo || '-' }}
                                        td.text-center {{ item.Amount || '-' }}
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Documents
                        .card-body
                            v-app
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    :headers="DocumentInfoHeaders",
                                    :items="ledgerEntryInfo.DocumentItems",
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items="{ item }")
                                        td.text-center {{ item.FileName ? item.FileName : '-' }}
                                        td.link.text-center(
                                        ) 
                                            a.link(:href="`http://${item.FileLink}`" target="_blank") {{ item.FileLink ? item.FileLink : '-' }}
                                            //- @click="$utility.redirectToLink(item.FileLink, item.FileName)"
</template>

<style lang="scss">
.payment-view {
    width: 100%;
}
.payment-info {
    padding: 60px 20px;
}
</style>
