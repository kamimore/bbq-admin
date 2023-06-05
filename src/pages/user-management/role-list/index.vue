<script>
import ManageRole from "./manage-role";
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name: "RoleList",
    mixins: [DatatableSettingMixin],
    components: {
        ManageRole,
    },
    data() {
        return {
            dialog: false,
            mode: "add",
            pagination: {},
            search: null,
            headers: [
                { text: "Role Name", align: "left", value: "name" },
                { text: "Permission", value: "permission" },
                { text: "Actions", value: "actions", sortable: false, align:'right', width:"5%" },
            ],
            totalItems: 0,
            items: [],
            roles: [],
            currentRole: {},
            routeNames: this.$utility.getRoleRoutes(),
            showModal: false,
        };
    },
    async created() {
        this.getData();
    },
    methods: {
        async getData() {
            this.isLoading = true;
            const query = {
                where: {
                    name: {
                        $notIn: ["erp_user", "superadmin"],
                    },
                },
            };

            this.items = await this.$http.get("role", query);
            this.isLoading = false;
        },
        manageRole(type, role = {}) {
            this.currentRole = role;
            this.mode = type;
            this.showModal = true;
            this.$refs.manage_role_modal.open();
        },
        async creatOrUpdate(data) {
            try {
                await this.$http.updateOrCreate("role", data);

                const successMessage = data.id ? "Role successfully updated" : "Role successfully created";

                this.$utility.showSucessMessage(successMessage);

                this.$refs.manage_role_modal.close();
                this.getData();
            } catch (err) {
                // const msg = err.object.message || err.message;
                this.$utility.showErrorMessage('Role must be unique');
            }
        },
        async deleteRole(id) {
            this.$confirm("Are you sure you want to delete?", "Delete Role", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                await this.$http.updateById("role", id, { isDeleted: true });
                this.getData();
            });
        },
        parsePermission(routes) {
            if ((routes && !routes.length) || !this.routeNames) return [];

            return this.routeNames
                .filter(r => routes.includes(r.value))
                .map(r => r.name)
                .join(", ");
        },
    },
};
</script>

<template lang="pug">
v-app
    div.que-category-border.custom-shadow
        v-toolbar.pb-3.pt-2(flat, color='white')
            v-text-field.custon-search-input(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
            v-spacer
            v-btn.mb-2.bbq-btn-primary( dark, @click="manageRole('add')") Add Role
        v-data-table.m-r-table.table-shadow(
            :headers='headers', 
            :search="search", 
            :items='items', 
            :rows-per-page-items="[10]",
            :loading="isLoading", 
            :no-data-text="loaderText"
        )
            template(v-slot:items='{ item }')
                td {{item.label}}
                td  {{ parsePermission(item.permission) }}
                td.text-right
                    v-icon.mr-2.far.fa-edit(small, @click="manageRole('edit',item)")
    sweet-modal(
        ref="manage_role_modal",
        width="35%",
        overlay-theme="dark",
    )
        manage-role(
            :currentRole="currentRole",
            :mode="mode",
            @action="creatOrUpdate",
        )
</template>

<style lang="scss">
</style>