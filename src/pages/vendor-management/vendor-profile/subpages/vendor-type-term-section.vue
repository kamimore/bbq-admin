<script>
import { mapGetters } from "vuex";

export default {
    name: "VendorTypeTermsSection",
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        vendorData: {
            type: Object,
            default: () => {},
        },
        categories: {
            type: Array,
            default: () => [],
        },
        mstPaymentTerms: {
            type: Array,
            default: () => [],
        },
        mstVendorTypes: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor"]),
        isDisabled() {
            return this.mode === "readOnly";
        },
        paymentTermList() {
            if (this.mode === "readOnly") {
                return this.mstPaymentTerms.map(v => ({ name: v.code, value: v.id }));
            }
            return this.mstPaymentTerms.filter(p => p.isActive).map(v => ({ name: v.code, value: v.id }));
        },
        vendorTypeList() {
            return this.mstVendorTypes.map(v => ({ name: v.name, value: v.id }));
        },
        isVendorTypeDisabled() {
            if (this.isDisabled) return true;

            if (this.isVendor) {
                const nonFood = this.categories.find(c => c.name && c.name.toLowerCase() === "nonfood");
                const isNonFoodSelected = this.vendorData.vendorSuperCategories.includes(nonFood.id);

                if (!isNonFoodSelected) return true;
            }

            return false;
        },
    },
};
</script>

<template lang="pug">
.col-md-12.grid-margin.stretch-card.no-padding.vendor-company-details
    .no-borders
        .card-body
            .row    
                .col-sm-12
                    .row
                        .col-md-4(v-if="!isVendor")
                            form-field(
                                v-model="vendor.paymentTermId",
                                attribute="Payment Term",
                                input-type="select-option",
                                :items="paymentTermList",
                                :required="true",
                                placeholder="Search payment term",
                                :disabled="isDisabled",
                                :useCustomLabel="false"
                            )
                        .col-md-4
                            form-field(
                                v-model="vendor.vendorTypeId",
                                attribute="Vendor Type",
                                input-type="select-option",
                                :items="vendorTypeList",
                                :required="true",
                                placeholder="Search vendor type",
                                :disabled="isVendorTypeDisabled"
                            )
</template>
