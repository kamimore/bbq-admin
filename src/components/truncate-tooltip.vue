<script>
export default {
    name: 'TruncateTooltip',
    props: {
        content: {
            type: String,
            default: '',
        },
        limit: {
            type: Number,
            default: 10,
        }
    },
}
</script>

<template lang="pug">
div
    el-tooltip.item(v-if="content", :content='content', placement='top', effect="light")
        span {{ content | truncate(limit)}}
    span(v-else) -
</template>
