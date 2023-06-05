<script>
import ViewContractDetail from "./view-contract-detail";

export default {
    name: "ContractListAccordion",
    components: {
        ViewContractDetail,
    },
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        allAreas: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            contracts: [],
            vendorData: null,
            isFetching: true,
            totalContracts: 0,
            limit: 10,
            currentPage: 0,
        };
    },
    methods: {
        renewContract(contract) {
            this.$emit("renewContract", { contract, vendor: this.vendor });
        },
        async getVendor() {
            const query = {
                where: {
                    id: this.vendor.id,
                },
                attributes: ["id", "bbqVendorId", "userId", "cashLimit", "companyName", "status", "type"],
                include: [
                    {
                        model: "VendorLocation",
                        attributes: ["id", "email", "contactPersonName", "phoneNumber", "gstNumber", "panNumber"],
                        where: {
                            isDeleted: false,
                        },
                    },
                    {
                        model: "User",
                        attributes: ["id"],
                        include: [
                            {
                                model: "UserArea",
                                attributes: ["id", "areaId"],
                            },
                            {
                                model: "UserSuperCategory",
                                attributes: ["id", "superCategoryId"],
                            },
                        ],
                    },
                ],
            };
            const result = await this.$http.get("vendor", query);

            this.vendorData = result && result.length ? result[0] : null;
        },
        async getContracts() {
            this.contracts = [];
            this.isFetching = true;

            const query = {
                where: {
                    status: "approved",
                    vendorId: this.vendor.id,
                },
                distinct: true,
                limit: this.limit || 10,
                offset: (this.currentPage - 1) * this.limit,
                include: [
                    {
                        model: "ContractArea",
                        include: [
                            {
                                model: "MstArea",
                                include: [
                                    {
                                        model: "MstRegion",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: "ContractItem",
                        include: [
                            {
                                model: "MstItem",
                            },
                        ],
                    },
                    {
                        model: "ContractCategory",
                        include: [
                            {
                                model: "MstCategory",
                                include: [
                                    {
                                        model: "MstSuperCategory",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            const { data, count } = await this.$http.get("contract/find-and-count", query);

            this.contracts = data;
            this.totalContracts = count;
            this.isFetching = false;
        },
        pageChange(val) {
            console.log("val", val);
            this.currentPage = val;
            this.getContracts();
        },
        contractSuperCategory(contract) {
            if (contract.ContractCategories && contract.ContractCategories.length) {
                return contract.ContractCategories[0].MstCategory;
            }
        },
    },
    watch: {
        "vendor.id"() {
            this.currentPage = 1;
            this.getVendor();
            this.getContracts();
        },
    },
};
</script>

<template lang="pug">
div.vendor-contract-list
    h1.head-cust.text-center Contracts
    .vendor-contract-list-scroll-v
        div(role='tablist', v-if="contracts && contracts.length")
            .mb-1(v-for="(contract, i) in contracts", :key="contract.id",no-body='')
                b-card-header.p-0(header-tag='header', role='tab1')
                    b-button.text-left(block='', href='#', variant='info', v-b-toggle="contract.id.toString()")
                        //- span.sr-n {{i + 1}}
                        span.sr-n {{ ((currentPage- 1) * limit) + i + 1}}
                        span.font-weight-bold-400 Contract Code :  
                        | {{ contract.id }} 
                        span.font-weight-bold-400 
                        span.separater | 
                        span Vendor Code :  
                        | {{vendor.bbqVendorId || '-'}} 
                        span.font-weight-bold-400 
                        span.separater | 
                        span Contract Date :  
                        | From {{contract.fromDate | date-format}} to {{contract.toDate | date-format}}
                    b-collapse(:id="contract.id.toString()", :visible="false", accordion="my-accordion")
                        b-card-body
                            view-contract-detail(
                                title="",
                                :vendor="vendorData",
                                :contract="contract",
                                :contractItems="contract.ContractItems",
                                :supercategory="contractSuperCategory(contract)",
                                :areas="contract.ContractAreas.map(a => a.MstArea ? a.MstArea.name : null).join(',')",
                                :allAreas="allAreas",
                            )
                                button.btn.btn-primary.mr-1.background-barbique(type='button', @click="renewContract(contract)") Renew Contract
        div.text-center(v-else)
            b-spinner(v-if="isFetching", label="Loading.Please wait...") 
            span.font-weight-bold.text-center(v-else) {{ 'No contract found' }}
    div.mt-1(v-if="contracts && contracts.length")
        el-pagination.text-center(
            :page-size="limit"
            layout="prev, pager, next"
            :total="totalContracts",
            :current-page.sync="currentPage"
            @current-change="pageChange($event)"
        )
</template>

<style lang="scss"></style>
