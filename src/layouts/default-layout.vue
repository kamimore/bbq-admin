<script>
import SlotMixin from "@mixins/slot";
import DashboardHeader from "./components/dashboard-header";
import SideBar from "./components/side-bar";

export default {
    name: "DefaultLayout",
    components: {
        DashboardHeader,
        SideBar,
    },
    mixins: [SlotMixin],
    data() {
        return {
            toggleSideBar: false,
        };
    },
    methods: {},
};
</script>

<template lang="pug">
div
    section.main-bg(:class="toggleSideBar ? 'sidebar-collapse_new' : '' ")
        .main-sidebar.bg-new
            //- .over-lay1
            side-bar(
                :isCollapsed="toggleSideBar"
            )
        .content-wrapper
            dashboard-header(
                @toggleSideBar="toggleSideBar = !toggleSideBar"
            )
            .c-card
                .container
                    .c-card-body(v-if="hasSlot('body')")
                        slot(name='body')
            slideout-panel
</template>

<style lang="scss">
@import "@design/common.scss";
@import "@design/pages/dashboard/_dashboard.scss";
.main-sidebar.bg-new {
    // background-image: url("../../assets/images/sidebar-back.png");
}
.over-lay1 {
    // background: rgba(0, 0, 0, 0.7);
    position: absolute;
    width: 17.6%;
    float: left;
    height: 100%;
    position: fixed;
}
.sidebar-collapse_new .over-lay1 {
    width: 4.7%;
}
</style>
