<script>
import QuestionOptions from "./components/question-options";
import { isEmpty, first } from "lodash";
import { humanize } from "underscore.string";
import answerType from "@utils/answer-type.json";

export default {
    name: "ManageQuestionForm",
    components: {
        QuestionOptions,
    },
    data() {
        return {
            question: {},
            // isActive: { label: "Active", value: true },
            // statuses: [{ label: "Active", value: true }, { label: "Inactive", value: false }],
            categories: [],
            selectedCategory: {},
            selectedAnswerType: { label: "Text", value: "text" },
            answerType,
            successMessage: "",
            mode: "add", // add , edit
        };
    },
    async created() {
        if (!isEmpty(this.$router.currentRoute.query)) {
            const { mode, questionId } = this.$router.currentRoute.query;

            if (mode) this.mode = mode;
            if (questionId) {
                const result = await this.$http.get("question", {
                    where: {
                        id: questionId,
                    },
                    include: [
                        {
                            model: "QuestionCategory",
                        },
                    ],
                });
                this.question = first(result);
                this.selectedCategory = this.question.question_category;
                this.selectedAnswerType = this.answerType.find(x => x.value === this.question.answerType);
                //this.isActive = this.statuses.find(x => x.value === this.question.isActive);
            }
            await this.fetchData();
        }
    },
    methods: {
        async fetchData() {
            this.categories = await this.$http.get("question-category", {
                where: {
                    isDeleted: false,
                },
            });
        },
        customCategoryLabel({ name }) {
            return `${humanize(name)}`;
        },
        async createOrUpdate() {
            try {
                if (this.showOption && this.question.options && this.question.options.length) {
                    const isOptionEmpty = this.question.options.filter(o => !o).length;
                    if (isOptionEmpty) return this.$utility.showErrorMessage("Options can not be empty");
                }

                if (!this.selectedCategory.id) return this.$utility.showErrorMessage("Please select question category");

                Object.assign(this.question, {
                    questionCategoryId: this.selectedCategory.id,
                    answerType: this.selectedAnswerType.value,
                    // isActive: this.isActive.value,
                });

                if (!this.question.id) {
                    const count = await this.$http.get("question/count", {
                        where: {
                            isDeleted: false,
                            questionCategoryId: this.selectedCategory.id,
                        },
                    });
                    Object.assign(this.question, { order: count + 1 });
                }

                this.question = await this.$http.updateOrCreate("question", this.question);

                this.successMessage = `Question successfully ${this.mode === "edit" ? "updated" : "created"}`;

                this.$utility.showSucessMessage(this.successMessage);

                this.$utility.goToPage("bd.question.list");
            } catch (err) {
                this.$utility.showErrorMessage(err.message);
            }
        },
    },
    computed: {
        showOption() {
            return ["radio", "checkbox", "select"].includes(this.selectedAnswerType.value);
        },
    },
};
</script>

<template lang="pug">
div.que-category-border-w-pad.bbq-no-border.table-shadow.edit-que.custom-shadow
    form.row(@submit.prevent="createOrUpdate()")
        .col-sm-12
            .title-style-1.text-barbique.pull-left.custom-arrow-add-Q {{mode | humanize}} Question
        hr
        .col-sm-6
            form-field(
                v-model="selectedCategory",
                attribute="Question Category",
                input-type="search-select",
                :required="true",
                placeholder="Type to search for Category",
                :items='categories',
                :customLabel="customCategoryLabel",
                trackBy="id",
            )
        .col-sm-6
            form-field(
                v-model="question.label",
                attribute="Label",
                input-type="text",
                :required="true",
            )
        .col-sm-6
            form-field(
                v-model="question.helpText",
                attribute="Help Text",
                input-type="text",
            )
        .col-sm-6
            form-field(
                v-model="selectedAnswerType",
                attribute="Answer Type",
                input-type="search-select",
                :required="true",
                placeholder="Type to search for type",
                label='label',
                :items='answerType',
                trackBy="value",
            )
        .col-sm-3.mt-4
            //- form-field(
            //-     v-model="isActive",
            //-     attribute="Status",
            //-     input-type="select",
            //-     :required="true",
            //-     label='label',
            //-     :items='statuses',
            //-     trackBy="value",
            //-     :placeholder="'Select a status'"
            //- )
            form-field-input(
                v-model="question.isActive",
                attribute="Active",
                input-type="checkbox-border",
                label='Status',
            )
        .col-sm-3.mt-4
            form-field-input(
                v-model="question.multi",
                attribute="Multi-Value",
                input-type="checkbox-border",
                label='Multi-Value',
            )
            //- b-form-checkbox.cust-input.check-input(
            //-     v-model="question.multi",
            //-     attribute="Multiple Value",
            //-     :showLabel="true",
            //-     input-type="checkbox"
            //- ) Multi-Value
        //.col-sm-3
            b-form-checkbox.cust-input(
                v-model="question.isRequired",
                attribute="Required",
                :showLabel="true",
                input-type="checkbox"
            ) Required
        question-options(
            v-if="showOption",
            :question="question"
        )
        .col-sm-12.pt-3
            .text-right
                button.btn.btn-primary.bbq-btn-primary {{ mode === 'edit'? 'update' : 'add' | humanize}}
</template>

<style lang="scss">
</style>
