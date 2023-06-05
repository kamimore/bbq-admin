<script>
export default {
    name: "RadialChart",
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
#chart
    apexchart(type='radialBar', :height="height", :options='data.chartOptions', :series='data.series')
</template>

