<script>
export default {
    name: "PaymentDetails",
    props: {
        ledgerEntryInfo: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            paymentInfoHeaders: [
                { text: "Entry No", value: "ledgerEntryInfo.EntryNo", align: "left", sortable: false },
                { text: "Posting Date", value: "ledgerEntryInfo.PostingDate", align: "center", sortable: false },
                { text: "Document No", value: "ledgerEntryInfo.DocumentNo", align: "center", sortable: false },
                { text: "Amount", value: "ledgerEntryInfo.Amount", align: "center", sortable: false },
                {
                    text: "Transaction UTR No",
                    value: "ledgerEntryInfo.TransactionUTR",
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
    .col-md-12.page-header
        .logo1.text-left
            img(src='@assets/images/logo1.png') 
        .contract-heading.text-center.mt-3
            h3 Payment Information
    .payment-view
        .container
            .cv
                .mb-2
                    .card
                        .card-header.font-16 
                            .row 
                                .col-sm-4 
                                    span.font-weight-400 Contract Approval Status
                        .card-body
                            v-app
                                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                                    :headers="paymentInfoHeaders", 
                                    :items='ledgerEntryInfo', 
                                    :rows-per-page-items="[10000]",
                                    hide-actions
                                )
                                    template(v-slot:items='{ item }')
                                        td.text-left {{ item.EntryNo ? item.EntryNo : '-' }}
                                        td.text-center {{ item.PostingDate ? item.PostingDate : '-' | date-format}}
                                        td.text-center {{ item.DocumentNo ? item.DocumentNo : '-'}}
                                        td.text-center {{ item.Amount }}
                                        td.text-center {{ item.TransactionUTR || '-'}}
</template>

<style lang="scss">
.payment-view {
    width: 100%;
}
.payment-info {
    padding: 60px 20px;
}
</style>
