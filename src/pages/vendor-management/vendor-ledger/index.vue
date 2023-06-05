<script>
import moment from "moment";
import { debounce } from "lodash";
import DLayout from "@layouts/default-layout";
import PaymentDetails from "./components/payment-details";
import DocDetails from "./components/doc-details";
import VendorDetails from "./components/vendor-details";
import DatatableSettingMixin from "@mixins/datatable-setting";
import Vue from "vue";
import VueSlideoutPanel from "vue2-slideout-panel";
import { stringify } from "qs";
import { mapGetters } from "vuex";
import DownloadExcel from "./components/export-excel";
// import JsonExcel from "vue-json-excel";
Vue.use(VueSlideoutPanel);
// Vue.component("downloadExcel", JsonExcel);
export default {
    name: "FinanceList",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
        PaymentDetails,
        VendorDetails,
        DownloadExcel,
    },
    data() {
        const endOfYear = moment().format("YYYY-MM-DD");
        const startOfYear = moment().subtract(1, "months").format("YYYY-MM-DD");
        const date = [startOfYear, endOfYear];
        return {
            date,
            items: [],
            filteredItems: [],
            exportItems: [],
            areas: [],
            search: "",
            ledgerEntryInfo: [],
            ledgerPOEntryInfo: [],
            ledgerGrnEntryInfo: [],
            exportExcelData: false,
            headers: [
                { text: "ID", value: "SrNo", align: " d-none", sortable: false },
                { text: "Store Name", value: "AreaName", sortable: false },
                { text: "Date", value: "PostingDate", sortable: false },
                { text: "Doc Type", value: "DocumentType", class: "min-widther", sortable: false },
                { text: "Document No", value: "DocumentNo", sortable: false },
                { text: "Invoice No", value: "InvoiceNo", sortable: false },
                { text: "Debit", sortable: false },
                { text: "Credit", sortable: false },
                { text: "Closing Bal ", value: "ClosingAmt", sortable: false, class: "close-balance" },
                { text: "TDS Amt ", value: "TdsNo", align: " d-none", sortable: false },
                { text: "Remaing Balance", sortable: false, align: " d-none" },
                // { text: "Entry Status", value: "Open" },
                // { text: "Total Amt ", value: "TotalAmt" },
                { text: "Actions", value: "actions", sortable: false, align: "right" },
                // { text: "Due Date", sortable: false },
                // { text: "Entry No.", sortable: false },
            ],
            ledgerFields: {
                "Sr No": "SrNo",
                "Area Code": "AreaCode",
                "Area Name": "AreaName",
                "Balance": "Balance",
                "Closing Amount": "ClosingAmt",
                "Credit Amount": "CreditAmount",
                "Debit Amount": "DebitAmount",
                "Document Number": "DocumentNo",
                "Document Type": "DocumentType",
                "Invoice No": "InvoiceNo",
                "Posting Date": "PostingDate",
                "TDS Amount": "TdsAmt",
                "Vendor Ledger Entry No": "VendorLedgerEntryNo",
                "Vendor No": "VendorNo",
            },
            vendor: {},
            // isDownloadCSVRunning: false,
        };
    },
    async created() {
        this.user = this.$store.getters["account/getUser"];
        this.areas = await this.$http.get("mst-area");
        this.getData();
        this.getVendorDetails();
    },
    methods: {
        async getVendorDetails() {
            try {
                if(!this.isVendor) {
                    const data = await this.$http.get("vendor", {
                        where: {
                            bbqVendorId: this.$router.currentRoute.params.id,
                        },
                        attributes: ["companyName", "bbqVendorId"],
                        include: [
                            {
                                model: "VendorLocation",
                            },
                        ],
                    });
                    this.vendor = data[0];
                } else {
                    const data = await this.$http.get("vendor", {
                        where: {
                            userId: this.loggedInUser.id,
                        },
                        attributes: ["companyName", "bbqVendorId"],
                        include: [
                            {
                                model: "VendorLocation",
                            },
                        ],
                    });
                    this.vendor = data[0];

                }
            } catch (err) {
                thi.$utility.showErrorMessage(err.message);
            }
        },
        async getData(val = null, entryNo = 0) {
            this.isLoading = true;
            let query = {};
            // if (val && val.length) {
            //     query.FromDate = val[0];
            //     query.ToDate = val[1];
            // }
            if (this.date && this.date.length) {
                query.FromDate = this.date[0];
                query.ToDate = this.date[1];
            }
            if (this.search) {
                query.Search = this.search;
            }
            if (!this.$lodash.isEmpty(this.$router.currentRoute.params)) {
                const { id } = this.$router.currentRoute.params;
                query.VendorNo = id;
            } else {
                const user = this.$store.getters["account/getUser"];
                const id = user.vendor.bbqVendorId;
                query.VendorNo = id;
            }
            query.Type = "1"; // Get Web View Of Table
            query.EntryNo = entryNo;
            if (query.VendorNo) {
                this.$store.dispatch("loader/updateLoader", true);
                const result = await this.$http.postBBQApi(`${process.env.VUE_APP_BBQ_API_HOST}/VendorLedger`, query);
                if (result && result.VendorLedgers) {
                    query.Type = "3"; //Get Export View of Column
                    const excelRes = await this.$http.postBBQApi(
                        `${process.env.VUE_APP_BBQ_API_HOST}/VendorLedger`,
                        query,
                    );
                    this.items = result.VendorLedgers;
                    this.filteredItems = result.VendorLedgers;
                } else {
                    this.items = [];
                    this.filteredItems = [];
                    this.exportItems = [];
                }
                this.$store.dispatch("loader/updateLoader", false);
            }
            this.isLoading = false;
        },
        async showDetailsPanel(ledgerEntryNo) {
            this.isLoading = true;
            let query = {};
            query.FromDate = this.date[0];
            query.ToDate = this.date[1];
            query.VendorNo = 0;
            if (!this.$lodash.isEmpty(this.$router.currentRoute.params)) {
                const { id } = this.$router.currentRoute.params;
                query.VendorNo = id;
            } else {
                const user = this.$store.getters["account/getUser"];
                const id = user.vendor.bbqVendorId;
                query.VendorNo = id;
            }
            query.Type = "2";
            query.EntryNo = ledgerEntryNo;
            if (query.VendorNo && query.EntryNo) {
                // this.$store.dispatch("loader/updateLoader", true);
                try {
                    const res = await this.$http.postBBQApi(`${process.env.VUE_APP_BBQ_API_HOST}/VendorLedger`, query);
                    this.isLoading = false;
                    if (res && res.VendorLedgerDetails) {
                        this.ledgerEntryInfo = res.VendorLedgerDetails;
                        const panel = this.$showPanel({
                            component: VendorDetails,
                            openOn: "right",
                            cssClass: "custom-side-panel-width",
                            props: {
                                //any data you want passed to your component
                                ledgerEntryInfo: this.ledgerEntryInfo[0],
                            },
                        });
                        panel.promise.then(result => {
                            this.pane1Result = result;
                        });
                    } else {
                        this.$utility.showErrorMessage("No Payment Information Found!!!");
                    }
                } catch (error) {
                    this.isLoading = false;
                    this.$utility.showErrorMessage(error.message);
                }
            } else {
                this.$utility.showErrorMessage("Vendor Number or Vendor Ledger Number is missing :(");
            }
        },
        async showDocPanel(orderNo, grnNo, docType) {
            this.isLoading = true;
            let query = {};
            let viewComponent = "";
            if (!this.$lodash.isEmpty(this.$router.currentRoute.params)) {
                const { id } = this.$router.currentRoute.params;
                query.VendorNo = id;
            } else {
                const user = this.$store.getters["account/getUser"];
                const id = user.vendor.bbqVendorId;
                query.VendorNo = id;
            }
            if (docType == "1") {
                viewComponent = "Purchase Order";
                query.DocumentType = "1"; // Get PO Details
            }
            if (docType == "2") {
                viewComponent = "GRN";
                query.DocumentType = "2"; // Get GRN Details
            }
            query.OrderNo = orderNo;
            query.GrnNo = grnNo;
            if (query.VendorNo) {
                try {
                    const res = await this.$http.postBBQApi(
                        `${process.env.VUE_APP_BBQ_API_HOST}/VendorLedgerDocumentEntry`,
                        query,
                    );
                    this.isLoading = false;
                    this.ledgerPoEntryInfo = res.VendorDocumentLedgerEntrys;
                    if (res.VendorDocumentLedgerEntrys && res.VendorDocumentLedgerEntrys.length > 0) {
                        const panel = this.$showPanel({
                            component: DocDetails,
                            openOn: "right",
                            props: {
                                //any data you want passed to your component
                                ledgerDocEntryInfo: this.ledgerPoEntryInfo[0],
                                documentType: docType,
                            },
                        });
                        panel.promise.then(result => {
                            this.pane1Result = result;
                        });
                    } else {
                        this.$utility.showErrorMessage("No " + viewComponent + " Document Found!!!");
                    }
                } catch (error) {
                    this.isLoading = false;
                    this.$utility.showErrorMessage(error.message);
                }
            } else {
                this.$utility.showErrorMessage("Missing Parameters :(");
            }
        },
        debounceSearch: debounce(function () {
            const data = this.items.filter(a => {
                let isMatched = false;
                const search = this.search ? this.search.toLowerCase() : "";
                for (const key in a) {
                    if (a[key] && a[key].toLowerCase().includes(search)) {
                        isMatched = true;
                    }
                }
                if (isMatched) return a;
            });
            this.filteredItems = data;
        }, 700),
        setUrl() {
            let query = {};
            if (this.search) query.search = this.search;
            query.status = this.status;
            window.history.pushState({}, "", `?${stringify(query)}`);
        },
        async getExportExcelData() {
            try {
                let query = {};
                if (this.date && this.date.length) {
                    query.FromDate = this.date[0];
                    query.ToDate = this.date[1];
                }
                if (!this.$lodash.isEmpty(this.$router.currentRoute.params)) {
                    const { id } = this.$router.currentRoute.params;
                    query.VendorNo = id;
                } else {
                    const user = this.$store.getters["account/getUser"];
                    const id = user.vendor.bbqVendorId;
                    query.VendorNo = id;
                }

                query.EntryNo = 0;
                query.Type = "3";

                if (query.VendorNo) {
                    this.$store.dispatch("loader/updateLoader", true);
                    const result = await this.$http.postBBQApi(
                        `${process.env.VUE_APP_BBQ_API_HOST}/VendorLedger`,
                        query,
                    );

                    this.exportItems = result.VendorLedgers.map(a => ({
                        "Store Name": a.AreaName,
                        "Date": a.PostingDate,
                        "Document Type": a.DocumentType,
                        "Document No": a.DocumentNo,
                        "Ref./Invoice No": a.InvoiceNo,
                        "Debit": a.DebitAmount,
                        "Credit": a.CreditAmount,
                        "Closing Balance": a.ClosingAmt,
                        "Remaining Balance": a.Balance,
                        "Tds Amount": a.TdsAmt,
                    }));
                    setTimeout(() => {
                        this.$refs.excelExport.gridExport();
                        this.$store.dispatch("loader/updateLoader", false);
                    }, 1500);
                }
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
    computed: {
        ...mapGetters("account", ["loggedInUser", "isVendor"]),
        vendorDetailsExcel() {
            if (this.vendor) {
                let data = {};
                data.companyName = this.vendor.companyName;
                data.vendorId = this.$router.currentRoute.params.id;
                if(this.isVendor) {
                    data.vendorId = this.vendor.bbqVendorId;
                }
                if (this.vendor.VendorLocations && this.vendor.VendorLocations.length) {
                    const location = this.vendor.VendorLocations[0];
                    data.address = location.address;
                    data.address2 = location.address2;
                    data.city = `${location.city} (${location.postCode})`;
                }
                return data;
            }
        },
    },
    watch: {
        date(val) {
            this.getData(val);
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot="body")
        .que-category-border.bg-white.custom-shadow
            .row.custom-ledger-header
                .col-4.sm-6.col-sm-5.for-mob-v.ml-3.mt-3.mb-3
                    .double-date-chooser.round_classes
                        form-field-input(v-model="date", attribute="Date", input-type="daterange", :required="false")
                .col-5.sm-6.col-sm-6.desktop-view.mr-2.mt-2
                    .title-style-1.text-right.custom_right_pan
                        v-text-field.bbq-search-custom.mr-5.round_classes(
                            v-model="search",
                            append-icon="search",
                            label="Search",
                            single-line,
                            hide-details,
                            clearable,
                            @input="debounceSearch()"
                        )
                        //- v-spacer
                        //- .buttones.pull-right.mb-2
                        .btn.mb-2.btn-primary.ledger-button.mr-2.mt-2(@click="getExportExcelData()") Export detailed ledger
                        download-excel(
                            ref="excelExport",
                            :items="exportItems",
                            :isVisible="false",
                            :downloadData="exportExcelData",
                            :vendorDetails="vendorDetailsExcel"
                        ) 
                .col-sm-12.mt-2
                    //- download-excel(:items="items")
                    v-data-table.ledger-table1(
                        :headers="headers",
                        :items="filteredItems",
                        :rows-per-page-items="[10]",
                        :loading="isLoading",
                        :no-data-text="loaderText"
                    )
                        template(v-slot:items="props")
                            td.d-none {{ props.item.SrNo || '-' }}
                            td {{ props.item.AreaName | capitalize }}
                            td {{ props.item.PostingDate || '' | dateFormat }}
                            td {{ props.item.DocumentType || '-' }}
                            td {{ props.item.DocumentNo || '-' }}
                                //- v-icon.fa.fa-university.customisize(v-if='item.DocumentType == "JOURNALV"',small)
                            td {{ props.item.InvoiceNo || '-' }}
                            //- td {{ props.item.OrderNo || '-' }}
                            //- td {{ props.item.GrnNo || '-' }}
                            td {{ props.item.DebitAmount | decimalFormat }}
                            td {{ props.item.CreditAmount | decimalFormat }}
                            td {{ props.item.ClosingAmt || '-' }}
                            td.d-none {{ props.item.TdsAmt || '-' }}
                            td.d-none {{ props.item.Balance | decimalFormat }}
                            //- td {{ props.item.Open || '-'}}
                            //- td {{ props.item.TotalAmt || '-' }}
                            //- td {{ props.item.DueDate ? props.item.DueDate :  '-'}}
                            //- td {{ props.item.VendorLedgerEntryNo ? props.item.VendorLedgerEntryNo :  '-'}}
                            td.text-right
                                v-icon.mr-2.fa.fa-file-text-o(
                                    v-if="props.item.VendorLedgerEntryNo != 0",
                                    small,
                                    @click="showDetailsPanel(props.item.VendorLedgerEntryNo)",
                                    v-b-tooltip.hover,
                                    title="Ledger Details"
                                )
                                //- v-icon.mr-2.fa.fa-money(
                                //-     v-if='props.item.VendorLedgerEntryNo != 0',
                                //-     small,
                                //-     @click="showPanel(props.item.VendorLedgerEntryNo)",
                                //-     v-b-tooltip.hover,
                                //-     title="Payment Info"
                                //- )
                                //- v-icon.mr-2.fa.fa-file-o(
                                //-     v-if='props.item.OrderNo',
                                //-     small,
                                //-     @click="showDocPanel(props.item.OrderNo, props.item.GrnNo, 1)",
                                //-     v-b-tooltip.hover,
                                //-     title="PO Bill"
                                //- )
                                //- v-icon.far.fa-eye(
                                //-     v-if='props.item.GrnNo',
                                //-     small,
                                //-     @click="showDocPanel(props.item.OrderNo, props.item.GrnNo, 2)",
                                //-     v-b-tooltip.hover,
                                //-     title="GRN Bill"
                                //- )
                    .ismobile
                        ul.flex-content(v-for="item of filteredItems")
                            li.flex-item(data-label="Location Name") {{ item.LocationName | capitalize }}
                            li.flex-item(data-label="Posting Date") {{ item.PostingDate || '' | dateFormat }}
                            li.flex-item(data-label="Document Type") {{ item.DocumentType || '-' }}
                            li.flex-item(data-label="Document No") {{ item.DocumentNo || '-' }}
                            //- li.flex-item(data-label="Invoice No") {{ item.ExternalDocumentNo || '-' }}
                            li.flex-item(data-label="Debit") {{ item.DebitAmount | decimalFormat }}
                            li.flex-item(data-label="Credit") {{ item.CreditAmount | decimalFormat }}
                            li.flex-item(data-label="Balance") {{ item.Balance | decimalFormat }}
                            //- li.flex-item(data-label='Entry Status') {{item.Open || '-'  }}
                            //- li.flex-item(data-label="Order No") {{ item.OrderNo || '-' }}
                            //- li.flex-item(data-label="GRN No") {{ item.GrnNo || '-' }}
                            li.flex-item(data-label="TDS Amt") {{ item.TdsAmt || '-' }}
                            //- li.flex-item(data-label="Total Amt") {{ item.TotalAmt || '-' }}
                            li.flex-item(data-label="Closing Amt") {{ item.ClosingAmt || '-' }}
</template>

<style lang="scss">
</style>