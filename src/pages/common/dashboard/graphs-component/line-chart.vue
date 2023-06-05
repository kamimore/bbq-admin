<script>
export default {
    name: "LineChart",
    props: {
        data: {
            type: Object,
            default: () => {}
        },
        height: {
            type: String,
            default: '215'
        }
    },
};
</script>

<template lang="pug">
#chart.vendor-category
    apexchart(type='line', :height="height", :options='data.chartOptions', :series='data.series')
</template>
