<script>
import { humanize } from "underscore.string";
import ManageCategory from "./components/manage-category";
import ManageCategoryOrder from "./components/manage-category-order";
import QuestionOptions from "../manage-question/components/question-options";
import QuestionCategoryOrder from "../manage-question/components/question-category-order";
import DatatableSettingMixin from "@mixins/datatable-setting";

export default {
    name: "CategoryList",
    mixins: [DatatableSettingMixin],
    components: {
        ManageCategory,
        ManageCategoryOrder,
        QuestionOptions,
        QuestionCategoryOrder,
    },
    data() {
        return {
            question: {},
            selectedCategory: {},
            selectedAnswerType: {},
            dialog: false,
            mode: "add",
            currentCategory: {},
            pagination: {},
            search: null,
            headers: [
                { text: "Order", align: "left", value: "order" },
                { text: "Name", value: "name" },
                { text: "Editable By", value: "roles", sortable: false },
                { text: "Actions", value: "actions", sortable: false, align: "right", width: "15%" },
            ],
            items: [],
            roles: [],
        };
    },
    async created() {
        this.roles = await this.$http.get("role", {
            where: {
                name: {
                    $notIn: ["erp_user", "superadmin"],
                },
            },
        });
        this.getData();
    },
    methods: {
        async getData() {
            this.isLoading = true;
            const query = {
                where: { isDeleted: false },
                distinct: true,
                include: [
                    {
                        model: "QuestionCategoryRole",
                    },
                ],
                order: [["order", "ASC"]],
            };

            const data = await this.$http.get("question-category", query);
            this.items = data.map(el => {
                const roleIds = el.question_category_roles.map(c => c.roleId);
                return { ...el, roles: this.roles.filter(r => roleIds.includes(r.id)).map(r => r.label) };
            });
            this.isLoading = false;
        },
        manageItem(type, category = {}) {
            this.currentCategory = category;
            this.mode = type;
            this.$refs.manage_category_form_modal.open();
        },
        async deleteItem(category) {
            this.$confirm("Are you sure you want to delete?", "Delete Question Category", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                if (category && category.question_category_roles && category.question_category_roles.length > 0) {
                    await Promise.all(
                        category.question_category_roles.map(el => this.$http.delete("question-category-role", el.id)),
                    );
                }

                await this.$http.update(
                    "question",
                    {
                        where: {
                            questionCategoryId: category.id,
                        },
                    },
                    { isDeleted: true },
                );

                await this.$http.updateById("question-category", category.id, { isDeleted: true });

                this.getData();
            });
        },
        async creatOrUpdate(data) {
            try {
                const category = await this.$http.get("question-category", {
                    where: {
                        name: data.name,
                        isDeleted: true,
                    },
                });
                let successMessage = data.id ? "Category successfully updated" : "Category successfully created";
                let res;
                if (!data.id) {
                    const count = await this.$http.get("question-category/count");
                    data.order = count + 1;
                }

                if (!data.id && category && category.length) {
                    const categoryID = category[0].id;
                    res = await this.$http.updateById("question-category", categoryID, {
                        isDeleted: false,
                    });
                    successMessage = "Category successfully created";
                } else {
                    res = await this.$http.updateOrCreate("question-category", data);
                }

                if (data && data.question_category_roles && data.question_category_roles.length > 0) {
                    await Promise.all(
                        data.question_category_roles.map(c => this.$http.delete("question-category-role", c.id)),
                    );
                }
                await Promise.all(
                    data.questionRoles.map(item =>
                        this.$http.rawPost("question-category-role", {
                            ...item,
                            ...{ questionCategoryId: res.id },
                        }),
                    ),
                );
                this.$utility.showSucessMessage(successMessage);
                this.$refs.manage_category_form_modal.close();

                this.getData();
            } catch (err) {
                const msg = err.object.message || err.message;
                this.$utility.showErrorMessage(humanize(msg));
            }
        },
        open_manager_modal(id) {
            this.$refs.question_category_order_modal.open(id);
            this.selectedCategory = id;
        },
        closeManageOrderModal() {
            this.$refs.manage_category_order_modal.close();
            this.getData();
        },
        saveQuestionOrder() {
            this.$refs.question_category_order_modal.close();
            this.$utility.goToPage("bd.category.list");
        },
    },
};
</script>

<template lang="pug">
div.que-category-border.custom-shadow
    v-app
        div
            v-toolbar.cartegory-li-st.pb-3(flat, color='white')
                v-text-field.pull-right(v-model='search', append-icon='search', label='Search', single-line, hide-details, clearable = true)
                v-spacer
                .buttones.pull-right.pt-3
                    v-btn.mb-2.green-button.add-bun(dark, @click="manageItem('add')") Add Question Category
                    v-btn.mb-2.bbq-btn-primary.mr-0(dark, @click="$refs.manage_category_order_modal.open()") Manage order
            v-data-table.bd-category-table.table-shadow(
                :headers='headers', 
                :search="search",
                :items='items', 
                :rows-per-page-items="[10]", 
                :loading="isLoading", 
                :no-data-text="loaderText"
            )
                template(v-slot:items='props')
                    td {{ props.item.order}}
                    td {{ props.item.name | humanize}}
                    td {{ props.item.roles | humanize}}
                        //- tag(:items="props.item.roles")
                    td.text-right
                        v-icon.mr-3.far.fa-edit.edit(small, @click="manageItem('edit', props.item)")
                        v-icon.fas.fa-sort-numeric-down.mr-3(small, @click.prevent='open_manager_modal(props.item)')
                        v-icon.far.fa-trash-alt(small, @click='deleteItem(props.item)')
        sweet-modal(
            v-if="roles && roles.length",
            ref="manage_category_form_modal",
            width="35%",
            overlay-theme="dark",
        )
            manage-category(
                :roles="roles",
                :category="currentCategory",
                :mode="mode",
                @action="creatOrUpdate",
            )
        sweet-modal.question-category-modal(
            v-if="items && items.length",
            ref="manage_category_order_modal",
            width="35%",
            overlay-theme="dark",
        )
            manage-category-order(
                :categories="items",
                @action="closeManageOrderModal"
            )
        sweet-modal(
            ref="question_category_order_modal",
            width="40%",
            overlay-theme="dark",
        )
            question-category-order(
                :categoryId="selectedCategory",
                @action="saveQuestionOrder"
            )
</template>

<style lang="scss">
</style>
