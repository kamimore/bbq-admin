<script>
import DLayout from '@layouts/default-layout'

export default {
    name: 'UserManagement',
    components: {
        DLayout,
    },
}
</script>

<template lang="pug">
d-layout
    template(slot='body')
        router-view(:key="$route.fullPath")
</template>

<style lang="scss">
</style>
