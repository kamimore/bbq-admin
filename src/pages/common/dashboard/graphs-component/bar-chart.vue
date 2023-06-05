<script>
export default {
    name: "BarChart",
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
    apexchart(type='bar', :height="height", :options='data.chartOptions', :series='data.series')
</template>
