<script>
import { mapGetters } from "vuex";
import moment from "moment";
import DLayout from "@layouts/default-layout";

export default {
    components: {
        DLayout,
    },
    data: () => {
        return {
            notificationDate: "",
            sorting: -1,
            limit: 10,
            currentPage: 1,
        };
    },
    methods: {
        sortingNotifications() {
            if (this.sorting === 1) {
                this.sorting = -1;
            } else {
                this.sorting = 1;
            }
        },
        routes(notification) {
            this.$store.dispatch("auth/userNotificationReaded", notification);
            if (this.isVendor) {
                if (notification.type === "vendor_approval_request_status")
                    return this.$utility.goToPage("vendor.profile");
            }
            if (notification.type === "vendor_registered") {
                this.$utility.goToPage(
                    "vendor.view",
                    {
                        id: notification.payload.vendor.id,
                    },
                    "params",
                );
            } else if (notification.type === "vendor_approval_request") this.$utility.goToPage("vendor.list");
            else if (notification.type === "vendor_approval_request_status") this.$utility.goToPage("vendor.list");
            else if (notification.type === "survey_note_created") this.$utility.goToPage("bd.survey.list");
            else if (notification.type === "contract_created") this.$utility.goToPage("vendor.contract");
            else if (notification.type === "contract_accepted") this.$utility.goToPage("vendor.contract");
            else if (notification.type === "contract_rejected") this.$utility.goToPage("vendor.contract");
            else if (notification.type === "vendor_profile_submitted") this.$utility.goToPage("vendor.view");
            else if (notification.type === "contract_approval_request") this.$utility.goToPage("contract.history");
            else this.$utility.goToPage("vendor.list");
        },
    },
    computed: {
        ...mapGetters("account", ["isVendor"]),
        ...mapGetters("auth", {
            notifications: "getUserNotification",
        }),
        getNotifications() {
            const notification = this.notifications;
            if (this.notificationDate === null || this.notificationDate === "") {
                if (this.currentPage) {
                    return notification.slice(
                        (this.currentPage - 1) * this.limit,
                        (this.currentPage - 1) * this.limit + this.limit,
                    );
                }
            }
            const filteredNotification = [];
            const compareDate = moment(this.notificationDate).format("YYYY-MM-DD");
            this.notifications.forEach(item => {
                if (compareDate === moment(item.created_at).format("YYYY-MM-DD")) {
                    filteredNotification.push(item);
                }
            });
            return filteredNotification;
        },
        totalItems() {
            return this.notifications && this.notifications.length;
        },
    },
};
</script>

<template lang="pug">
d-Layout
    template(slot='body')
        .col-sm-12.pad-0.notificationbg.custom-shadow
            .wrapper-head.bbq-notification.p-3
                h4.noti1.text-left.desktop-view Notifications
                .col-sm-12.mob-view.text-center
                    h2.noti1 Notifications
                form-field.inp-date.text-right.desktop-view(v-model='notificationDate', input-type='date', placeholder='Search With Date', :change='getNotifications')
                .col-sm-12.mob-view.text-center
                     form-field.inp-date.text-right(v-model='notificationDate', input-type='date', placeholder='Search With Date', :change='getNotifications')
                .container-fluids
                    .mt-2(v-if="getNotifications.length")
                        div( v-for='notification in getNotifications')
                            .overflow-hidden(v-bind:class="{'bbqactiveClass':  notification.hasRead, 'bbqnotActive': !notification.hasRead }", :key='notification.id')
                                    div
                                        a(@click="routes(notification)")
                                            .container-fluid
                                                .row.align-items-center
                                                    .col-sm-1
                                                        img.noti-i.pl-1(src="@assets/images/notifi-icon.png")
                                                    .col-sm-8.text-left                                                        
                                                        b-card-text.xl {{notification.message}}
                                                            .notification-mobile
                                                                b-card-sub-title
                                                                | {{notification.created_at | dateFromNow}}
                                                    .col-sm-3.notification-for-desktop.text-right
                                                        b-card-sub-title
                                                            | {{notification.created_at | dateFromNow}}
                        span(v-if="!notificationDate")
                            b-pagination.mt-3(
                                v-model="currentPage"
                                :total-rows="totalItems"
                                :per-page="limit"
                                aria-controls="not"
                                align="center"
                            )
                    .mt-4(v-else) No notification to display.
</template>

<style>
.activeClass {
    background-color: #f9f9ff;
}
.notActive {
    background-color: #e8e8e8 !important;
}
label span.optional {
    display: none;
}
.form-group.light br {
    display: none;
}
/* .form-group {
    margin-bottom: 0px;
} */
.notific {
    border-radius: 5px;
}
.container-fluids {
    display: block;
    width: 100%;
    position: relative;
    float: left;
}
.card-body-p {
    padding: 0px;
    /* background-color: #fff; */
    border-bottom: 1px solid #eceaea;
}
/* .card-body-p:hover {
    background-color: #f0f4f8;
} */
.fa-bell:before {
    content: "\F0F3";
}

i.fa.fa-bell.bell-icons {
    font-size: 40px;
}
p.card-text.xl {
    display: inline-block;
    text-align: left;
    position: relative;
    width: 85%;
}
.noti-2 {
    padding: 7px 10px 5px 37px;
}
img.noti-i {
    width: 100%;
    opacity: 0.6;
}
.inp-date {
    position: relative;
    display: inline-block;
    float: right;
}
.noti1 {
    position: relative;
    display: inline-block;
}
.wrapper-head {
    position: relative;
    display: inline-block;
    width: 100%;
    border-bottom: 1px solid #ddd;
}
.el-input--prefix .el-input__inner {
    line-height: 33px;
    height: 31px;
}
.el-input__prefix,
.el-input__suffix {
    top: -5px;
}
</style>
