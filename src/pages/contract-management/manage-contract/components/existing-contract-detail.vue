<script>
export default {
    name: "ExistingContractDetails",
    props: {
        contractItems: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            headers: [
                { text: "Existing Contract Date", value: "item", sortable: false },
                { text: "Item Code", value: "item", sortable: false },
                { text: "Item Name", value: "item", sortable: false },
                { text: "Price", value: "item", sortable: false },
                { text: "Unit Detail", value: "item", sortable: false },
            ]
        }
    }
};
</script>
<template lang="pug">
div
    h1.head-cust.text-center Overlapping Items 
    div(role='tablist', v-if="contractItems && contractItems.length")
        .mb-1(v-for="(contract, i) in contractItems", :key="contract.id",no-body='')
            b-card-header.p-0(header-tag='header', role='tab1')
                b-button.text-left(block='', href='#', variant='info',  v-b-toggle="contract.id")
                    span.sr-n {{i + 1}}
                    span.font-weight-bold-1 Contract Code :  
                    | {{ contract.id }} 
                    span.font-weight-bold-1 | Contract Date :  
                    | From {{contract.fromDate | date-format}} to {{contract.toDate | date-format}}
                b-collapse(:id="contract.id", :visible="false", accordion="my-accordion")
                    b-card-body.existing-contract-details
                        .category-p
                            .vendor-details-panels
                                v-data-table(:headers='headers', :items='contract.ContractItems', :rows-per-page-items="[5]")
                                    template(v-slot:items='{ item, index }')
                                        td.text-left  From {{contract.fromDate | date-format}} To {{contract.toDate | date-format}}
                                        td.text-left {{ item.MstItem ? item.MstItem.code : '-' }}
                                        td.text-left {{ item.MstItem ? item.MstItem.name : '-' }}
                                        td.text-left {{ item.newPrice || '-' }}
                                        td.text-left {{ item.MstItem ? item.MstItem.unit : '-' }}
        .form-group.text-center.pt-4
            button.btn.btn-primary.mr-1.background-barbique(type='button', @click="$emit('overlapHandler', 'modify')") Modify
            button.btn.btn-primary.background-barbique(type='button', @click="$emit('overlapHandler', 'continue')") Continue
</template>
