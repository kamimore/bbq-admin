<script>
import { humanize } from 'underscore.string'

export default {
    name: 'FormLabel',
    props: {
        labelClass: {
            type: String,
            required: false,
        },
        attribute: {
            type: String,
            required: false,
        },
        label: {
            type: String,
            required: false,
        },
        showLabel: {
            type: Boolean,
            required: false,
            default: false,
        },
        required: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    data () {
        return {
            labelText: this.label || humanize(this.attribute),
        }
    },
}
</script>

<template lang="pug">
label(v-if="showLabel", :class="labelClass") {{ labelText }}
    span.optional(v-if="!required") &nbsp;
</template>

<style lang="scss">
.optional {
    color: gray;
}
</style>
