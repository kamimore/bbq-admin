<script>
export default {
    name: "ApproveCategoryModal",
    props: {
        approvalRequests: {
            type: Array,
            default: () => [],
        },
        defaultStatus: {
            type: String,
            default: "approved",
        },
    },
    data() {
        return {
            comment: "",
            statuses: [{ label: "Approve", value: "approved" }, { label: "Reject", value: "rejected" }],
            loggedInUser: this.$store.getters["account/getUser"],
        };
    },
    methods: {
        submit() {
            this.$emit("action", { items: this.items, comment: this.comment });
        },
    },
    computed: {
        items() {
            const superCategoryRequests = this.approvalRequests.filter(
                r => r.assignedToId == this.loggedInUser.id && r.status === "pending",
            );
            const requestsCopy = this.$lodash.cloneDeep(superCategoryRequests);
            return requestsCopy.map(r => {
                r.status = this.defaultStatus;
                return r;
            });
        },
    },
};
</script>

<template lang="pug">
form.category-approval.row(@submit.prevent="submit()")
    .col-sm-12
        .title-style-1.text-barbique Approve/Reject Category
    .sweet-modal-max-height
        .container-fluid
            .row
                .col-sm-12(v-for="item of items")
                    .row
                        .col-sm-3
                            span {{ item.MstSuperCategory ? item.MstSuperCategory.name  : '-'}}
                        .col-sm-5
                            v-radio-group(v-model="item.status", name="rowSelector", :column="false")
                                v-radio(v-for="{ label, value } of statuses", :key="value", :value ="value", :label="label") 
                .col-sm-12
                    form-field(
                        v-model="comment",
                        attribute="Comment",
                        input-type="textarea",
                        label='Comment',
                        :required="true",
                        placeholder="Please enter a comment",
                        :maxLength="250"
                    )
    .col-sm-12
        .text-right
            button.btn.btn-primary.bbq-btn-primary Submit
</template>
<style lang="scss" scoped>
.category-approval .v-input--selection-controls {
    margin-top: 0;
    padding-top: 4px;
}
.category-approval .v-input--selection-controls label.v-label {
    font-size: 14px !important;
}
.category-approval .v-input--selection-controls .accent--text {
    color: #ebb035 !important;
    caret-color: #ebb035 !important;
}
</style>