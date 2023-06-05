<script>
export default {
    name: "DocDetails",
    props: {
        ledgerDocEntryInfo: {
            type: Object,
            default: () => [],
        },
        documentType: {
            type: Number
        }
    },
    data() {
        let headerColumn = [];
        if(this.documentType == '1'){
            headerColumn = [
                { text: "Description", value: "ledgerDocEntryInfo.Description", align: "left", sortable: false },
                { text: "Qty", value: "ledgerDocEntryInfo.Quantity", align: "center", sortable: false },
                { text: "Unit", value: "ledgerDocEntryInfo.Unit", align: "center", sortable: false },
                { text: "Rate", value: "ledgerDocEntryInfo.Rate", align: "center", sortable: false },
                { text: "Base", value: "ledgerDocEntryInfo.Base", align: "center", sortable: false },
                { text: "GST %", value: "ledgerDocEntryInfo.Tax", align: "center", sortable: false },
                { text: "Dis.", value: "ledgerDocEntryInfo.Discount", align: "center", sortable: false },
                { text: "Total", value: "ledgerDocEntryInfo.Total", align: "center", sortable: false  }
            ]
        }
        if(this.documentType == '2'){
            headerColumn = [
                { text: "Description", value: "ledgerDocEntryInfo.Description", align: "left", sortable: false },
                { text: "Qty", value: "ledgerDocEntryInfo.Quantity", align: "center", sortable: false },
                { text: "Unit", value: "ledgerDocEntryInfo.Unit", align: "center", sortable: false },
                { text: "Rate", value: "ledgerDocEntryInfo.Rate", align: "center", sortable: false },
                { text: "Base", value: "ledgerDocEntryInfo.Base", align: "center", sortable: false }
            ]
        }
        return {
            paymentInfoHeaders: headerColumn
        };
    },
    methods: {},
};
</script>
<template lang="pug">
.po-info
    .row
        .col-md-4.page-header
            h3.contract-heading(v-if="documentType == 1") Purchase Order
            h3.contract-heading(v-if="documentType == 2") Goods Receipt Note
            h4 {{ ledgerDocEntryInfo.CompanyName }}
            p {{ ledgerDocEntryInfo.CompanyAddress }}
        .col-md-4.logo1.text-left.text-center.mt-3
            img(src="@assets/images/logo1.png")
        .col-md-4
            h4(v-if="documentType == 2") GRN Number: {{ ledgerDocEntryInfo.GrnNumber }}
            h4 PO Number: {{ ledgerDocEntryInfo.PONumber }}
            h4 Order Date: {{ ledgerDocEntryInfo.OrderDate | date-format}}
            h4(v-if="documentType == 2") Receipt Date: {{ ledgerDocEntryInfo.ReceiptDate | date-format }}
    .row.address-info.mb-3.ml-2.mr-2
        .col-md-6.address
            h4 Supplier
            p {{ ledgerDocEntryInfo.Vendor }} ({{ ledgerDocEntryInfo.VendorNo }})
            p {{ ledgerDocEntryInfo.VendorAddress }}
            p GST No: {{ ledgerDocEntryInfo.VendorTaxNo }}
            p Contact No: 
        .col-md-6.address
            h4 Place of Supply
            p {{ ledgerDocEntryInfo.PlaceOfSupply }}
            p GSTIN No. : {{ ledgerDocEntryInfo.StoreTaxNo }}
            p Contact No: 
    .payment-view
        .container.p-0
            v-app
                v-data-table.vi-ew-ctt.ledger-table.table_min_height(
                    :headers="paymentInfoHeaders",
                    :items="ledgerDocEntryInfo.LedgerItems",
                    :rows-per-page-items="[10000]",
                    hide-actions
                )
                    template(v-slot:items="{ item }")
                        td.text-left {{ item.RowNo }}.{{ item.Description ? item.Description : '-' }}
                        td.text-center {{ item.Quantity ? item.Quantity : '-' }}
                        td.text-center {{ item.Unit ? item.Unit : '-' }}
                        td.text-center {{ item.Rate }}
                        td.text-center {{ item.Base || '-' }}
                        td.text-center(v-if="documentType != 2") {{ item.Tax || '-' }}
                        td.text-center(v-if="documentType != 2") {{ item.Discount || '-' }}
                        td.text-center(v-if="documentType != 2") {{ item.Total || '-' }}
        .row.p-2
            .col-md-8
            .col-md-4
                .row.p-2
                    .col-md-7.text-right
                        h6 Subtotal: 
                        p Tax
                        p Discount
                        h6 Total Amount
                    .col-md-5.text-right
                        h6 {{ ledgerDocEntryInfo.SubTotal }} 
                        p {{ ledgerDocEntryInfo.Tax }} 
                        p {{ ledgerDocEntryInfo.Discount }} 
                        h6 {{ ledgerDocEntryInfo.TotalAmount }} 

</template>

<style lang="scss">
.payment-view {
    width: 100%;
}
.po-info {
    padding: 60px 20px;
}
.address-info{
    border: 1px solid gray;
}
.address {
    border-right: 1px solid gray;
    padding: 10px 15px;
}
.address > p {
    margin-bottom: 0;
}
</style>
