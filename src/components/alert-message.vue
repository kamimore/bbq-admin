<script>
export default {
    name: 'AlertMessage',
    props: {
        type: {
            type: String,
            default: 'error', // success, error, warning,info
        },
        message: {
            type: String,
            required: true,
        },
        closable: {
            type: Boolean,
            default: true,
        },
    },
}
</script>

<template lang="pug">
    el-alert(
        v-if="message",
        :title='message',
        :type="type",
        show-icon,
        :closable="closable"
    )
        .float-right
            slot(name="action")
</template>

<style lang="scss">
</style>
