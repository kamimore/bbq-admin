<script>
import UploadedFilesList from "../components/uploaded-files-list";

export default {
    name: "VendorDetailSection",
    components: {
        UploadedFilesList,
    },
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        mstStructures: {
            type: Array,
            default: () => [],
        },
        mstPaymentTerms: {
            type: Array,
            default: () => [],
        },
        mstVendorPostingGroups: {
            type: Array,
            default: () => [],
        },
        mstProductGroups: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
    },
    computed: {
        vendorPostingGroupList() {
            return this.mstVendorPostingGroups.map(v => ({ name: v.code, value: v.id }));
        },
        structureList() {
            return this.mstStructures.map(v => ({ name: v.code, value: v.id }));
        },
        paymentTermList() {
            return this.mstPaymentTerms.map(v => ({ name: v.name, value: v.id }));
        },
        productGroupList() {
            return this.mstProductGroups.map(v => ({ name: v.name, value: v.id }));
        },
        applicationMethods() {
            return this.$utility.getApplicationMethods();
        },
        generalBusPostingGroups() {
            return this.$utility.getGeneralBusPostingGroups();
        },
        vatBusPostingGroups() {
            return this.$utility.getVatBusPostingGroups();
        },
        isDisabled() {
            return this.mode === "readOnly";
        },
    },
};
</script>

<template lang="pug">
    .card-body.vendor-details-pg
        .row
            .col-md-12
                form.forms-sample
                    .row
                        .col-4.mb-2
                            form-field(
                                v-model="vendor.vendorPostingGroupId",
                                attribute="Vendor Posting Group",
                                input-type="select-option",
                                :items="vendorPostingGroupList",
                                :required="true",
                                placeholder="Search vendor posting group",
                                :disabled="isDisabled"
                            )
                        .col-4.mb-2
                            form-field(
                                v-model="vendor.structureId",
                                attribute="Structure",
                                input-type="select-option",
                                :items="structureList",
                                :required="true",
                                placeholder="Search structure",
                                :disabled="isDisabled"
                            )
                        //- .col-4.mb-2
                        //-     form-field(
                        //-         v-model="vendor.productGroupId",
                        //-         attribute="Product Group",
                        //-         input-type="select-option",
                        //-         :items="productGroupList",
                        //-         :required="true",
                        //-         placeholder="Search product group",
                        //-         :disabled="isDisabled"
                        //-     )
                        .col-4.mb-2
                            form-field(
                                v-model="vendor.priority",
                                attribute="Priority",
                                input-type="text-number",
                                :required="true",
                                :disabled="isDisabled",
                                :maxLength="50",
                            )
                        .col-4.mb-2
                            form-field(
                                v-model="vendor.applicationMethod",
                                attribute="Application Method",
                                input-type="select-option",
                                :items="applicationMethods",
                                :required="true",
                                placeholder="Search application method",
                                :disabled="isDisabled"
                            )
                        .col-4.mb-2
                            form-field(
                                v-model="vendor.vatRegisterationNumber",
                                attribute="VAT registration number",
                                v-b-tooltip.hover, 
                                title="VAT registration number should be 15 charater long",
                                input-type="text-number",
                                :required="false",
                                :disabled="isDisabled",
                                :maxLength="15"
                            )
                        .col-4.gbpg
                            form-field(
                                v-model="vendor.generalBusPostingGroup",
                                attribute="General Bus Posting Group",
                                input-type="select-option",
                                :items="generalBusPostingGroups",
                                :required="true",
                                placeholder="Search general bus posting group",
                                :disabled="isDisabled"
                            )
                        .col-4.gbpg
                            form-field(
                                v-model="vendor.vatBusPostingGroup",
                                attribute="VAT bus posting group",
                                input-type="select-option",
                                :items="vatBusPostingGroups",
                                :required="false",
                                placeholder="Search vat bus posting group",
                                :disabled="isDisabled"
                            )
                        .col-4.gbpg(v-if="vendor.type === 'internal'")
                            form-field(
                                v-model="vendor.cashLimit",
                                attribute="Cash limit",
                                input-type="text-number",
                                :required="false",
                                :disabled="isDisabled",
                                :maxLength="8"
                            )
                    //.row
                        .col-12
                            form-field(
                                v-model="vendor.comment",
                                attribute="Comment",
                                input-type="textarea",
                                :required="true",
                                placeholder="Enter your comment",
                                :disabled="isDisabled"
                            )
</template>
<style>
input.form-control {
    width: 100%;
}
form.forms-sample .gbpg .form-group {
    margin-bottom: 0;
}
</style>