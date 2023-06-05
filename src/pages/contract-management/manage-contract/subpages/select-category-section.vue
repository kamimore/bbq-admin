<script>
import { mapGetters } from "vuex";
import { debounce } from "lodash";
import ContractListAccordion from "../components/contract-list-accordion";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "SelectCategorySection",
    mixins: [DatatableSettingMixin],
    components: {
        ContractListAccordion,
    },
    props: {
        mstSuperCategory: {
            type: Array,
            default: () => [],
        },
        mstArea: {
            type: Array,
            default: () => [],
        },
        mstRegion: {
            type: Array,
            default: () => [],
        },
        mstCategory: {
            type: Array,
            default: () => [],
        },
        contract: {
            type: Object,
            default: () => {},
        },
        contractTypes: {
            type: Array,
            default: () => [],
        },
        contractServices: {
            type: Array,
            default: () => [],
        },
        loggedInUser: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            selectedSuperCategory: {},
            pagination: {},
            headers: [
                { text: "Vendor Code", value: "bbqVendorId" , sortable: false},
                { text: "Vendor Name", align: "left", value: "companyName" , sortable: false},
                { text: "Current Contracts", value: "numberOfContracts", align: "center" , sortable: false},
                { text: "Actions", value: "actions", sortable: false, align: "center" },
            ],
            search: "",
            items: [],
            selectedVendor: {
                Contracts: [],
            },
            tabIndex: 0,
            totalItems: null,
            contractAreas: [],
            allAreas: [],
        };
    },
    created() {
        // this.getContracts();
        this.contract.areaIds.forEach(area => {
            this.contractAreas.push(area);
        });
        Object.assign(this.allAreas, {}, this.mstArea);
    },
    methods: {
        async getContracts(paginationAndSort) {
            // this.$Progress.start();
            this.isLoading = true;

            const data = {
                limit: 5,
                search: this.search,
            };

            if (paginationAndSort) {
                Object.assign(data, {
                    offset: (paginationAndSort.page - 1) * 5,
                });
            }

            const { rows, count } = await this.$http.rawPost("vendor-list", data);

            this.totalItems = count;

            this.items = rows;
                // .filter(v => v.Contracts && v.Contracts.length)
                // .map(v => ({ ...v, ...{ numberOfContracts: v.Contracts && v.Contracts.length } }));

            this.isLoading = false;
            // this.$Progress.finish();
        },
        changed(val) {
            const ifIncludeAll = this.allAreas.map(a => a.name);
            const contractLocation = this.contractAreas.map(a => a.name);

            if (contractLocation.includes("Select All Locations")) {
                const regionIds = this.contract.regionIds.map(r => r.value);
                this.allAreas.shift();

                const areas = this.mstArea
                    .filter(s => regionIds.includes(s.regionId))
                    .map(c => ({ name: c.name, value: c.id }));

                this.contractAreas = areas;
                this.contract.areaIds = areas;
            } else {
                if (!ifIncludeAll.includes("Select All Locations")) {
                    this.allAreas.unshift({ name: "Select All Locations", value: "Select All Locations" });
                }
                this.contractAreas = val;
                this.contract.areaIds = this.contractAreas;
            }
        },
        clearAllLocation() {
            this.contractAreas = [];
            this.contract.areaIds = [];
        },
        openContractModal(vendorDetail) {
            this.selectedVendor = vendorDetail;
            this.$refs.view_vendor.open();
        },
        switchTab(data) {
            this.tabIndex = 0;
            this.$emit("contractDetail", data);
            this.$refs.view_vendor.close();
        },
        selectType(val) {
            // if(val === 'one_time'){
            //     this.contract.contractService = "service";
            // }
            // if (val === "recurring") this.contract.contractService = "supply";
            // else this.contract.contractService = "service";
            // this.setOptions();
        },
        selectService() {
            this.setOptions();
        },
        setOptions() {
            if (this.contract.contractService === "service") {
                if (this.mstSuperCategory && this.mstSuperCategory.length) {
                    const superCatObj = this.mstSuperCategory.find(s => s.name === "NonFood");
                    this.contract.superCategoryId = superCatObj.id;
                }

                // if (this.mstCategory && this.mstCategory.length) {
                //     const catObj = this.mstCategory.find(s => s.name === "Service");
                //     this.contract.categoryId = catObj.id;
                // }
            } else {
                this.contract.superCategoryId = null;
                this.contract.categoryId = null;
            }
        },
        selectCategory(val) {
            this.contract.MstCategory = this.category.find(c => c.value == val);
            this.$forceUpdate();
        },
        selectSuperCategory() {
            this.contract.contractItems = [];
        },
        debounceSearch: debounce(function() {
            this.getContracts();
        }, 600),
        clearategoryList(val) {
            this.contract.categoryId = []
        }
    },
    computed: {
        ...mapGetters("account", ["isSourcingTeam", "isCoorporateSourcingTeam"]),
        superCategory() {
            return this.mstSuperCategory.map(c => ({ name: c.name, value: c.id }));
        },
        area() {
            const regionIds = this.contract.regionIds.map(r => r.value);

            const areas = this.mstArea
                .filter(s => regionIds.includes(s.regionId))
                .map(c => ({ name: c.name, value: c.id }));

            areas.unshift({ name: "Select All Locations", value: "Select All Locations" });

            return (this.allAreas = areas);
        },
        region() {
            if (this.loggedInUser && this.loggedInUser.UserRegions && this.loggedInUser.UserRegions.length) {
                return this.loggedInUser.UserRegions.filter(r => r.MstRegion).map(a => ({
                    value: a.regionId,
                    name: a.MstRegion.name,
                }));
            }
            return [];
        },
        category() {
            return this.mstCategory
                .filter(s => s.superCategoryId == this.contract.superCategoryId)
                .map(c => ({ name: c.name, value: c.id }));
        },
        enableDisableSuperCategory() {
            if (this.contract.contractService === "service") return true;
            else return false;
        },
        enableDisableCategory() {
            if (this.contract.contractService === "service" || !this.contract.superCategoryId) return true;
            else return false;
        },
    },
    watch: {
        "contract.areaIds"(val) {
            if (val && val.length && !this.contractAreas.length) {
                this.contract.areaIds.forEach(area => {
                    this.contractAreas.push(area);
                });
            }
        },
        "pagination"(val) {
            this.getContracts(val);
        },
    },
};
</script>

<template lang="pug">
.col-md-12.grid-margin.stretch-card.no-mar-padd.select-cat-gory
    b-tabs(pills, v-model="tabIndex")
        b-tab.header-1(
            title="New Contract",
            @click="$emit('currentTab', true)"
        )
            .col-md-12.grid-margin.stretch-card.no-mar-padd
                .tab-box
                    .tab-inside-box
                        //- h4.card-title.font-weight-bold Contract Type
                        .row
                            .col-sm-6
                                .form-group.row.bbq-manage-contract
                                    //- label.col-sm-4.col-form-label Contract Type *
                                    .col-sm-12
                                        label.col-form-label Select Contract Type *
                                        form-field-input(
                                            v-model="contract.contractType",
                                            attribute="Contract Type",
                                            input-type="select-option",
                                            :items="contractTypes",
                                            :required="true",
                                            placeholder="Search Contract Service",
                                            @input="selectType($event)"
                                        )
                            .col-sm-6
                                .form-group.row.bbq-manage-contract
                                    //- label.col-sm-4.col-form-label Contract Service *
                                    .col-sm-12
                                        label.col-form-label Select Contract Service *
                                        form-field-input(
                                            v-model="contract.contractService",
                                            attribute="Contract Service",
                                            input-type="select-option",
                                            :items="contractServices",
                                            :required="true",
                                            placeholder="Search Contract Service",
                                            @input="selectService($event)"
                                            :disabled="false"
                                        )
                        //- .col-md-12.grid-margin.stretch-card.no-mar-padd
                        //- .category-p
                    .tab-inside-box
                        //- h4.card-title.font-weight-bold Category(s)
                        .row
                            .col-sm-6
                                .form-group.row.bbq-manage-contract
                                    //- label.col-sm-4.col-form-label Super Category *
                                    .col-sm-12
                                        label.col-form-label Select Super Category *
                                        form-field-input(
                                            v-model="contract.superCategoryId",
                                            attribute="Super Category",
                                            input-type="select-option",
                                            :items="superCategory",
                                            :required="true",
                                            placeholder="Search Super Category",
                                            :disabled="contract.contractService === 'service'"
                                            @input="clearategoryList"
                                        )
                            .col-sm-6
                                .form-group.row.bbq-manage-contract
                                    //- label.col-sm-4.col-form-label Category *
                                    .col-sm-12
                                        label.col-form-label Select Category *
                                        form-field-input(
                                            v-model="contract.categoryId",
                                            attribute="Category",
                                            input-type="search-multiple-select",
                                            :items="category",
                                            :required="true",
                                            label="name",
                                            trackBy="value"
                                            placeholder="Search Category",
                                            :disabled="!contract.superCategoryId",
                                            @input="selectCategory($event)",
                                            @clearAll="contract.categoryId = []"
                                            :showClearAll="true"
                                        )
                                        .tab-inside-box
                    .tab-inside-box
                        //- h4.card-title.font-weight-bold Regions                    
                        .row
                            .col-md-6 
                                .form-group.row.bbq-manage-contract   
                                    //- label.col-sm-4.col-form-label Region *
                                    .col-sm-12
                                        label.col-form-label Select Region *
                                        form-field-input(
                                            v-model="contract.regionIds",
                                            attribute="Region",
                                            input-type="search-multiple-select",
                                            :items="region",
                                            label='name',
                                            trackBy='value',
                                            :required="true",
                                            placeholder="Search Regions",
                                            :disabled="false",
                                            @clearAll="contract.regionIds = []"
                                        )
                            .col-md-6
                                .form-group.row.bbq-manage-contract
                                    //- label.col-sm-4.col-form-label Location *
                                    .col-sm-12
                                        label.col-form-label Select Location *
                                        form-field-input.fixed-height-vue(
                                            v-model="contractAreas",
                                            attribute="Area",
                                            input-type="search-multiple-select",
                                            :items="area",
                                            label='name',
                                            trackBy='value',
                                            :required="true",
                                            placeholder="Search Location",
                                            :disabled="false",
                                            @input="changed",
                                            @clearAll="clearAllLocation",
                                            :showClearAll="true"
                                        )
        b-tab.header-1(
            title="Renew Contract",
            @click="$emit('currentTab', false)"
        )
            .grid-margin.stretch-card.no-mar-pad.contract-table
                .tab-box
                    v-toolbar.cartegory-li-st.pb-3(flat, color='white')
                        v-text-field(
                            v-model='search', 
                            append-icon='search', 
                            label='Search', 
                            single-line, 
                            hide-details, 
                            clearable = true, 
                            placeholder='Vendor Name / Code', 
                            @input="debounceSearch()"
                        )
                        v-spacer
                    v-data-table(
                        :headers='headers', 
                        :items='items',
                        :pagination.sync="pagination", 
                        :rows-per-page-items="[5]",
                        :total-items="totalItems",
                        :loading="isLoading", 
                        :no-data-text="loaderText" 
                    )
                        template(v-slot:items='{ item }')
                            td {{ item.bbqVendorId || '-'}}
                            td {{ item.companyName}}
                            td.text-center {{ item.numberOfContracts || 0}}
                            td.text-center
                                .far.fa-eye.cursor-pointer(aria-hidden="true", @click="openContractModal(item)")
        sweet-modal.select-ven(
            ref="view_vendor",
            width="65%",
            overlay-theme="dark",
        )
            contract-list-accordion(
                :vendor="selectedVendor",
                :contracts="selectedVendor.Contracts",
                :allAreas="mstArea",
                @renewContract="switchTab",
            )
</template>

<style lang="scss">
.v1 {
    width: 25%;
}
.v1 .v-list__tile {
    font-size: 14px;
    font-weight: 400;
    height: 40px;
}
.v1 .v-input {
    max-width: 100% !important;
}
.v1 .v-text-field {
    padding-top: 0;
    margin-top: -11px;
}
.v1 .v-select__selection.v-select__selection--comma {
    font-size: 14px;
    font-weight: 500;
    color: #4c4743;
}
.v1 .v-list__tile--link:hover {
    background: #dadada !important;
}
.bbq-manage-contract {
    margin-bottom: 0;
}
</style>
