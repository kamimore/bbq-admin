<script>
import Vue from "vue";
import { GridPlugin, Toolbar, ExcelExport } from "@syncfusion/ej2-vue-grids";
Vue.use(GridPlugin);
export default {
    name: "DownloadExcel",
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        vendorDetails: {
            type: Object,
            default: () => {},
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            toolbarOptions: [
                {
                    text: "Export detailed ledger",
                    tooltipText: "Download Excel",
                    prefixIcon: "e-download",
                    id: "excelexport",
                },
            ],
            dataItems: []
        };
    },
    methods: {
        gridExport(list) {
            if (this.$refs.grid1) {
                let firstGridExport = this.$refs.grid1.excelExport({
                    fileName: `Vendor-ledger-${Date.now()}.xlsx`,
                    record: { fontName: "Arial", fontColor: "#000000", bold: false, fontSize: 10 },
                    caption: { fontName: "Arial", fontColor: "#000000", bold: false, fontSize: 10 },
                    header: {
                        headerRows: 15,
                        rows: [
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "Statement of Accounts",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 20,
                                            hAlign: "Center",
                                            bold: true,
                                            border: 0,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 30,
                                            hAlign: "Center",
                                            bold: true,
                                            border: 0,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "BARBEQUE NATION HOSPITALITY LIMITED",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 15,
                                            hAlign: "Justify",
                                            bold: false,
                                            border: 0,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value:
                                            "No 62 Site No Survey 13 6th Cross Rd, Pali Mkt Shop No.1 & 2 Bandra ( W )",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 5,
                                        value: "NS Palya Stage 2 Bengaluru",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                        },
                                    },
                                    {
                                        colSpan: 5,
                                        value: "No 62 Site No Survey 13 6th Cross Rd",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "Karnataka 560076",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                            hJustify: "SpaceBetween",
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "",
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                            hJustify: "SpaceBetween",
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: `${this.vendorDetails.companyName} (${this.vendorDetails.vendorId})`,
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 16,
                                            hAlign: "Justify",
                                            bold: false,
                                            border: 0,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: `${this.vendorDetails.address}`,
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: `${this.vendorDetails.address2}`,
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: `${this.vendorDetails.city}`,
                                        style: {
                                            fontColor: "#000000",
                                            fontSize: 12,
                                            hAlign: "Justify",
                                            bold: false,
                                            hJustify: "SpaceBetween",
                                        },
                                    },
                                ],
                            },
                            {
                                cells: [
                                    {
                                        colSpan: 10,
                                        value: "",
                                        style: { hAlign: "Center" },
                                    },
                                ],
                            },
                        ],
                    },
                });
            }
        },
    },
    provide: {
        grid: [Toolbar, ExcelExport],
    },
};
</script>

<template lang="pug">
ejs-grid#FirstGrid(
    v-show="isVisible",
    ref="grid1",
    :dataSource="items",
    :toolbar="toolbarOptions",
    :allowExcelExport="true",
    :toolbarClick="gridExport"
)
    //- e-columns
        e-column(field="OrderID", headertext="Order ID", textalign="Right", width="120")
        e-column(field="CustomerID", headertext="Customer ID", width="150")
        e-column(field="ShipCity", headertext="Ship City", width="150")
        e-column(field="ShipName", headertext="Ship Name", width="150")
</template>

<style>
/* @import "../node_modules/@syncfusion/ej2-vue-grids/styles/material.css"; */
</style>