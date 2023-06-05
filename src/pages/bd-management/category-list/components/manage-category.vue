<script>
import { lowerCase } from "lodash";

export default {
    name: "ManageCategory",
    components: {},
    props: {
        category: {
            type: Object,
            default: () => {},
        },
        roles: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add , edit
        },
    },
    data() {
        return {
            isActive: {},
            selectedRoles: [],
            statuses: [{ label: "Draft", value: false }, { label: "Publish", value: true }],
        };
    },
    methods: {
        save() {
            const questionRoles = this.selectedRoles.map(x => {
                return { roleId: x.id };
            });
            if(!questionRoles.length) return this.$utility.showErrorMessage('Editable by can not be empty');

            Object.assign(this.category, { name: lowerCase(this.category.name), questionRoles });
            this.$emit("action", this.category);
        },
        setRoles(roles) {
            this.selectedRoles = [];

            if (roles && roles.question_category_roles) {
                const catRoleIds = roles.question_category_roles.map(c => c.roleId);
                this.selectedRoles = this.roles.filter(r => catRoleIds.includes(r.id));
            }
        },
    },
    watch: {
        category(val) {
            this.setRoles(val);
        },
    },
};
</script>

<template lang="pug">
div
    form.add-question-category.row(@submit.prevent="save()")
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-QU {{mode | humanize}} Question Category
            //- hr
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            v-model="category.name",
                            attribute="Name",
                            input-type="text",
                            :required="true",
                            :disabled="mode === 'edit'"
                        )
                    .col-sm-12.max-3-drop-down
                        form-field(
                            v-model="selectedRoles",
                            attribute="Editable By",
                            :openDirection="'top'",
                            input-type="search-multiple-select",
                            :items='roles',
                            label='label',
                            :required="true",
                            trackBy='id',
                            placeholder="Search Role",
                        )
        .col-sm-12
            .text-right
                button.btn.btn-primary.bbq-btn-primary.mt-2 {{ mode === 'edit'? 'update' : 'add' | humanize}}
</template>

<style lang="scss">
.max-3-drop-down .multiselect__content-wrapper {
    max-height: 110px !important;
    border: 1px solid #cccccc !important;
}
.max-3-drop-down .multiselect__option {
    display: block;
    padding: 8px 12px;
    min-height: 36px;
    line-height: 16px;
    text-decoration: none;
    text-transform: none;
    vertical-align: middle;
    position: relative;
    cursor: pointer;
    white-space: nowrap;
}
</style>
