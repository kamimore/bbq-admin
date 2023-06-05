<script>
import DLayout from "@layouts/default-layout";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "PaymentTerm",
    mixins: [DatatableSettingMixin],
    components: {
        DLayout,
    },
    data() {
        return {
            headers: [
                // { text: "S No.", name: "index", sortable: true },
                { text: "Code", value: "code" },
                { text: "Name", value: "name" },
                { text: "Status", value: "isActive"},
                // { text: "Actions", name: "actions", sortable: false, align: "right", width: "10%" },
            ],
            items: [],
            mode: "add",
            selectedItem: {},
            search: null,
        };
    },
    async created() {
        this.$Progress.start();
        this.isLoading = true;

        this.getData();

        this.$Progress.finish();
    },
    methods: {
        async getData() {
            this.isLoading = true;

            const query = {
                order: [["id", "ASC"]],
            };
            this.items = await this.$http.get("mst-payment-term", query);

            this.isLoading = false;
        },
        async createOrUpdate(data) {
            try {
                await this.$http.updateOrCreate("mst-payment-term", data);
                this.$utility.showSucessMessage(`Payment term successfully ${data && data.id ? "updated" : "created"}`);
                this.$refs.manage_payment_term.close();
                this.getData();
            } catch (error) {
                this.$utility.showErrorMessage(error.message);
            }
        },
        changeStatus(bool, id) {
            const payload = {
                isActive: !!bool,
            };
            this.$http.updateById("mst-payment-term", id, payload, false).then(f => f);
        },
        // async deleteItem(id) {
        //     const message = `Are you sure you want to delete?`;
        //     this.$confirm(message, "Delete Payment term", {
        //         confirmButtonText: "Yes",
        //         cancelButtonText: "No",
        //         type: "error",
        //         showCancelButton: true,
        //         lockScroll: false,
        //     }).then(async () => {
        //         await this.$http.updateById("mst-payment-term", id, {
        //             isDeleted: true,
        //         });
        //         this.$utility.showSucessMessage("Payment term deleted successfully");
        //         this.getData();
        //     });
        // },
        managePaymentTerm(type, item = {}) {
            this.mode = type;
            this.selectedItem = item;
            this.$refs.manage_payment_term.open();
        },
    },
};
</script>

<template lang="pug">
d-layout
    template(slot='body')
        v-app
            v-toolbar.pb-2.pt-2(flat, color='white')
                v-text-field.custon-search-input(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                v-spacer
                //.pull-right
                    button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="managePaymentTerm('add')") Add Payment term
            v-data-table.user-li-table.fixed-hight-table(
                :headers='headers', 
                :items='items', 
                :search="search",
                :rows-per-page-items="[10]",
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='{ item }')
                    //- td.text-left {{ index + 1 || '-'}}
                    td.text-left {{item.code || '-'}}
                    td.text-left {{item.name || '-'}}
                    td
                        el-switch(
                            v-model="item.isActive",
                            @change="changeStatus(item.isActive, item.id)",
                        )
                    //td.text-right
                        v-icon.mr-3.far.fa-edit(small, @click="managePaymentTerm('edit', item)")
                        v-icon.far.fa-trash-alt(small, @click="deleteItem(item.id)")
</template>