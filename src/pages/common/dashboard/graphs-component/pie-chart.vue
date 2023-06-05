<script>
export default {
    name: "VendorPie",
    props: {
        data: {
            type: Object,
            default: () => {},
        },
        height: {
            type: String,
            default: "215",
        },
    },
};
</script>

<template lang="pug">
el-card.box-card(v-if="data")
    h5.card-title.text-left {{data.title}}
    h4.text-left.mb-0
        strong {{data.total}}
    p.text-left.text-muted.txt-12.font-weight-400 Total
    #chart.vendor-category
        apexchart(type='pie', :height="height", :options='data.chartOptions', :series='data.series')
</template>
