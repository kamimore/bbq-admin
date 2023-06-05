<script>
import DatatableSettingMixin from '@mixins/datatable-setting';

export default {
    name: "QuestionList",
    mixins: [DatatableSettingMixin],
    data() {
        return {
            dialog: false,
            headers: [
                {
                    text: 'Label',
                    align: 'left',
                    sortable: true,
                    value: 'label',
                },
                { text: 'Category', value: 'question_category.name'},
                { text: 'Help Text', value: 'helpText' },
                { text: 'Answer Type', value: 'answerType' },
                { text: 'Active', value: 'isActive' },
                { text: 'Actions', value: 'actions', sortable: false, align: 'right', width:"10%"},
            ],
            items: [],
            totalItems: 0,
            pagination: {},
            search: null,
        };
    },
    created(){
        this.getData();
    },
    methods: {
        async getData() {
            this.isLoading = true;
            const query = {
                where: { isDeleted: false },
                include: [
                    {
                        model: "QuestionCategory",
                    },
                ],
            };
            this.items = await this.$http.get("question", query);
            this.isLoading = false;
        },
        manageItem(id) {
            const query = {
                mode: id ? "edit" : "add",
            };
            if (id) {
                Object.assign(query, { questionId: id });
            }
            this.$router.push({
                name: "bd.question.manage",
                query,
            });
        },
        async deleteItem(id) {
            const message = `Are you sure you want to delete?`;
            this.$confirm(message, "Delete Question", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                await this.$http.updateById("question", id, {
                    isDeleted: true,
                });
                this.search = null;
                this.getData();
            });
        },
    },
};
</script>

<template lang="pug">
div.que-category-border.custom-shadow
    v-app
        div
            v-toolbar.pb-3(flat, color='white')
                v-text-field(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                v-spacer
                v-btn.mb-2.mt-3.green-button.add-bun(dark, @click="manageItem(null)") Add Question
            v-data-table.question-table.table-shadow(
                :headers='headers', 
                :search="search",
                :items='items', 
                :rows-per-page-items="[10]",
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='props')
                    td {{ props.item.label | truncate(25)}}
                    td {{ props.item.question_category.name }}
                    td {{ props.item.helpText | truncate(50) }}    
                    td {{ props.item.answerType | humanize }}
                    td {{ props.item.isActive }}
                    td.text-right
                        v-icon.mr-2.far.fa-edit(small, @click='manageItem(props.item.id)')
                        v-icon.far.fa-trash-alt(small, @click='deleteItem(props.item.id)')        
</template>

<style lang="scss">
</style>
