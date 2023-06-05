<script>
import { mapGetters } from "vuex";
import { debounce } from "lodash";
import { stringify } from "qs";
import moment from "moment";
import DLayout from "@layouts/default-layout";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "ContractHistory",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
    },
    data() {
        return {
            search: null,
            status: null,
            items: [],
            headers: [
                { text: "Code", align: "center", value: "id", sortable: true },
                { text: "Vendor Name", value: "Vendor.companyName", sortable: false },
                { text: "Category", align: "left", value: "MstCategory.name", sortable: false, width: "15%" },
                { text: "Created By", value: "User.fullName", sortable: false },
                { text: "Date", align: "left", value: "", sortable: false, width: "12%" },
                { text: "Updated At", align: "left", value: "" },
                { text: "Status", align: "left", value: "status", sortable: false },
                { text: "Overide Status", align: "left", value: "overrideStatus", sortable: false, width: "15%" },
                { text: "View", value: "actions", sortable: false, align: "center", width: "8%" },
            ],
            options: [
                { value: null, name: "All" },
                { value: "draft", name: "Draft" },
                { value: "sent_to_vendor", name: "Sent to Vendor" },
                { value: "rejected_by_vendor", name: "Rejected by Vendor" },
                { value: "change_request", name: "Change request" },
                { value: "rejected_by_sourcing", name: "Rejected by Sourcing" },
                { value: "sent_to_co_sourcing", name: "Sent to Co Sourcing" },
                { value: "rejected_by_co_sourcing", name: "Rejected by Co Sourcing" },
                { value: "override", name: "Override" },
                { value: "override_approved_by_co_sourcing", name: "Override Approved by Co Sourcing" },
                { value: "override_rejected_by_co_sourcing", name: "Override Rejected by Co Sourcing" },
                { value: "approved", name: "Approved" },
                { value: "sent_contract_cancel_request", name: "Sent Contract Cancel Request" },
                { value: "contract_cancelled", name: "Contract Cancelled" },
            ],
            totalItems: 0,
            pagination: {},
            isDownloadCSVRunning: false,
            filter: {},
            mstSuperCategories: [],
            mstAreas: [],
            mstCategories: [],
            vendors: [],
            isOverride: false,
            overrideStatus: null,
        };
    },
    created() {
        if (!this.$lodash.isEmpty(this.$router.currentRoute.query)) {
            const { status, search } = this.$router.currentRoute.query;
            if (search) this.search = search;
            this.status = status;
        } else {
            if (this.isVendor) this.status = "sent_to_vendor";
            else if (this.isCoorporateSourcingTeam) this.status = "sent_to_co_sourcing";
        }

        this.getMasterData();
    },
    methods: {
        getQuery() {
            const query = {
                where: {},
                distinct: true,
                attributes: [
                    "fromDate",
                    "toDate",
                    "status",
                    "id",
                    "vendorId",
                    "createdBy",
                    "updated_at",
                    "overrideStatus",
                ],
                include: [
                    { model: "Vendor", attributes: ["id", "companyName"] },
                    { model: "User", required: true, attributes: ["fullName", "userName", "employeeCode", "phone"] },
                    {
                        model: "ContractCategory",
                        include: [
                            {
                                model: "MstCategory",
                                attributes: ["name"],
                            },
                        ],
                    },
                ],
            };

            if (this.isVendor) {
                query.where = {
                    vendorId: {
                        $eq: this.loggedInUser.vendor.id,
                    },
                    status: {
                        $ne: "draft",
                    },
                };
            } else if (this.isSuperAdmin) {
                query.where = {
                    status: {
                        $ne: "draft",
                    },
                };
            }

            if (this.status) {
                const isOverride = [
                    "override_approved_by_co_sourcing",
                    "override_rejected_by_co_sourcing",
                    "override",
                ].includes(this.status);

                if (isOverride) {
                    query.where = {
                        ...query.where,
                        overrideStatus: this.status,
                        isContractOverrided: true,
                    };
                } else {
                    query.where = {
                        ...query.where,
                        status: this.status,
                    };
                }
            }

            if (this.search) {
                const regex = {
                    $iLike: `%${this.search}%`,
                };

                Object.assign(query.include[0], {
                    where: {
                        companyName: regex,
                    },
                });
            }

            if (this.isSourcingRole) {
                let regionIds = [];

                if(this.isSourcingTeam) {
                    query.where = {
                        ...query.where,
                        createdBy: this.loggedInUser.id
                    }
                }

                // if (this.loggedInUser && this.loggedInUser.UserRegions) {
                //     regionIds = this.loggedInUser.UserRegions.map(a => a.regionId);
                // }

                // query.include.push({
                //     model: "ContractArea",
                //     attributes: ["id", "areaId"],
                //     required: true,
                //     include: [
                //         {
                //             model: "MstArea",
                //             attributes: ["id", "regionId"],
                //             where: {
                //                 regionId: {
                //                     $in: regionIds,
                //                 },
                //             },
                //             duplicating: false,
                //         },
                //     ],
                // });

                // const superCategoryIds =
                //     this.loggedInUser && this.loggedInUser.UserSuperCategories
                //         ? this.loggedInUser.UserSuperCategories.map(a => a.superCategoryId)
                //         : [];

                // query.include[2].where = {
                //     superCategoryId: {
                //         $in: superCategoryIds,
                //     },
                // };
            }

            if (!this.isVendor) {
                if (this.filter.dateRange && this.filter.dateRange.length) {
                    query.where = {
                        ...query.where,
                        fromDate: {
                            $gte: this.filter.dateRange[0],
                        },
                        toDate: {
                            $lte: this.filter.dateRange[1],
                        },
                    };
                }

                if (this.filter.contractAreaIds && this.filter.contractAreaIds.length) {
                    query.include.push({
                        model: "ContractArea",
                        where: {
                            areaId: {
                                $in: this.filter.contractAreaIds.map(a => a.value),
                            },
                        },
                    });
                }

                if (this.filter.vendorId) {
                    query.where = {
                        ...query.where,
                        vendorId: this.filter.vendorId.value,
                    };
                }

                if (this.filter.categoryId && this.filter.categoryId.length) {
                    query.include[2].where = {
                        categoryId: {
                            $in: this.filter.categoryId.map(a => a.value),
                        },
                    };
                }
            }

            Object.assign(query, {
                order: [[this.pagination.sortBy || "updated_at", `${this.pagination.descending ? "ASC" : "DESC"}`]],
                limit: this.pagination.rowsPerPage || 10,
                offset: (this.pagination.page - 1) * this.pagination.rowsPerPage,
            });

            return query;
        },
        async getItem() {
            this.isLoading = true;

            const { data, count } = await this.$http.get("contract/find-and-count", this.getQuery());

            this.items = data;
            this.totalItems = count;
            this.isLoading = false;
        },
        async getMasterData() {
            try {
                const [mstSuperCategories, mstArea] = await Promise.all([
                    this.$http.get("mst-super-category"),
                    this.$http.get("mst-area"),
                ]);

                this.mstSuperCategories = mstSuperCategories.map(a => ({ name: a.name, value: a.id }));
                this.mstAreas = mstArea.map(a => ({ name: a.name, value: a.id }));
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        async handleSuperCategoryChange(val) {
            try {
                const categories = await this.$http.get("mst-category", {
                    where: {
                        superCategoryId: val,
                    },
                });

                this.mstCategories = categories.map(a => ({ name: a.name, value: a.id }));
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        clearAllLocation() {
            this.filter.contractAreaIds = [];
        },
        resetAdvancedFiltering() {
            this.filter = {};
        },
        handleVendorSearch: debounce(async function(val) {
            try {
                if (!val) return;
                this.isLoading = true;
                const vendors = await this.$http.get("vendor", {
                    where: {
                        status: {
                            $ne: "draft",
                        },
                        companyName: {
                            $iLike: `%${val}%`,
                        },
                    },
                    attributes: ["id", "companyName"],
                });

                this.vendors = vendors.map(a => ({ name: a.companyName, value: a.id }));

                this.isLoading = false;
            } catch (err) {
                this.isLoading = false;
                this.$utility.showErrorMessage(err.message);
            }
        }, 500),
        manageItem(id) {
            if (this.isVendor) {
                return this.$utility.goToPage(
                    "vendor.contract.view-contract",
                    {
                        id,
                    },
                    "params",
                );
            }
            this.$utility.goToPage(
                "contract.view",
                {
                    id,
                },
                "params",
            );
        },
        setUrl() {
            let query = {};
            if (this.search) query.search = this.search;
            query.status = this.status;
            window.history.pushState({}, "", `?${stringify(query)}`);
        },
        getByStatus() {
            this.pagination.page = 1;
            this.setUrl();
            this.getItem();
        },
        debounceSearch: debounce(function() {
            this.setUrl();
            this.getItem();
        }, 700),
        async generateCSV() {
            this.isDownloadCSVRunning = true;

            const query = this.getQuery();

            delete query.limit;
            delete query.offset;

            const contracts = await this.$http.get("contract", query);

            const contractJson = contracts.map(c => ({
                "Code": c.id || "",
                "Vendor Name": c.Vendor ? c.Vendor.companyName : "",
                "Category": this.getCategories(c.ContractCategories),
                "Created By": c.User ? c.User.fullName : "",
                "Date": `${moment(c.fromDate).format("MMM DD, YYYY")} - ${moment(c.toDate).format("MMM DD, YYYY")}`,
                "Updated At": moment(c.updated_at).format("MMM DD, YYYY"),
                "Status": c.status,
            }));

            this.$refs.download_csv.data = contractJson;
            this.$refs.download_csv.generate();

            this.isDownloadCSVRunning = false;
        },
        getCategories(categories) {
            if (categories && categories.length) {
                return categories.map(a => a.MstCategory.name).join(", ");
            }
            return "-";
        },
    },
    computed: {
        ...mapGetters("account", [
            "isVendor",
            "isSourcingTeam",
            "isSuperAdmin",
            "isCoorporateSourcingTeam",
            "loggedInUser",
            "getVendor",
            "isSourcingRole",
        ]),
    },
    watch: {
        pagination() {
            this.getItem();
        },
    },
};
</script>
<template lang="pug">
d-layout
    template(slot='body')
        v-app.custom-shadow.contract-history
            v-toolbar.mb-2.mt-2(flat, color='white').desktop-view
                p.status-text.mr-4 status :
                v-select.vendor-checkbox.mr-4.stat-dd(
                    v-model='status',
                    :items='options',
                    item-text='name',
                    item-value='value', 
                    @change="getByStatus"
                )
                v-text-field.bbq-search-custom.cu-pb-1(
                    v-model='search', 
                    append-icon='search', 
                    label='Search', 
                    single-line, 
                    hide-details, 
                    clearable = true,
                    @input="debounceSearch()"
                )
                v-spacer
                //- .buttones.pull-right
                .buttones.d-flex.align-items-center.justify-content-flex-end
                    b-button.text-left(block='', href='#', v-b-toggle="'advanceSearch'")
                        span Advance Search 
                    download-csv(
                        ref="download_csv",
                        :data=[],
                        :name="`contract-csv-${Date.now()}.csv`"
                    )   
                        v-btn.h-38(
                            color="primary",
                            :loading="isDownloadCSVRunning", 
                            :disabled="isDownloadCSVRunning", 
                            @click="generateCSV()"
                        ) Export to CSV
            .mb-2.mt-2.mx-2(flat, color='white').desktop-view(v-if="!isVendor")
                p.status-text.mr-4 
                    //b-card-header.p-0(header-tag='header', role='tab1')
                        b-button.text-left(block='', href='#', variant='info', v-b-toggle="'advanceSearch'")
                            span.font-weight-bold-400 Advance Search 
                    b-collapse(:id="'advanceSearch'", :visible="false", accordion="my-accordion")
                        b-card-body.border
                            .row
                                .col-md-6 
                                    label.col-form-label Select Super Category 
                                    form-field-input(
                                        v-model="filter.superCategoryId",
                                        attribute="Super Category",
                                        input-type="select-option",
                                        :items="mstSuperCategories",
                                        label='name',
                                        trackBy='value',
                                        placeholder="Search Super Category",
                                        @input="handleSuperCategoryChange"
                                    )
                                .col-md-6 
                                    label.col-form-label Select Category 
                                    form-field-input(
                                        v-model="filter.categoryId",
                                        attribute="Category",
                                        input-type="search-multiple-select",
                                        :items="mstCategories",
                                        label='name',
                                        trackBy='value',
                                        placeholder="Search Category",
                                    )
                                .col-md-6
                                    label.col-form-label Contract Areas 
                                    form-field-input(
                                        v-model="filter.contractAreaIds",
                                        attribute="Contract Areas",
                                        input-type="search-multiple-select",
                                        placeholder="Selsect Contract locations",
                                        :items="mstAreas",
                                        :showClearAll="true"
                                        @clearAll="clearAllLocation",
                                        label='name',
                                        trackBy='value',
                                    )
                                .col-md-6
                                    label.col-form-label Contract Date 
                                    form-field-input(
                                        v-model="filter.dateRange",
                                        attribute="dateRange",
                                        input-type="daterange",
                                        placeholder="Select Date",
                                        :clearable="true",
                                    )
                                .col-md-6
                                    label.col-form-label Select Vendor 
                                    form-field-input(
                                        v-model="filter.vendorId",
                                        attribute="vendor",
                                        input-type="search-select",
                                        :items="vendors",
                                        label='name',
                                        trackBy='value',
                                        :required="true",
                                        placeholder="Type to search Vendor",
                                        @search="handleVendorSearch"
                                    )
                                .col-md-6.mt-3.d-flex.align-items-end.justify-content-between
                                    //- .text-right.mt-3.text-right
                                    button.btn.btn-primary.bbq-previous-button.mr-3.h-38(@click="resetAdvancedFiltering") Reset
                                    button.btn.btn-primary.bbq-previous-button.mr-3.h-38(@click="getItem") Search
            v-data-table.user-li-table(
                :headers='headers', 
                :pagination.sync="pagination",  
                :items='items', 
                :total-items="totalItems", 
                :rows-per-page-items="[10]",
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='{ item }')
                    td.text-center {{ item.id || '-'}}
                    td {{ item.Vendor ? item.Vendor.companyName : '-'}}
                    td {{ getCategories(item.ContractCategories) }}
                    td(v-if="item.User") {{ item.User.fullName | capitalize}}
                    td(v-else) -
                    td 
                        span {{ item.fromDate | dateFormat }} -
                        span {{ item.toDate | dateFormat }}
                    td {{ item.updated_at | dateFormat }}
                    td
                        status-color(:type="item.status", :text="item.status")
                    td(v-if="item.overrideStatus")
                        status-color.whitespace-normal(:type="item.overrideStatus", :text="item.overrideStatus")
                    td(v-else) -
                    td.text-center
                        v-icon.far.fa-eye(small, @click='manageItem(item.id)')
            div.ismobile
                ul.flex-content(v-for="item of items")
                    li.flex-item(data-label='Code') {{ item.id ||  '-' }}
                    li.flex-item(data-label='Vendor Name') {{ item.Vendor ? item.Vendor.companyName : '-'}}
                    li.flex-item(data-label='Category', v-if="item.MstCategory") {{ item.MstCategory.name | capitalize }}
                    li(v-else) -
                    li.flex-item(data-label='Created By', v-if="item.User") {{ item.User.fullName  | capitalize}}
                    li(v-else) -
                    li.flex-item(data-label='Date')
                        span {{ item.fromDate | dateFormat }} 
                        span {{ item.toDate | dateFormat }}
                    li.flex-item(data-label='Updated At') {{ item.updated_at | dateFormat }}
                    li.flex-item(data-label='Status') {{ item.status | humanize }}
                    li.flex-item(data-label='Override Status') {{ item.overrideStatus | humanize }}
                    li.flex-item(data-label='action')
                        v-icon.far.fa-eye(small, @click='manageItem(item.id)')
</template>
