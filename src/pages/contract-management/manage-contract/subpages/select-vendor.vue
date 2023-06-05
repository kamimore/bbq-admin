<script>
import { debounce } from "lodash";
import ContractListAccordion from "../components/contract-list-accordion";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "SelectVendor",
    mixins: [DatatableSettingMixin],
    components: {
        ContractListAccordion,
    },
    props: {
        contract: {
            type: Object,
            default: () => {},
        },
        mstArea: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            dialog: false,
            mode: "add",
            pagination: {},
            search: '',
            totalItems: 0,
            headers: [
                { text: "#", align: "left", sortable: false },
                { text: "Vendor Code", value: "bbqVendorId" , sortable: false},
                { text: "Vendor Name", align: "left", value: "companyName" , sortable: false},
                { text: "Current Contracts", value: "numberOfContracts", align: "center" , sortable: false},
                { text: "Actions", value: "", sortable: false, align: "center" },
            ],
            items: [],
            selectedVendor: {
                Contracts: [],
            },
            selectedVendorId: null,
        };
    },
    created() {
        if (this.contract && this.contract.vendor) this.selectedVendorId = this.contract.vendor.id;
    },
    methods: {
        async getVendor(paginationAndSort = null) {
            // this.$Progress.start();
            this.isLoading = true;

            const data = {
                areaIds: this.contract.areaIds.map(r => r.value),
                superCategoryId: +this.contract.superCategoryId,
                limit: 5,
                search: this.search,
            };

            if (paginationAndSort) {
                Object.assign(data, {
                    offset: (paginationAndSort.page - 1) * 5,
                });
            }
            
            const { rows, count } = await this.$http.rawPost("vendor-list", data);

            this.items = rows;
            this.totalItems = count;

            this.isLoading = false;
            // this.$Progress.finish();
        },
        openContractModal(vendor) {
            this.selectedVendor = vendor;
            this.contract.vendor = vendor;
            this.$refs.view_vendor.open();
        },
        renewContract(data) {
            this.$emit("contractDetail", data);
            this.$refs.view_vendor.close();
        },
        selectVendor(vendor) {
            this.selectedVendor = vendor;
            this.contract.vendor = vendor;
            this.selectedVendorId = vendor.id;
        },
        debounceSearch: debounce(function () {
            this.getVendor();
        }, 600),
    },
    watch: {
        pagination(val) {
            this.getVendor(val);
        },
    },
};
</script>

<template lang="pug">
.col-md-12.grid-margin.stretch-card.no-mar-pad.contract-table
    .category-p.top-border-1.select-vendor-page
        .row
            v-toolbar.cartegory-li-st.pb-2(flat, color='white')
                v-text-field(
                    v-model='search', 
                    append-icon='search', 
                    label='Search', 
                    single-line, 
                    hide-details, 
                    clearable = true,  
                    placeholder='Vendor Name / Vendor Code',  
                    @input="debounceSearch()"
                )
                v-spacer
        .categ-p
            .custom-table-scroll
                v-data-table(
                    :headers='headers', 
                    :items='items',
                    :pagination.sync="pagination", 
                    :rows-per-page-items="[5]",
                    :total-items="totalItems", 
                    :loading="isLoading", 
                    :no-data-text="loaderText",
                )
                    template(v-slot:items='{ item }')
                        tr.cursor-pointer(@click="selectVendor(item)")
                            td.text-left
                                v-radio-group(v-model="selectedVendorId", name="rowSelector")
                                    v-radio(:value ="item .id")
                            td {{ item.bbqVendorId || '-'}}
                            td {{ item.companyName || '-'}}
                            td.text-center {{ item.numberOfContracts || 0}}
                            td.text-center
                                .far.fa-eye-slash.cursor-pointer(v-if="!item.numberOfContracts",aria-hidden="true")
                                .far.fa-eye.cursor-pointer(v-else, aria-hidden="true", @click="openContractModal(item)")
            sweet-modal.bbq-vendor-select(
                ref="view_vendor",
                width="60%",
                overlay-theme="dark",
            )
                contract-list-accordion(
                    :vendor="selectedVendor",
                    :allAreas="mstArea",
                    @renewContract="renewContract"
            )
</template>

<style lang="scss">
.custom-table-scroll {
    max-height: 50vh;
    overflow: auto;
}
</style>