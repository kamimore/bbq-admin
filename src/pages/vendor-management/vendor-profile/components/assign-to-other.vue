<script>
import { humanize } from "underscore.string";

export default {
    name: "AssignToOther",
    props: {
        assignee: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            data: {
                assigneeUser: null,
                comment: "",
            },
            userId: this.$store.getters["account/getUserId"],
        };
    },
    methods: {
        customLabel({ fullName, employeeCode, sourcingType }) {
            return `${employeeCode} - ${fullName} - ${humanize(sourcingType)}`;
        },
    },
    computed: {
        users() {
            return this.assignee.filter(s => s.id != this.userId);
        },
    },
};
</script>

<template lang="pug">
form.row(@submit.prevent="$emit('assignToOther', data)")
    .col-sm-12
        .title-style-1.text-barbique Assign to Other User
        form-field.dropdown_height(
            v-model="data.assigneeUser",
            attribute="Users",
            input-type="search-select",
            :items="users",
            label='name',
            trackBy='id',
            :required="true",
            placeholder="Search Assignee",
            :custom-label="customLabel",
            noOptionsText="No user found to assign"
        )
        //.col-sm-12
            form-field(
                v-model="data.comment",
                attribute="Comment",
                input-type="textarea",
                label='Comment',
                :required="true",
                placeholder="Please enter a comment"
            )
    .col-sm-12.mt-5
        .text-right
            button.btn.btn-primary.bbq-btn-primary(:disabled="!data.assigneeUser") Submit
</template>

<style lang="scss">
.dropdown_height .multiselect__content-wrapper {
    max-height: 86px !important;
}
</style>

