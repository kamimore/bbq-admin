<script>
import Multiselect from "vue-multiselect";

export default {
    name: "ManageRole",
    components: {
        Multiselect,
    },
    props: {
        currentRole: {
            type: Object,
            default: () => {},
        },
        mode: {
            type: String,
            default: "add", // add , edit
        },
    },
    data() {
        return {
            selectedPermission: [],
            permission: this.$utility.getRoleRoutes(),
            label: "",
        };
    },

    methods: {
        save() {
            const permission = this.selectedPermission ? this.selectedPermission.map(x => x.value) : [];

            if (this.mode === "add") {
                this.currentRole.name = this.label.toLowerCase();
            }

            if (!permission.length) return this.$utility.showErrorMessage("Permission can not be empty");

            Object.assign(this.currentRole, { permission, label: this.label });

            this.$emit("action", this.currentRole);
        },
    },
    watch: {
        currentRole(val) {
            if (!val) return [];

            if (this.mode == "add") {
                this.selectedPermission = null;
                this.label = "";
            }

            this.label = val.label;
            if (this.permission && this.permission.length) {
                this.label = val.label;
                this.selectedPermission = this.permission.filter(
                    r => val.permission && val.permission.includes(r.value),
                );
            }
        },
    },
};
</script>

<template lang="pug">
div
    form.manage-role.row(@submit.prevent="save()")
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-AV {{mode | humanize}} Role
            //- hr
        .sweet-modal-max-height
            .container-fluid
                .row
                    .col-sm-12
                        form-field(
                            v-model="label",
                            attribute="Name",
                            input-type="text",
                            label='roleName',
                            placeholder="Name"
                            :required="true",
                            :disabled="false"
                        )
                    .col-sm-12
                        form-field(
                            v-model="selectedPermission",
                            inputType="search-multiple-select"
                            attribute="Permission",
                            :items= 'permission',
                            label='name',
                            openDirection="top",
                            :required="true",
                            trackBy='value',
                            placeholder="Search permission",
                            :showClearAll="true",
                            @clearAll="selectedPermission = []"
                        )
        .col-sm-12
            .text-right
                button.btn.btn-primary.bbq-btn-primary {{ mode === 'edit' ? 'Update' : 'Add'}}
</template>

<style lang="scss">
</style>
