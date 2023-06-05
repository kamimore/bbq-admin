<script>
const moment = require("moment");
export default {
    name: "ContractDetails",
    props: {
        mstArea: {
            type: Array,
            default: () => [],
        },
        contract: {
            type: Object,
            default: () => {},
        },
        paymentTerms: {
            type: Array,
            default: () => [],
        },
        mstDeliveryTerm: {
            type: Array,
            default: () => [],
        },
        mstAdvancePayment: {
            type: Array,
            default: () => [],
        },
        categoryAdvancePayment: {
            type: Array,
            default: () => [],
        },
        categoryDeliveryTerm: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            date: [],
            contractAreas: [],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() < moment().add(-45, "days");
                },
            },
            loggedInUser: null,
        };
    },
    created() {
        this.loggedInUser = this.$store.getters["account/getUser"];
        if (this.contract) {
            if (this.contract.fromDate) this.date[0] = this.contract.fromDate;
            if (this.contract.toDate) this.date[1] = this.contract.toDate;
        }
        this.contract.areaIds.forEach(area => {
            this.contractAreas.push(area);
        });
    },
    methods: {
        deliveryTermLabel(item) {
            if (item.value == 0) return "NA";
            return `${item.value}-${item.period}`;
        },
        advancePaymentLabel(item) {
            if (item.value == 0) return "NA";
            return `${item.value} %`;
        },
        clearAllLocation() {
            this.contractAreas = [];
            this.contract.areaIds = [];
        },
        changed(val) {
            const ifIncludeAll = this.mstArea.map(a => a.name);
            const contractLocation = this.contractAreas.map(a => a.name);
            if (contractLocation.includes("Select All Locations")) {
                this.mstArea.shift();
                this.contractAreas = this.mstArea;
                this.contract.areaIds = this.mstArea;
            } else {
                if (!ifIncludeAll.includes("Select All Locations")) {
                    this.mstArea.unshift({ name: "Select All Locations", value: "Select All Locations" });
                }
                this.contractAreas = val;
                this.contract.areaIds = this.contractAreas;
            }
        },
    },
    computed: {
        showAdvancePayment() {
            const advancePaymentIds = this.categoryAdvancePayment.map(a => a.subCategoryId);
            return advancePaymentIds.includes(+this.contract.categoryId);
        },
        showDeliveryTerm() {
            const deliveryTermIds = this.categoryDeliveryTerm.map(a => a.subCategoryId);
            return deliveryTermIds.includes(+this.contract.categoryId);
        },

        area() {
            if (this.contract && this.contract.regionIds && this.contract.regionIds.length) {
                const regionIds = this.contract.regionIds.map(r => r.value);
                const areas = this.mstArea
                    .filter(s => regionIds.includes(s.regionId))
                    .map(c => ({ name: c.name, value: c.id }));
                // areas.unshift({ name: "Select All Locations", value: "Select All Locations" });
                return areas;
            } else {
                const regionIds = this.loggedInUser.UserRegions.map(r => r.regionId);
                const areas = this.mstArea
                    .filter(s => regionIds.includes(s.regionId))
                    .map(c => ({ name: c.name, value: c.id }));
                return areas;
            }
        },

        restrictedPaymentTerms() {
            if (this.contract && this.contract.vendor && this.contract.vendor.isMSME) {
                const codes = ["52D", "60D", "67D", "72D", "115D", "180D"];
                return this.paymentTerms.filter(p => !codes.includes(p.code));
            }
            return this.paymentTerms;
        },
        hasVendorLocation() {
            return (
                this.contract.vendor &&
                this.contract.vendor.VendorLocations &&
                this.contract.vendor.VendorLocations.length
            );
        },
    },
    watch: {
        date(val = null) {
            if (val && val.length) {
                this.contract.fromDate = val[0];
                this.contract.toDate = val[1];
            }
        },
    },
};
</script>

<template lang="pug">
.col-md-12.grid-margin.stretch-card.no-mar-pad
    .category-p.top-border-1
        .panel
            .panel-body-p
                .row
                    .col-sm-12
                        .vendor-details-panels
                            h5.font-weight-bold.text-barbique Vendor Details
                            .row
                                .col-sm-6
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Code :
                                        label.col-sm-8.col-form-label.font-weight-300  {{contract.vendor.bbqVendorId || '-'}}
                                .col-sm-6
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Email :
                                        label.col-sm-8.col-form-label.font-weight-300(v-if="hasVendorLocation")  {{ contract.vendor.VendorLocations[0].email ? contract.vendor.VendorLocations[0].email : '-'}}   
                                        label.col-sm-8.col-form-label.font-weight-300(v-else) NA
                                .col-sm-6   
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Contact :
                                        label.col-sm-8.col-form-label.font-weight-300(v-if="hasVendorLocation")  {{contract.vendor.VendorLocations[0].contactPersonName ? contract.vendor.VendorLocations[0].contactPersonName : '-'}}   
                                        label.col-sm-8.col-form-label.font-weight-300(v-else)  NA   
                                .col-sm-6    
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Phone Number :
                                        label.col-sm-8.col-form-label.font-weight-300  {{hasVendorLocation ? contract.vendor.VendorLocations[0].phoneNumber : '-'}} 
                                .col-sm-6   
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  GSTN :
                                        label.col-sm-8.col-form-label.font-weight-300(v-if="hasVendorLocation")  {{contract.vendor.VendorLocations[0].gstNumber ? contract.vendor.VendorLocations[0].gstNumber : '-'}}   
                                .col-sm-6
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Name :
                                        label.col-sm-8.col-form-label.font-weight-300  {{contract.vendor.companyName}}  
                                .col-sm-6    
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  Vendor Type :
                                        label.col-sm-8.col-form-label.font-weight-300  {{contract.vendor.type || '-'}} 
                                .col-sm-6    
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  No of Contracts :
                                        label.col-sm-8.col-form-label.font-weight-300  {{contract.vendor.numberOfContracts || 0}}  
                                .col-sm-6    
                                    .row.fist
                                        label.col-sm-4.col-form-label.font-weight-300  PAN :
                                        label.col-sm-8.col-form-label.font-weight-300(v-if="hasVendorLocation")  {{contract.vendor.VendorLocations[0].panNumber ? contract.vendor.VendorLocations[0].panNumber : '-'}}   
                                        label.col-sm-8.col-form-label.font-weight-300(v-else)  NA
                                .col-sm-6   
                                    .row.fist(v-if="contract.contractType === 'one_time'")
                                        label.col-sm-4.col-form-label.font-weight-300  Cash Limit :
                                        label.col-sm-8.col-form-label.font-weight-300  {{contract.vendor.cashLimit || '-'}}   
                    .col-sm-12.mt-3
                        .vendor-details-panels.contract-details-panel
                            h5.font-weight-bold.text-barbique Contract Details
                            .row
                                .col-sm-6
                                    .form-group.row
                                        label.col-sm-4.col-form-label.font-weight-300  Payment Terms *
                                        .col-sm-8
                                            //- .double-date-chooser.static
                                            form-field-input(
                                                v-model="contract.paymentTermId",
                                                attribute="Payment Term",
                                                input-type="search-select",
                                                :items="restrictedPaymentTerms",
                                                label="code",
                                                placeholder="Select Payment Term"
                                                trackBy='id',
                                                :required="true",
                                                :useCustomLabel="false"
                                            )
                                .col-sm-6
                                    .form-group.row
                                        label.col-sm-4.col-form-label.font-weight-300  Contract Date *
                                        .col-sm-8
                                            .double-date-chooser.static
                                                form-field-input(
                                                    v-model="date",
                                                    attribute="Date",
                                                    input-type="daterange",
                                                    :required="true",
                                                    :picker-options="pickerOptions"
                                                )
                                .col-sm-6(v-if="showDeliveryTerm")
                                    .form-group.row
                                        label.col-sm-4.col-form-label.font-weight-300  Delivery Term *
                                        .col-sm-8
                                            .double-date-chooser.static
                                                form-field-input(
                                                    v-model="contract.deliveryTerm",
                                                    attribute="Delivery Term",
                                                    input-type="search-select",
                                                    :items="mstDeliveryTerm",
                                                    :custom-label="deliveryTermLabel",
                                                    placeholder="Select Delivery Term"
                                                    trackBy='id',
                                                    :required="true",
                                                )
                                .col-sm-6(v-if="showAdvancePayment")
                                    .form-group.row
                                        label.col-sm-4.col-form-label.font-weight-300  Advance Payment *
                                        .col-sm-8
                                            .double-date-chooser.static
                                                form-field-input(
                                                    v-model="contract.advancePayment",
                                                    attribute="Advacne Payment",
                                                    input-type="search-select",
                                                    :items="mstAdvancePayment",
                                                    :custom-label="advancePaymentLabel",
                                                    placeholder="Select Advance Payment"
                                                    trackBy='id',
                                                    :required="true",
                                                )
                                
                            .row
                                label.col-sm-2.col-form-label.font-weight-300 Location *
                                .col-sm-10
                                    form-field-input(
                                        v-model="contractAreas",
                                        attribute="Area",
                                        input-type="search-multiple-select",
                                        :items="area",
                                        label='name',
                                        openDirection="top"
                                        trackBy='value',
                                        :required="true",
                                        placeholder="Search Area",
                                        :disabled="false",
                                        @input="changed",
                                        @clearAll="clearAllLocation",
                                        :showClearAll="true"
                                    )       
</template>

<style lang="scss" scoped >
// .contract-details-panel label.col-form-label {
//     padding: 10px 0;
// }
</style>