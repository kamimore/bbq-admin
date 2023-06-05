<script>
import draggable from "vuedraggable";

export default {
    name: "QuestionCategoryOrder",
    components: {
        draggable,
    },
    props: {
        categoryId: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            questions: [],
        };
    },
    watch: {
        categoryId(val) {
            this.fetchAllQuestions(val);
        },
    },
    created() {
        this.fetchAllQuestions(this.categoryId);
    },
    methods: {
        async fetchAllQuestions(id) {
            this.questions = await this.$http.get("question", {
                where: {
                    questionCategoryId: id.id,
                    isDeleted: false,
                },
                order: [["order", "ASC"]],
            });
        },
        async order(data) {
            return await this.$http.updateById("question", data.id, data);
        },
        async saveOrder() {
            this.questions.forEach((el, index) => (el.order = index + 1));
            await Promise.all(this.questions.map(item => this.order(item)));
            this.$emit("action");
        },
    },
};
</script>

<template lang="pug">
form(@submit.prevent='saveOrder()')
    .title-style-1.text-barbique.custom-arrow-add-MC Manage Question Order ({{categoryId.name | humanize}})
    //- hr
    .clearfix
    .sweet-modal-max-height
        draggable.list-group(:list='questions', ghost-class='ghost', v-if="questions.length > 0")
            .list-group-item.cursor-pointer(v-for='(element, index) in questions', :key='element.id') 
                div.i.fa.fa-bars.mr-3(aria-hidden="false")
                span.font-weight-bold {{ element.label }} 
                span.font-italic - {{element.helpText}}
        div(v-else) No questions in this category
    .text-right.mt-4
        button.btn.btn-primary.bbq-btn-primary Submit
</template>

<style lang="scss">
// .ghost {
//     opacity: 0.5;
//     background: #c8ebfb;
// }
</style>
