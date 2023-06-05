<script>
// const { uniqBy } = require("lodash");
import { mapGetters } from "vuex";

export default {
    name: "VendorCategoryApprovalSection",
    props: {
        items: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            headers: [
                { text: "Category", value: "MstSuperCategory.name" },
                { text: "User", value: "VendorApprovalAssignedTo.fullName" },
                { text: "Role", value: "VendorApprovalAssignedTo.sourcingType" },
                { text: "Assigned By", value: "VendorApprovalAssignedBy.fullName" },
                { text: "Status", value: "status" },
                { text: "Review Date", value: "reviewedDate" },
                { text: "Comment", value: "comment" },
            ],
            vendorHeaders: [
                { text: "Category", value: "MstSuperCategory.name", sortable: false },
                { text: "Status", value: "status", sortable: false },
                { text: "Created Date", value: "created_at", sortable: false },
                { text: "Review Date", value: "reviewedDate", sortable: false },
            ]
        };
    },
    methods: {},
    computed: {
        ...mapGetters("account", ["isVendor"]),
        sortedItems() {
            // if (this.isVendor) {
            //     this.items = uniqBy(this.items, v => [v.superCategoryId, v.status].join());
            // }
            return this.$lodash.orderBy(this.items, ["created_at"], ["desc"]);
        },
    },
};
</script>

<template lang="pug">
.category-approval-container-vendor
    .card-body
        v-app
            //- v-data-table(
            //-     v-if="this.isVendor",
            //-     :headers='vendorHeaders', 
            //-     :items="sortedItems", 
            //-     :rows-per-page-items="[10]",
            //-     :disable-initial-sort="true"
            //- )
            //-     template(v-slot:items='{ item }')
            //-         td {{ item.MstSuperCategory ? item.MstSuperCategory.name  : 'MDM'}}
            //-         td 
            //-             status-color(:type="item.status", :text="item.status")
            //-         td {{ item.created_at | date-format}}
            //-         td {{ item.reviewedDate | date-format}}
            v-data-table(
                :headers='headers', 
                :items="sortedItems", 
                :rows-per-page-items="[10]",
                :disable-initial-sort="true"
            )
                template(v-slot:items='{ item }')
                    td {{ item.MstSuperCategory ? item.MstSuperCategory.name  : '-'}}
                    td {{ item.VendorApprovalAssignedTo ? item.VendorApprovalAssignedTo.fullName : '-' }}
                    td(v-if="item.VendorApprovalAssignedTo &&  item.VendorApprovalAssignedTo.sourcingType") {{ item.VendorApprovalAssignedTo.sourcingType | humanize}}
                    td(v-else) NA
                    td {{ item.VendorApprovalAssignedBy ? item.VendorApprovalAssignedBy.fullName : '-'}}
                    td
                        status-color(:type="item.status", :text="item.status")
                    td {{ item.reviewedDate | date-format('MMM DD, YYYY hh:mm A')}}
                    //- td {{ item.comment || '-'}}
                    td 
                        truncate-tooltip(:content="item.comment", :limit="40")
</template>

<style lang="scss">
</style>


