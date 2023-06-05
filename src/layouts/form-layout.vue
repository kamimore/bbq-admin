<script>
import SlotMixin from "@mixins/slot";

export default {
    name: "FormLayout",
    mixins: [SlotMixin],
};
</script>

<template lang="pug">
div
    section.login-page-bg
        .over-lay
        .container.login-background
            .row.justify-content-md-center
                .card-wrapper
                    .card.login
                        .text-center.pt-3.VR
                            img(src="@assets/images/logo.png")
                        .card-body
                            slot(name='body',v-if="hasSlot('body')")
</template>

<style lang="scss">
@import "@design/common.scss";
@import "@design/pages/login/_login.scss";

.over-lay{
    background-image: url("../assets/images/login-bg.jpg");
    background-size: cover;
}
.register section.login-page-bg .over-lay {
    background-image: url("../assets/images/login-bg1.jpg") !important;
    background-size: cover;
}
.v-otp-password section.login-page-bg .over-lay
{
    background-image: url("../assets/images/login-bg.jpg") !important;
    background-size: cover;
}
</style>
