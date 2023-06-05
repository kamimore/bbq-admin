<script>
import { humanize } from "underscore.string";
import ManageUser from "./manage-user";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "UserList",
    mixins: [DatatableSettingMixin],
    components: {
        ManageUser,
    },
    data() {
        return {
            dialog: false,
            mode: "add",
            currentCategory: {},
            pagination: {},
            search: null,
            headers: [
                { text: "User Name", value: "userName" },
                { text: "Name", align: "left", value: "fullName" },
                { text: "Role", value: "role.label" },
                { text: "Sourcing Type", value: "sourcingType" },
                { text: "Super Category", value: "superCategory" },
                { text: "Region", value: "region" },
                { text: "Actions", value: "actions", sortable: false, align: "center", width: "10%" },
            ],
            items: [],
            roles: [],
            regions: [],
            areas: [],
            selectedUser: null,
            superCategories: [],
            users: [],
            isScriptLoading: false,
        };
    },
    async created() {
        this.getData();
        [this.roles, this.superCategories, this.regions, this.areas, this.users] = await Promise.all([
            this.$http.get("role", {
                where: {
                    name: {
                        $notIn: ["superadmin"],
                    },
                },
            }),
            this.$http.get("mst-super-category"),
            this.$http.get("mst-region"),
            this.$http.get("mst-area"),
            // this.$http.get("user", {
            //     where: {
            //         roleId: {
            //             $eq: 0,
            //         },
            //         userType: "employee",
            //     },
            //     attributes: ["id", "fullName", "userName", "employeeCode"],
            // }),
            this.$http.rawPost("user/get", {
                where: {
                    $or: [{
                        roleId: {
                            $eq: 0,
                        },
                    }, {
                        roleId: {
                            $eq: null,
                        },
                    }],
                    userType: "employee",
                },
                attributes: ["id", "fullName", "userName"],
            }),
        ]);
    },
    methods: {
        async getData() {
            this.isLoading = true;
            const query = {
                attributes: ["id", "fullName", "userName" , "phone", "sourcingType"],
                include: [
                    {
                        model: "Role",
                        where: {
                            name: {
                                $notIn: ["superadmin"],
                            },
                        },
                    },
                    {
                        model: "UserArea",
                    },
                    {
                        model: "UserRegion",
                        include: [
                            {
                                model: "MstRegion",
                            },
                        ],
                    },
                    {
                        model: "UserSuperCategory",
                        include: [
                            {
                                model: "MstSuperCategory",
                            },
                        ],
                    },
                ],
            };

            const data = await this.$http.get("user", query);

            this.items = data.map(u => {
                u.region = [];
                u.superCategory = [];
                if (u && u.UserRegions && u.UserRegions.length) {
                    u.region = u.UserRegions.filter(o => o.MstRegion && o.MstRegion.name).map(o => o.MstRegion.name);
                    // .join(", ");
                }
                if (u && u.UserSuperCategories && u.UserSuperCategories.length) {
                    u.superCategory = u.UserSuperCategories.filter(
                        s => s.MstSuperCategory && s.MstSuperCategory.name,
                    ).map(s => s.MstSuperCategory.name);
                    // .join(", ");
                }
                return u;
            });
            this.isLoading = false;
        },
        async creatOrUpdate(data) {
            this.users = this.users.filter(x => x.id !== data.userId);
            try {
                if (this.selectedUser && this.selectedUser.UserAreas && this.selectedUser.UserAreas.length > 0) {
                    await this.$http.bulkDelete("user-area", this.selectedUser.UserAreas);
                }

                if (this.selectedUser && this.selectedUser.UserRegions && this.selectedUser.UserRegions.length > 0) {
                    await this.$http.bulkDelete("user-region", this.selectedUser.UserRegions);
                }

                if (
                    this.selectedUser &&
                    this.selectedUser.UserSuperCategories &&
                    this.selectedUser.UserSuperCategories.length
                ) {
                    await this.$http.bulkDelete("user-super-category", this.selectedUser.UserSuperCategories);
                }

                if (data && data.areas && data.areas.length > 0) {
                    const areas = data.areas.map(el => ({ userId: data.userId, areaId: el.id }));
                    await this.$http.bulkCreate("user-area", areas);
                }

                if (data && data.regions && data.regions.length > 0) {
                    const regions = data.regions.map(el => ({ userId: data.userId, regionId: el.id }));
                    await this.$http.bulkCreate("user-region", regions);
                }
                if (data && data.superCategories) {
                    const userSuperCategoryId = data.superCategories;
                    userSuperCategoryId.forEach(async id => {
                        await this.$http.rawPost("user-super-category", {
                            userId: data.userId,
                            superCategoryId: id,
                        });
                    });
                }
                await this.$http.updateById("user", data.userId, {
                    roleId: data.roleId,
                    sourcingType: data.sourcingType,
                });

                this.$utility.showSucessMessage("Success");
                this.$refs.manage_role_modal.close();
                this.getData();
            } catch (err) {
                this.$utility.showErrorMessage(humanize(err.message));
            }
        },
        manageUser(type, user = {}) {
            this.mode = type;
            this.selectedUser = user;
            this.$refs.manage_role_modal.open();
        },
        async deleteUser(userId) {
            const message = `Are you sure you want to delete?`;

            this.$confirm(message, "Delete User", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                await this.$http.updateById("user", userId, { roleId: 0, sourcingType: null });
                this.$utility.showSucessMessage("User deleted successfully");
                this.getData();
                const deletedUser = this.items.find(a => a.id === userId);
                deletedUser.roleId = 0;
                this.users.push(deletedUser);
            });
        },
        async stealthLogin(userId) {
            try {
                this.$Progress.start();
                const result = await this.$http.rawPost("stealth-login", { userId });
                console.log("result", result);
                this.$store.dispatch("auth/login", result);
                this.$Progress.finish();
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
                this.$Progress.finish();
            }
        },
        async fetchERPData() {
            try {
                this.isScriptLoading = true;
                this.$utility.showSucessMessage('Script has started runnning.It may take few minutes to complete');
                const result = await this.$http.get("fetch-erp-data");
                console.log("result", result);
                this.$utility.showSucessMessage(result.message);
                this.isScriptLoading = false;
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
};
</script>

<template lang="pug">
v-app.custom-shadow
    div.que-category-border
        v-toolbar.pt-2.pb-3(flat, color='white')
            v-text-field(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
            v-spacer
            v-btn.mb-2(
                color="primary",
                :loading="isScriptLoading", 
                :disabled="isScriptLoading",
                @click="fetchERPData()"
            ) Fetch ERP Data
            v-btn.mb-2.bbq-btn-primary(dark, @click="manageUser('add')") Add User
        v-data-table.user-li-table.table-shadow(
            :headers='headers', 
            :search="search", 
            :items='items', 
            :rows-per-page-items="[10]",
            :loading="isLoading", 
            :no-data-text="loaderText"
        )
            template(v-slot:items='{ item }')
                td {{ item.userName || '-'}}
                td {{ item.fullName  | capitalize}}
                td {{ item.role.label  | humanize}}
                td {{ item.sourcingType | humanize}}
                td {{item.superCategory.join(', ') || '-' | capitalize  }}
                td {{item.region.join(', ') || '-' | capitalize }}
                //- td {{ item.phone || '-'}}
                td.text-center
                    v-icon.mr-3.far.fa-edit(small, @click="manageUser('edit', item)")
                    v-icon.mr-3.fa.fa-sign-in(small, @click="stealthLogin(item.id)")
                    v-icon.far.fa-trash-alt(small, @click='deleteUser(item.id)')
    sweet-modal.manage-user-modal(
        ref="manage_role_modal",
        width="35%",
        overlay-theme="dark",
    )
        manage-user(
            :currentUser="selectedUser",
            :users="users",
            :roles="roles",
            :mode="mode",
            :superCategories="superCategories",
            :regions="regions",
            :areas="areas",
            @action="creatOrUpdate",
        )
</template>

<style lang="scss">
</style>
