<script>

export default {
    name: 'QuestionOptions',
    components: {
    },
    props: {
        showTitle: {
            type: Boolean,
            default: true,
        },
        question: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {}
    },
    watch: {
        question(val) {
            this.checkOptions(val)
        },
    },
    created() {
        this.checkOptions(this.question)
    },
    methods: {
        addOption() {
            this.question.options.push('')
        },
        removeOption(index) {
            this.question.options.splice(index, 1)
        },
        checkOptions (val) {
            if (!val.options || val.options.length === 0) {
                // Object.assign(val, { options: [''] });
                this.$set(this.question, 'options', ['']);
            }
        }
    },
}
</script>

<template lang="pug">
div.col-sm-12
    .mt-3(
        v-for="(item, index) in question.options" :key="`option-${index}`"
    )
        div
            strong.remove-icon(v-if="index!==0", @click="removeOption(index)") X
            .title-style-1.text-barbique(v-if="showTitle")
                .div  Option {{index + 1}}
            form(@submit.prevent="addOption()")
                .row
                    .col-sm-12
                        .form-group
                            form-field-input(
                                input-type="text",
                                v-model="question.options[index]",
                                attribute="title",
                                placeholder="Option Name"
                                label="Option Name",
                                :required="true",
                            )
                button.light-gray-box(v-if="question.options.length - 1 === index")  + Add More Options
</template>

<style lang="scss">
</style>
