<script>
import { mapGetters } from "vuex";
import { debounce } from "lodash";
import DLayout from "@layouts/default-layout";
import AddVendor from "./components/add-vendor";
import SendLinkToVendor from "./components/send-link-to-vendor";
import DatatableSettingMixin from "@mixins/datatable-setting";
import { stringify } from "qs";

import generateCSV from "./components/generate-csv";

export default {
    name: "VendorList",
    components: {
        DLayout,
        AddVendor,
        SendLinkToVendor,
    },
    mixins: [DatatableSettingMixin],
    data() {
        return {
            dialog: false,
            mode: "add",
            pagination: {
                // sortBy : 'updated_at',
                // descending : 'DESC'
            },
            search: null,
            status: "",
            totalItems: 0,
            items: [],
            loggedInUser: null,
            headers: [
                { text: "Code", align: "left", value: "bbqVendorId" },
                { text: "Name", value: "companyName", align: "left" },
                { text: "Super Category", value: "User.UserSuperCategories", align: "left", sortable: false },
                { text: "Email", value: "User.email", align: "left", sortable: false },
                { text: "Phone", value: "User.phone", align: "left" },
                { text: "Type", value: "type", align: "left" },
                { text: "Status", value: "", align: "left", sortable: false },
                { text: "Ledger", value: "", sortable: false, align: "left" },
                { text: "Actions", value: "", sortable: false, align: "center", width: "10%" },
            ],
            options: [
                { value: "", name: "All" },
                { value: "pending", name: "Pending" },
                { value: "draft", name: "Draft" },
                { value: "approved_by_sourcing", name: "Approved by Sourcing" },
                { value: "approved_by_sourcing_head", name: "Approved by Sourcing Head" },
                { value: "approved_by_mdm", name: "Approved by MDM" },
                { value: "rejected_by_sourcing", name: "Rejected By Sourcing" },
                { value: "rejected_by_sourcing_head", name: "Rejected By Sourcing Head" },
                { value: "rejected_by_mdm", name: "Rejected By MDM" },
            ],
            isDownloadCSVRunning: false,
        };
    },
    async created() {
        if (!this.$lodash.isEmpty(this.$router.currentRoute.query)) {
            const { status, search } = this.$router.currentRoute.query;
            if (search) this.search = search;
            this.status = status || null;
        } else {
            this.loggedInUser = this.$store.getters["account/getUser"];
            if (this.isMDM) this.status = "approved_by_sourcing_head";
            else if (this.isSourcingHead) this.status = "approved_by_sourcing";
            else if (this.isSourcingRole) this.status = "pending";
        }
    },
    methods: {
        getQuery() {
            const query = {
                where: {
                    status: "pending",
                },
                limit: 10,
                distinct: true,
                attributes: [
                    "id",
                    "bbqVendorId",
                    "userId",
                    "type",
                    "status",
                    "showLedger",
                    "companyName",
                    "created_at",
                ],
                order: [["creted_at", "desc"]],
                include: [
                    {
                        model: "User",
                        attributes: ["id", "email", "phone"],
                        required: true,
                        include: [
                            {
                                model: "UserSuperCategory",
                                attributes: ["id", "superCategoryId"],
                                include: [
                                    {
                                        model: "MstSuperCategory",
                                        attributes: ["id", "name"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            Object.assign(query, {
                offset: (this.pagination.page - 1) * 10,
                order: [[this.pagination.sortBy || "created_at", this.pagination.descending ? "DESC" : "ASC"]],
            });

            if (this.status) {
                query.where = {
                    status: this.status,
                };
            } else {
                query.where = {};
            }

            if (this.search) {
                const regex = {
                    $iLike: `%${this.search}%`,
                };

                Object.assign(query.where, {
                    $or: [
                        {
                            bbqVendorId: regex,
                        },
                        {
                            companyName: regex,
                        },
                        {
                            type: regex,
                        },
                        {
                            "$User.email$": regex,
                        },
                    ],
                });
            }

            if (this.isSourcingRole) {
                const regionIds =
                    this.loggedInUser && this.loggedInUser.UserRegions
                        ? this.loggedInUser.UserRegions.map(a => a.regionId)
                        : [];

                query.include[0].include.push({
                    model: "UserRegion",
                    attributes: ["id"],
                    required: true,
                    where: {
                        regionId: {
                            $in: regionIds,
                        },
                    },
                });

                const superCategoryIds =
                    this.loggedInUser && this.loggedInUser.UserSuperCategories
                        ? this.loggedInUser.UserSuperCategories.map(a => a.superCategoryId)
                        : [];

                query.include[0].include[0].where = {
                    superCategoryId: {
                        $in: superCategoryIds,
                    },
                };
            }

            return query;
        },
        async getData() {
            this.isLoading = true;

            const { data, count } = await this.$http.get("vendor/find-and-count", this.getQuery());

            this.items = data;
            this.totalItems = count;

            this.isLoading = false;
        },
        debounceSearch: debounce(function() {
            this.setUrl();
            this.getData();
        }, 700),
        viewVendorProfile(vendorId) {
            this.$utility.goToPage("vendor.view", {
                id: vendorId,
            });
        },
        viewVendorFinance(vendorId) {
            this.$utility.goToPage("vendor.ledger.list", {
                id: vendorId || 0,
            });
        },
        async toogleLedger(bool, id) {
            await this.$http.updateById(
                "vendor",
                id,
                {
                    showLedger: !!bool,
                },
                false,
            );
        },
        getByStatus() {
            this.setUrl();
            this.pagination.page = 1;
            this.getData();
        },
        async stealthLogin(userId) {
            try {
                const result = await this.$http.rawPost("stealth-login", { userId });
                this.$store.dispatch("auth/login", result);
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
        setUrl() {
            let query = {};
            if (this.search) query.search = this.search;
            query.status = this.status;
            window.history.pushState({}, "", `?${stringify(query)}`);
        },
        async getVendorCSV() {
            this.isDownloadCSVRunning = true;

            const query = this.getQuery();

            const includesVendorGroup = {
                model: "MstVendorPostingGroup",
                attributes: ["code"],
            };

            const includeStructure = {
                model: "MstStructure",
                attributes: ["code"],
            };
            const includePaymentTerm = {
                model: "MstPaymentTerm",
                attributes: ["name"],
            };

            const includeVendorLocation = {
                model: "VendorLocation",
                attributes: [
                    "address",
                    "address2",
                    "contactPersonName",
                    "city",
                    "postCode",
                    "panNumber",
                    "gstNumber",
                    "gstVendorType",
                    "taxLiable",
                    "tinNumber",
                    "fssaiNumber",
                ],
                include: [
                    {
                        model: "VendorBankDetail",
                        attributes: ["bankName", "branchName", "accountNumber", "IFSCCode"],
                        where: {
                            isDeleted: false,
                        },
                    },
                    {
                        model: "MstState",
                        attributes: ["name"],
                    },
                ],
            };

            // query.attributes.push("vatRegisterationNumber");
            query.attributes.push("generalBusPostingGroup");
            query.attributes.push("vatBusPostingGroup");
            query.attributes.push("vendorType");
            query.attributes.push("isMSME");
            query.attributes.push("priority");
            query.attributes.push("applicationMethod");

            query.include.push(includesVendorGroup);
            query.include.push(includeVendorLocation);
            query.include.push(includeStructure);
            query.include.push(includePaymentTerm);

            delete query.limit;
            delete query.offset;

            const vendors = await this.$http.get("vendor", query);

            const vendorJson = generateCSV(vendors);

            this.$refs.download_csv.data = vendorJson;
            this.$refs.download_csv.generate();
            this.isDownloadCSVRunning = false;
        },
    },
    computed: {
        ...mapGetters("account", ["isSourcingHead", "isMDM", "isSuperAdmin", "isSourcingRole", "isViewOnly"]),
    },
    watch: {
        pagination() {
            this.getData();
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        .custom-shadow
            v-app.table-shadow
                v-toolbar.mb-2.add-vendor-button(flat, color='white')
                    p.status-text.mr-4 Status : 
                    v-select.vendor-checkbox.mr-4(
                        v-model='status',
                        :items='options',
                        item-text='name',
                        item-value='value',
                        @input='getByStatus()'
                    )
                    v-text-field.bbq-search-custom(
                        v-model='search', 
                        append-icon='search', 
                        label='Search', 
                        single-line, 
                        hide-details, 
                        clearable = true,
                        @input="debounceSearch()"
                    )
                    v-spacer
                    .buttones.pull-right.mb-2  
                        download-csv(
                            ref="download_csv",
                            :data=[],
                            :name="`vendor-csv-${Date.now()}.csv`"
                        )   
                            v-btn.mb-2.mr-0.mt-0(
                                color="primary",
                                :loading="isDownloadCSVRunning", 
                                :disabled="isDownloadCSVRunning", 
                                @click="getVendorCSV()"
                            ) Export to CSV
                    .buttones.pull-right.mb-2.ml-2 
                        v-btn.mb-2.green-button.add-bun.mr-0.mt-0(dark, v-if="!isViewOnly"  @click="$refs.send_link_to_vendor.open()") Send Link To Vendor
                    .buttones.pull-right.mb-2.ml-2 
                        v-btn.mb-2.green-button.add-bun.mr-0.mt-0(dark, v-if="!isViewOnly" @click="$refs.Add_Vendor.open()") Add Vendor
                v-data-table.vendor-list-table(
                    :headers='headers', 
                    :items='items',
                    :pagination.sync="pagination",  
                    :rows-per-page-items="[10]",
                    :total-items="totalItems",
                    :loading="isLoading", 
                    :no-data-text="loaderText"
                )
                    template(v-slot:items='{item}')
                        td {{ item.bbqVendorId || '-'}}
                        td {{ item.companyName || '-'}}
                        td {{ item.User.UserSuperCategories.map(a => (a.MstSuperCategory.name)).join(', ') || '-'  | capitalize }}
                        td
                            truncate-tooltip(:content="(item.User && item.User.email) ? item.User.email : '-'", :limit="10") 
                        //- {{ (item.User && item.User.email) ? item.User.email : '-'}}
                        td.w-120 {{ (item.User && item.User.phone) ? item.User.phone : '-'}}
                        td {{ item.type | humanize}}
                        td
                            status-color(:type="item.status", :text="item.status")
                        td.text-left
                            el-switch(
                                v-model="item.showLedger",
                                :disabled="!isMDM && !isSuperAdmin",
                                @change="toogleLedger(item.showLedger, item.id)",
                            )
                        td.text-center
                            v-icon.fa.fa-eye.customisize(small, @click='viewVendorProfile(item.id)')
                            span.mr-3
                            v-icon.mr-3.fa.fa-sign-in(v-if="isSuperAdmin", small, @click="stealthLogin(item.User.id)")
                            v-icon.fa.fa-inr.text-black(small, @click='viewVendorFinance(item.bbqVendorId)')
                sweet-modal(
                    ref="Add_Vendor",
                    width="35%",
                    overlay-theme="dark",
                )   
                    add-vendor
                sweet-modal(
                    ref="send_link_to_vendor",
                    width="35%",
                    overlay-theme="dark",
                )   
                    send-link-to-vendor(@close="$refs.send_link_to_vendor.close()")
</template>

<style lang="scss">
.v-input.bbq-search-custom {
    padding-bottom: 20px;
}
</style>
