<script>
import RadialChart from "../graphs-component/radial-chart";
import BarChart from "../graphs-component/bar-chart";
import LineChart from "../graphs-component/line-chart";
import { uniq } from "lodash";
import { humanize } from "underscore.string";

export default {
    name: "Contract",
    components: {
        RadialChart,
        BarChart,
        LineChart,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        mstSuperCategory: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            filteredContract: [],
            selectedCategory: "",
            filteredApprovedContract: [],
            contractApprovedFilter: [
                { title: "Week", value: "weekly" },
                { title: "Month", value: "monthly" },
                { title: "Year", value: "yearly" },
            ],
            selectedContractApproved: "yearly",
            headers: [
                { text: "Code", align: "left", value: "id" },
                { text: "Vendor Name", align: "left", value: "vendor_name" },
                { text: "Category", align: "left", value: "category" },
                { text: "Start Date", align: "left", value: "startdate" },
                { text: "End Date", align: "left", value: "enddate" },
            ],
        };
    },
    methods: {
        getAvailableContract() {
            let data = {};
            data.series = [+this.item.contractAvailablePercent];
            data.chartOptions = {
                chart: {
                    type: "radialBar",
                    toolbar: {
                        show: true,
                    },
                },
                plotOptions: {
                    radialBar: {
                        startAngle: -135,
                        endAngle: 225,
                        hollow: {
                            margin: 0,
                            size: "70%",
                            background: "#fff",
                            image: undefined,
                            imageOffsetX: 0,
                            imageOffsetY: 0,
                            position: "front",
                            dropShadow: {
                                enabled: true,
                                top: 3,
                                left: 0,
                                blur: 4,
                                opacity: 0.24,
                            },
                        },
                        track: {
                            background: "#fff",
                            strokeWidth: "67%",
                            margin: 0, // margin is in pixels
                            dropShadow: {
                                enabled: true,
                                top: -3,
                                left: 0,
                                blur: 4,
                                opacity: 0.35,
                            },
                        },

                        dataLabels: {
                            show: true,
                            name: {
                                offsetY: -10,
                                show: false,
                                color: "#888",
                                fontSize: "17px",
                            },
                            value: {
                                formatter: function(val) {
                                    return val > 100 ? '100%' : `${val.toFixed(1)}%`;
                                },
                                color: "#111",
                                fontSize: "22px",
                                show: true,
                            },
                        },
                    },
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        type: "horizontal",
                        shadeIntensity: 0.5,
                        gradientToColors: ["#ABE5A1"],
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100],
                    },
                },
                stroke: {
                    lineCap: "round",
                },
                labels: ["Percent"],
            };

            return data;
        },
        getExpiredContractCategory() {
            let data = {};
            data.series = this.item.expiredContractCategoryWise.map(a => +a.totalcount);
            data.chartOptions = {
                chart: {
                    type: "radialBar",
                    toolbar: {
                        show: true,
                    },
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: "17px",
                            },
                            offsetX: 0,
                            offsetY: 20,
                            value: {
                                formatter: function(val) {
                                    return val;
                                },
                                fontSize: "22px",
                            },
                            total: {
                                show: true,
                                label: "Total",
                                formatter: function(w) {
                                    return w.config.series.reduce((a, b) => a + b);
                                },
                            },
                        },
                    },
                },
                labels: this.item.expiredContractCategoryWise.map(a => a.name),
                legend: {
                    show: true,
                    floating: true,
                    fontSize: "12px",
                    position: "bottom",
                    offsetX: 0,
                    offsetY: 10,
                    labels: {
                        useSeriesColors: true,
                    },
                    markers: {
                        size: 0,
                    },
                    formatter: function(seriesName, opts) {
                        return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
                    },
                    itemMargin: {
                        horizontal: 5,
                        vertical: 2,
                    },
                },
            };
            return data;
        },
        getContractType() {
            let data = {};
            data.series = this.item.contractType.map(a => +a.count);
            data.chartOptions = {
                chart: {
                    type: "radialBar",
                    toolbar: {
                        show: true,
                    },
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: "17px",
                            },
                            value: {
                                formatter: function(val) {
                                    return val;
                                },
                                fontSize: "22px",
                            },
                            total: {
                                show: true,
                                label: "Total",
                                formatter: function(w) {
                                    return w.config.series.reduce((a, b) => a + b);
                                },
                            },
                            track: {
                                background: "#fff",
                                strokeWidth: "67%",
                                margin: 0, // margin is in pixels
                                dropShadow: {
                                    enabled: true,
                                    top: -3,
                                    left: 0,
                                    blur: 4,
                                    opacity: 0.35,
                                },
                            },
                            dataLabels: {
                                name: {
                                    show: true,
                                },
                                value: {
                                    show: true,
                                },
                            },
                        },
                    },
                },
                labels: this.item.contractType.map(a => humanize(a.contract_type)),
                legend: {
                    show: true,
                    floating: true,
                    fontSize: "12px",
                    position: "bottom",
                    offsetX: -30,
                    offsetY: 0,
                    labels: {
                        useSeriesColors: true,
                    },
                    markers: {
                        size: 0,
                    },
                    formatter: function(seriesName, opts) {
                        return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
                    },
                    itemMargin: {
                        horizontal: 3,
                    },
                },
            };
            return data;
        },
        getContractStatus(status) {
            let data = {};
            data.total = this.item.contractStatus;
            data.chartOptions = {
                chart: {
                    type: "radialBar",
                    toolbar: {
                        show: true,
                    },
                },
                colors: ["#20E647"],
                plotOptions: {
                    radialBar: {
                        startAngle: -135,
                        endAngle: 225,
                        hollow: {
                            margin: 0,
                            size: "70%",
                            background: "#fff",
                            image: undefined,
                            imageOffsetX: 0,
                            imageOffsetY: 0,
                            position: "front",
                            dropShadow: {
                                enabled: true,
                                top: 3,
                                left: 0,
                                blur: 4,
                                opacity: 0.24,
                            },
                        },
                        track: {
                            background: "#fff",
                            strokeWidth: "67%",
                            margin: 0, // margin is in pixels
                            dropShadow: {
                                enabled: true,
                                top: -3,
                                left: 0,
                                blur: 4,
                                opacity: 0.35,
                            },
                        },
                        dataLabels: {
                            show: true,
                            name: {
                                offsetY: -10,
                                show: true,
                                color: "#888",
                                fontSize: "17px",
                            },
                            value: {
                                formatter: function(val) {
                                    return parseInt(val);
                                },
                                color: "#111",
                                fontSize: "22px",
                                show: true,
                            },
                        },
                    },
                },
                stroke: {
                    lineCap: "round",
                },
                labels: [status.toUpperCase()],
            };
            if (status == "approved") {
                data.series = this.item.contractStatus.map(a => +a.approved_count);
                data.title = `${status} Contract`;
                data.chartOptions.colors = ["#20E647"];
            }
            if (status == "pending") {
                data.series = this.item.contractStatus.map(a => +a.pending_count);
                data.title = `${status} Contract`;
                data.chartOptions.colors = ["#ffc107"];
            }
            if (status == "rejected") {
                data.series = this.item.contractStatus.map(a => +a.rejected_count);
                data.title = `${status} Contract`;
                data.chartOptions.colors = ["#dc3545"];
            }
            return data;
        },
        getMonthlyContractRegistration(type) {
            let data = {};
            let categories = [];
            if (
                this.item.monthlyContractCreated &&
                this.item.monthlyContractCreated[type] &&
                this.item.monthlyContractCreated[type].length
            ) {
                let sixMonthData = this.item.monthlyContractCreated[type].slice(0, 6);
                categories = this.item.monthlyContractCreated.erp
                    .map(a => a.Date)
                    .concat(this.item.monthlyContractCreated.vms.map(a => a.createdAt));

                categories = categories.slice(0, 6);
                categories = uniq(categories);
                data.series = [
                    {
                        name: "Food",
                        data: sixMonthData.map(a => +a.Food),
                    },
                    {
                        name: "Non-Food",
                        data: sixMonthData.map(a => +a.NonFood),
                    },
                    {
                        name: "Beverages",
                        data: sixMonthData.map(a => +a.Beverage),
                    },
                ];
            } else {
                data.series = [];
            }
            data.chartOptions = {
                chart: {
                    type: "bar",
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "55%",
                        endingShape: "rounded",
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ["transparent"],
                },
                xaxis: {
                    categories: categories,
                },
                yaxis: {
                    title: {
                        text: "Contacts",
                    },
                },
                fill: {
                    opacity: 1,
                },
                tooltip: {
                    y: {
                        formatter: function(val) {
                            return " " + val + " Vendor";
                        },
                    },
                },
            };
            return data;
        },
        getExpiredContractCategoryTotal() {
            const data = this.item.expiredContractCategoryWise.map(a => +a.totalcount);
            return data.reduce((a, b) => a + b);
        },
        getErpVmsDifference() {
            let data = {};

            let categories = this.item.monthlyContractCreated.erp
                .map(a => a.Date)
                .concat(this.item.monthlyContractCreated.vms.map(a => a.createdAt));
            categories = uniq(categories);

            (data.series = [
                {
                    name: "VMS",
                    data: this.item.monthlyContractCreated.vms.map(a => +a.total),
                },
                {
                    name: "ERP  ",
                    data: this.item.monthlyContractCreated.erp.map(a => +a.total),
                },
            ]),
                (data.chartOptions = {
                    chart: {
                        type: "bar",
                        toolbar: {
                            show: true,
                            tools: {
                                download: true,
                                selection: true,
                                zoom: false,
                                zoomin: false,
                                zoomout: false,
                                pan: false,
                                // reset: false | '<img src="/static/icons/reset.png" width="20">',
                                customIcons: [],
                            },
                        },
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: "55%",
                            endingShape: "rounded",
                        },
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ["transparent"],
                    },
                    xaxis: {
                        categories: categories,
                        title: {
                            text: "ERP / VMS",
                        },
                    },
                    yaxis: {
                        title: {
                            text: "Contracts",
                        },
                    },
                    fill: {
                        opacity: 1,
                        // colors: ['#00e396']
                    },
                    tooltip: {
                        y: {
                            formatter: function(val) {
                                return " " + val + " Contract";
                            },
                        },
                    },
                });
            return data;
        },
        getApprovedContract() {
            let data = {};
            data.series = [
                {
                    name: "Contract Approved",
                    data: this.filteredApprovedContract.map(a => +a.contractcount),
                },
            ];
            data.chartOptions = {
                chart: {
                    type: "line",
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                            // reset: false | '<img src="/static/icons/reset.png" width="20">',
                            customIcons: [],
                        },
                    },
                },
                stroke: {
                    width: 7,
                    curve: "smooth",
                },
                xaxis: {
                    // type: "datetime",
                    categories: this.filteredApprovedContract.map(a => a.createdAt),
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        gradientToColors: ["#FDD835"],
                        shadeIntensity: 1,
                        type: "horizontal",
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100, 100, 100],
                    },
                },
                markers: {
                    size: 4,
                    colors: ["#FFA41B"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7,
                    },
                },
                yaxis: {
                    title: {
                        text: "Contract ",
                    },
                },
            };
            return data;
        },
        filterApprovedContract(command) {
            this.selectedContractApproved = command;
            this.filteredApprovedContract = this.item.approvedContract[command];
            this.getApprovedContract();
        },
        getTotalApprovedContractCount() {
            if (!this.item.approvedContract) return "0";
            const keys = Object.keys(this.item.approvedContract);

            if (keys && !keys.length) return "0";

            let data = [];
            if (
                this.item.approvedContract[this.selectedContractApproved] &&
                !this.item.approvedContract[this.selectedContractApproved].length
            )
                return "0";
            this.item.approvedContract[this.selectedContractApproved].map(a => {
                data.push(+a.contractcount);
            });
            return data.reduce((a, b) => a + b);
        },
        getTotalVMSContract() {
            if (
                this.item.monthlyContractCreated &&
                this.item.monthlyContractCreated.vms &&
                this.item.monthlyContractCreated.vms.length
            )
                return this.item.monthlyContractCreated.vms.map(a => +a.total).reduce((a, b) => a + b);
            return "0";
        },
        getTotalERPContract() {
            if (
                this.item.monthlyContractCreated &&
                this.item.monthlyContractCreated.erp &&
                this.item.monthlyContractCreated.erp.length
            )
                return this.item.monthlyContractCreated.erp.map(a => +a.total).reduce((a, b) => a + b);
            return "0";
        },
        getTotalMonthlyCategoryWiseContractVMS() {
            if (
                this.item.monthlyContractCreated &&
                this.item.monthlyContractCreated.vms &&
                this.item.monthlyContractCreated.vms.length
            )
                return this.item.monthlyContractCreated.vms.map(a => a.total).reduce((a, b) => a + b);
            return "0";
        },
        getTotalMonthlyCategoryWiseContractERP() {
            if (
                this.item.monthlyContractCreated &&
                this.item.monthlyContractCreated.erp &&
                this.item.monthlyContractCreated.erp.length
            )
                return this.item.monthlyContractCreated.erp.map(a => a.total).reduce((a, b) => a + b);
            return "0";
        },
    },
    // watch: {
    //     item(val) {
    //         if (!val.expiringContract) return;
    //         this.filteredContract = this.item.expiringContract;
    //         this.filteredApprovedContract = this.item.approvedContract.yearly;
    //     },
    // },
};
</script>

<template lang="pug">
.container.mb-4(v-if="item")
    .row
        .col-sm-12
            el-card.box-card
                h5.card-title.text-left Monthly difference ERP vs VMS
                .inline-block.ml-3
                    h4.text-left.mb-0
                        strong {{ getTotalVMSContract() }}
                    p.text-left.text-muted.txt-12.font-weight-400 Total VMS 
                .inline-block.ml-3
                    h4.text-left.mb-0
                        strong {{ getTotalERPContract() }}
                    p.text-left.text-muted.txt-12.font-weight-400 Total ERP
                bar-chart(height="300px",:data="getErpVmsDifference()")
    .row.mt-3
        .col-sm-4        
            el-card.box-card
                h5.card-title.text-left Expired Contract Category Wise
                //- h4.text-left.mb-0
                //-     strong {{ getExpiredContractCategoryTotal() }}
                //- p.text-left.text-muted.txt-12.font-weight-400 Total
                radial-chart( height="200px",:data="getExpiredContractCategory()")
        .col-sm-4        
            el-card.box-card
                h5.card-title.text-left Contract Type
                //- h4.text-left.mb-0
                //-     strong {{ item.contractType.reduce((a, b) => +a.count + +b.count) }}
                //- p.text-left.text-muted.txt-12.font-weight-400 Total
                radial-chart( height="200px",:data="getContractType()")
        .col-sm-4
            el-card.box-card
                h5.card-title.text-left Contacts Available 
                //- h4.text-left.mb-0
                //-     strong 125
                //- p.text-left.text-muted.txt-12.font-weight-400 Total   
                radial-chart( height="200px",:data="getAvailableContract()")
    .row.mt-3
        .col-sm-12
            el-card.box-card
                h5.card-title.text-left Contract Status
                //- h4.text-left.mb-0
                //-     strong {{item.contractStatus.map(a => +a.approved_count + +a.pending_count + +a.rejected_count)[0] }}
                //- p.text-left.text-muted.txt-12.font-weight-400 Total
                .row
                    .col-sm-4
                        radial-chart(height="200px", :data="getContractStatus('approved')")
                    .col-sm-4
                        radial-chart(height="200px", :data="getContractStatus('pending')")
                    .col-sm-4
                        radial-chart(height="200px", :data="getContractStatus('rejected')")
        //.col-sm-4
            el-card.box-card
                .pull-right
                    el-dropdown(@command="filterApprovedContract", )
                        el-button(type='primary' size="small")
                            | {{ selectedContractApproved | humanize }}
                            i.el-icon-arrow-down.el-icon--right
                        el-dropdown-menu(slot='dropdown', )
                            el-dropdown-item(v-for="item in contractApprovedFilter", :key="item.value", :command="item.value") {{ item.title }}
                h5.card-title.text-left Approved Contract
                h4.text-left.mb-0
                    strong {{ getTotalApprovedContractCount() }}
                p.text-left.text-muted.txt-12.font-weight-400 Total
                line-chart(height="300px", :data="getApprovedContract()")
    .row.mt-3
        .col-sm-6
            el-card.box-card
                h5.card-title.text-left Number of Contracts(VMS)
                h4.text-left.mb-0(v-if="item.monthlyContractCreated && item.monthlyContractCreated.vms && item.monthlyContractCreated.vms.length")
                    strong {{ getTotalMonthlyCategoryWiseContractVMS() }}
                h4.text-left.mb-0(v-else) 0
                p.text-left.text-muted.txt-12.font-weight-400 Total
                bar-chart(height="250px", :data="getMonthlyContractRegistration('vms')")
        .col-sm-6
            el-card.box-card
                h5.card-title.text-left Number of Contracts(ERP)
                h4.text-left.mb-0(v-if="item.monthlyContractCreated && item.monthlyContractCreated.erp && item.monthlyContractCreated.erp.length")
                    strong {{ getTotalMonthlyCategoryWiseContractERP() }}
                h4.text-left.mb-0(v-else) 0
                p.text-left.text-muted.txt-12.font-weight-400 Total   
                bar-chart(height="250px", :data="getMonthlyContractRegistration('erp')")
    .row.mt-3
        .col-sm-12 
            el-card.box-card   
                .pull-right
                    .inline-block.mb-2
                       // form-field-input(
                            v-model="selectedCategory",
                            input-type="select",
                            :items="mstSuperCategory",
                            @input="filterContract()",
                            label="name",
                            trackBy="id",
                            placeholder="Select Type"
                        )
                        //el-dropdown
                            el-button(type='primary')
                                | Category
                                i.el-icon-arrow-down.el-icon--right
                            el-dropdown-menu(slot='dropdown')
                                el-dropdown-item(v-for="category in mstSuperCategory", :key="category.id", command="filterContract(category.id)" ) {{ category.name | humanize }}
                h5.card-title.text-left.mb-0 Contract Expiring (Next 7 Days) 
                v-data-table.min-height.mt-4(
                    :headers='headers', 
                    :items='item.expiringContract', 
                    :rows-per-page-items="[5]", 
                )
                    template(v-slot:items='props')
                        td {{ props.item.id}}
                        td {{ props.item.vendor_name | humanize}}
                        td {{ props.item.category | humanize}}
                        td {{ props.item.startdate | date-format}}
                        td {{ props.item.enddate | date-format }}
                            //- tag(:items="props.item.roles")
                //el-table(:data='filteredContract', border='', style='width: 100%')
                    el-table-column(prop='id', label='Code')
                    el-table-column(prop='vendor_name', label='Vendor Name')
                    el-table-column(prop='category', label='Category')
                    el-table-column(prop='date', label='Date', style='text-align: right')
</template>

<style lang="scss"></style>
