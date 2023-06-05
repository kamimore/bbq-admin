<script>
import FormLayout from '@layouts/form-layout'

export default {
    name: 'VerifyEmail',
    components: {
        FormLayout,
    },
    data() {
        return {
            loading: true,
            message: '',
            isError: false,
        };
    },
    async created() {
        try {
            await this.$http.getWithoutHeaders(`/verify-email/${this.$route.params.token}`)
            this.message = 'You have successfully registered with us.'
            this.loading = false
        } catch (err) {
            this.message = err.message
            this.loading = false
            this.isError = true
        }
    },
}
</script>

<template lang="pug">
.text-center
    .svg-box(v-if="!isError && !loading")
        svg.circular.green-stroke
            circle.path(cx='75', cy='75', r='50', fill='none', stroke-width='5', stroke-miterlimit='10')
        svg.checkmark.green-stroke
            g(transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)')
                path.checkmark__check(fill='none', d='M616.306,283.025L634.087,300.805L673.361,261.53')
    .svg-box(v-if="isError && !loading",)
        svg.circular.red-stroke
            circle.path(cx='75', cy='75', r='50', fill='none', stroke-width='5', stroke-miterlimit='10')
        svg.cross.red-stroke
            g(transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)')
                path.first-line(d='M634.087,300.805L673.361,261.53', fill='none')
            g(transform='matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)')
                path.second-line(d='M634.087,300.805L673.361,261.53')
    p {{message}}
    link-inline(
        v-if="!isError && !loading",
        :route="'login'",
        label='Click here to Sign in.'
    )
</template>

<style lang="scss">
@import '@design/common.scss';
@import '@design/pages/login/_login.scss';
@import '@design/pages/dashboard/_dashboard.scss';
@import '@design/component/_animated-cross-check-icon.scss';
</style>
