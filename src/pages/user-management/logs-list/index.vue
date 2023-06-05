<script>
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name: "LogsList",
    mixins: [DatatableSettingMixin],
    data() {
        return {
            dialog: false,
            mode: "add",
            currentCategory: {},
            pagination: {},
            headers: [
                { text: "User Name", sortable: false },
                { text: "Name", sortable: false },
                { text: "Role", sortable: false },
                { text: "Resource Type", value: "entity", sortable: false, align: "left" },
                { text: "Action Type", value: "type", sortable: false },
                { text: "Date", value: "created_at" },
            ],
            totalItems: 0,
            items: [],
        };
    },
    methods: {
        async getData(paginationAndSort = null) {
            this.isLoading = true;
            const query = {
                where: {},
                attributes: ["entity", "type", "created_at"],
                include: [
                    {
                        model: "User",
                        attributes: ["userName", "fullName"],
                        where: {
                            userType: "employee",
                        },
                        include: [
                            {
                                model: "Role",
                                attributes: ["label"],
                                where: {
                                    name: {
                                        $ne: "superadmin",
                                    },
                                },
                            },
                        ],
                    },
                ],
            };
            if (paginationAndSort) {
                Object.assign(query, {
                    order: [["created_at", `${paginationAndSort.descending ? "ASC" : "DESC"}`]],
                    limit: paginationAndSort.rowsPerPage,
                    offset: (paginationAndSort.page - 1) * paginationAndSort.rowsPerPage,
                });
            }
            const { data, count } = await this.$http.get("log/find-and-count", query);
            this.items = data;
            this.totalItems = count;
            this.isLoading = false;
        },
    },
    watch: {
        pagination(val) {
            this.getData(val);
        },
    },
};
</script>

<template lang="pug">
v-app
    div.que-category-border.custom-shadow
        v-data-table.log-tab-le.table-shadow(
            :headers='headers', 
            :pagination.sync="pagination", 
            :items='items', 
            :total-items="totalItems", 
            :rows-per-page-items="[10]",
            :loading="isLoading", 
            :no-data-text="loaderText"
        )
            template(v-slot:items='{item}')
                td(v-if="item.User") {{ item.User.userName ||  '-'}}
                td(v-else) NA
                td(v-if="item.User") {{ item.User.fullName | capitalize }}
                td(v-else) NA
                td(v-if="item.User") {{ item.User.role ? item.User.role.label : '-' }}
                td(v-else) NA
                td {{ item.entity | humanize}}
                td {{ item.type | humanize}}
                td {{ item.created_at | dateFormat('MMM DD, YYYY h:mm:ss A')}}
</template>

<style lang="scss">
</style>
