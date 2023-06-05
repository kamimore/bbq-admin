<script>
import PieChart from "../graphs-component/pie-chart";
import RadialChart from "../graphs-component/radial-chart";
import BarChart from "../graphs-component/bar-chart";
import LineChart from "../graphs-component/line-chart";
import { uniq } from "lodash";

export default {
    name: "vendor",
    components: {
        PieChart,
        RadialChart,
        BarChart,
        LineChart,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            totalVendor: 0,
            filteredApprovedVendor: [],
            filteredRegisteredVendor: [],
            vendorApprovedFilter: [
                { title: "Week", value: "weekly" },
                { title: "Month", value: "monthly" },
                { title: "Year", value: "yearly" },
            ],
            selectedRegisteredVendor: "weekly",
            selectedApprovedVendor: "weekly",
        };
    },
    watch: {
        item(val) {
            if (!val.approvedVendor) return;
            this.filteredApprovedVendor = this.item.approvedVendor.weekly;
            this.filteredRegisteredVendor = this.item.vendorRegistered.weekly;
        },
    },
    methods: {
        getVendorCategoryWise() {
            let data = { title: "Vendor Category Wise" };

            let totalVendorCount = this.item.vendorCategoryWise.map(a => +a.total).reduce((a, b) => a + b);
            // totalVendorCount = totalVendorCount.reduce((a, b) => a + b);
            this.totalVendor = totalVendorCount;
            const labels = this.item.vendorCategoryWise.map(a => a.name);

            data.total = totalVendorCount;
            data.series = this.item.vendorCategoryWise.map(a => +a.total);
            data.chartOptions = {
                chart: {
                    width: 400,
                    type: "pie",
                    toolbar: {
                        show: true,
                    },
                },
                labels: labels,
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200,
                            },
                            legend: {
                                position: "bottom",
                            },
                        },
                    },
                ],
            };
            return data;
        },
        getVendorGroupWise() {
            let data = {};

            const labels = this.item.vendorGroupWise.map(a => a.code);
            let totalVendorCount = this.item.vendorGroupWise.map(a => +a.total);
            totalVendorCount = totalVendorCount.reduce((a, b) => a + b);

            data.title = "Vendor Posting Group Wise";
            data.total = totalVendorCount;
            data.series = this.item.vendorGroupWise.map(a => +a.total);
            data.chartOptions = {
                chart: {
                    width: 500,
                    type: "pie",
                    toolbar: {
                        show: true,
                    },
                },
                labels: labels,
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200,
                            },
                            legend: {
                                position: "bottom",
                            },
                        },
                    },
                ],
            };
            return data;
        },
        getVendorStatus(status) {
            let data = {};
            data.total = this.item.vendorStatus;
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
                data.series = this.item.vendorStatus.map(a => a.approved_count);
                data.title = `${status} Vendor`;
                data.chartOptions.colors = ["#20E647"];
            }
            if (status == "pending") {
                data.series = this.item.vendorStatus.map(a => a.pending_count);
                data.title = `${status} Vendor`;
                data.chartOptions.colors = ["#ffc107"];
            }
            if (status == "rejected") {
                data.series = this.item.vendorStatus.map(a => a.rejected_count);
                data.title = `${status} Vendor`;
                data.chartOptions.colors = ["#dc3545"];
            }
            return data;
        },
        getVendorAvailable() {
            let data = {};
            data.series = [+this.item.vendorAvailablePercent];
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
                                    return `${ val > 100 ?  '100%' : val.toFixed(1)}%`;
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
            };
            return data;
        },
        getMonthlyVendorCategories() {
            let labels = this.item.monthlyVendorRegistration.vms
                .map(a => a.createdAt)
                .concat(this.item.monthlyVendorRegistration.erp.map(a => a.createdAt));

            return uniq(labels);
        },
        getTotalRegisteredVMS() {
            if (
                this.item.monthlyVendorRegistration &&
                this.item.monthlyVendorRegistration.vms &&
                !this.item.monthlyVendorRegistration.vms.length
            )
                return "0";
            let count = this.item.monthlyVendorRegistration.vms.map(a => +a.monthlycount);
            return count.reduce((a, b) => a + b);
        },
        getTotalRegisteredERP() {
            if (
                this.item.monthlyVendorRegistration &&
                this.item.monthlyVendorRegistration.erp &&
                !this.item.monthlyVendorRegistration.erp.length
            )
                return "0";
            let count = this.item.monthlyVendorRegistration.erp.map(a => +a.monthlycount);
            return count.reduce((a, b) => a + b);
        },
        getMonthlyVendorRegistration() {
            let data = {};
            data.series = [
                {
                    name: "VMS",
                    data: this.item.monthlyVendorRegistration.vms.map(a => +a.monthlycount),
                },
                {
                    name: "ERP",
                    data: this.item.monthlyVendorRegistration.erp.map(a => +a.monthlycount),
                },
            ];
            data.chartOptions = {
                chart: {
                    type: "bar",
                    // height: 150,
                    toolbar: {
                        show: true,
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
                    categories: this.getMonthlyVendorCategories(),
                    title: {
                        text: "Months",
                    },
                },
                yaxis: {
                    title: {
                        text: "Vendor",
                    },
                },
                fill: {
                    opacity: 1,
                    // colors: ['#00e396']
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
        getTotalVendorStatusCount() {
            if (this.item.vendorStatus && !this.item.vendorStatus.length) return "0";
            return (
                +this.item.vendorStatus[0].approved_count +
                +this.item.vendorStatus[0].pending_count +
                +this.item.vendorStatus[0].rejected_count
            );
        },
        getApprovedVendor() {
            let data = {};
            data.series = [
                {
                    name: "Vendor Approved",
                    data: this.filteredApprovedVendor.map(a => +a.vendorcount),
                },
            ];
            data.chartOptions = {
                chart: {
                    type: "line",
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
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
                    categories: this.filteredApprovedVendor.map(a => a.createdAt),
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
                        text: "Vendor ",
                    },
                },
            };
            return data;
        },
        getRegisteredVendor() {
            let data = {};
            data.series = [
                {
                    name: "Vendor Registered",
                    data: this.filteredRegisteredVendor.map(a => +a.vendorcount),
                },
            ];
            data.chartOptions = {
                chart: {
                    type: "line",
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
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
                    categories: this.filteredRegisteredVendor.map(a => a.createdAt),
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
                        text: "Vendor ",
                    },
                },
            };
            return data;
        },
        getTotalApprovedVendorCount() {
            if (!this.item.approvedVendor) return "0";
            if (
                this.item.approvedVendor &&
                this.item.approvedVendor[this.selectedApprovedVendor] &&
                this.item.approvedVendor[this.selectedApprovedVendor].length
            )
                return this.item.approvedVendor[this.selectedApprovedVendor]
                    .map(a => +a.vendorcount)
                    .reduce((a, b) => a + b);

            return "0";
        },
        getTotalRegisteredVendorCount() {
            if (!this.item.vendorRegistered) return "0";

            if (
                this.item.vendorRegistered &&
                this.item.vendorRegistered[this.selectedRegisteredVendor] &&
                this.item.vendorRegistered[this.selectedRegisteredVendor].length
            )
                return this.item.vendorRegistered[this.selectedRegisteredVendor]
                    .map(a => +a.vendorcount)
                    .reduce((a, b) => a + b);

            return "0";
        },
        fiterRegisteredVendor(command) {
            this.selectedRegisteredVendor = command
            this.filteredRegisteredVendor = this.item.vendorRegistered[command];
            this.getRegisteredVendor();
        },
        fiterApprovedVendor(command) {
            this.selectedApprovedVendor = command
            this.filteredApprovedVendor = this.item.approvedVendor[command];
            this.getApprovedVendor();
        },
    },
};
</script>

<template lang="pug">
.container.mb-4
    .row
        .col-sm-12
            el-card.box-card
                h5.card-title.text-left Vendor Registered (VMS Vs ERP)
                .inline-block.ml-3
                    h4.text-left.mb-0
                        strong {{ getTotalRegisteredVMS() }}
                    p.text-left.text-muted.txt-12.font-weight-400 Total VMS
                .inline-block.ml-3
                    h4.text-left.mb-0
                        strong {{ getTotalRegisteredERP() }}
                    p.text-left.text-muted.txt-12.font-weight-400 Total ERP                        
                bar-chart(height="300px",:data="getMonthlyVendorRegistration()")
    .row.mt-3
        .col-sm-6
            pie-chart(height="250px",:data="getVendorCategoryWise()")
        .col-sm-6
            pie-chart(height="250px",:data="getVendorGroupWise()")      
    .row.mt-3
        .col-sm-8
            el-card.box-card
                h5.card-title.text-left Vendor Status
                //h4.text-left.mb-0
                    strong {{ getTotalVendorStatusCount() }}
                //- p.text-left.text-muted.txt-12.font-weight-400 Total
                .row
                    .col-sm-4
                        radial-chart(height="200px", :data="getVendorStatus('approved')")
                    .col-sm-4
                        radial-chart(height="200px", :data="getVendorStatus('pending')")
                    .col-sm-4
                        radial-chart(height="200px", :data="getVendorStatus('rejected')")
        .col-sm-4
            el-card.box-card
                h5.card-title.text-left Vendor Available 
                //h4.text-left.mb-0
                    strong {{ totalVendor }}
                //- p.text-left.text-muted.txt-12.font-weight-400 Total   
                radial-chart(height="178px", :data="getVendorAvailable()")
    .row.mt-3
        .col-sm-6 
            el-card.box-card
                .pull-right
                    el-dropdown(@command="fiterApprovedVendor")
                        el-button(type='primary', size="small")
                            | {{ selectedApprovedVendor | humanize }}
                            i.el-icon-arrow-down.el-icon--right
                        el-dropdown-menu(slot='dropdown', )
                            el-dropdown-item(v-for="item in vendorApprovedFilter", :key="item.value", :command="item.value") {{ item.title }}
                h5.card-title.text-left Approved Vendor
                h4.text-left.mb-0
                    strong {{ getTotalApprovedVendorCount() }}
                p.text-left.text-muted.txt-12.font-weight-400 Total
                line-chart(height="250px", :data="getApprovedVendor('approved')")
        .col-sm-6      
            el-card.box-card   
                .pull-right
                    el-dropdown(@command="fiterRegisteredVendor")
                        el-button(type='primary', size="small")
                            | {{ selectedRegisteredVendor | humanize }}
                            i.el-icon-arrow-down.el-icon--right
                        el-dropdown-menu(slot='dropdown', )
                            el-dropdown-item(v-for="item in vendorApprovedFilter", :key="item.value", :command="item.value") {{ item.title }}
                h5.card-title.text-left Vendor Onboard
                h4.text-left.mb-0
                    strong {{ getTotalRegisteredVendorCount() }}
                p.text-left.text-muted.txt-12.font-weight-400 Total
                line-chart( height="250px",:data="getRegisteredVendor()")
</template>
