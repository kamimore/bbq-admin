<script>
import draggable from 'vuedraggable'

export default {
    name: 'ManageCategoryOrder',
    components: {
        draggable,
    },
    props: {
        categories: {    
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {};
    },
    created() {
    },
    methods: {
        async order(data) {
            return await this.$http.updateById('question-category', data.id, data);
        },
        async saveOrder() {
            this.categories.forEach((el, index) => (el.order = index + 1))
            await Promise.all(this.categories.map(item => this.order(item)))
            this.$emit('action');
        },
    },
}
</script>

<template lang="pug">
form(@submit.prevent='saveOrder()')
    .row
        .col-sm-12
            .title-style-1.text-barbique.custom-arrow-add-MC Manage Category Order
    .clearfix
    .sweet-modal-max-height
        .question-category.pr-2
            draggable.list-group(:list='categories', ghost-class='ghost')
                .list-group-item.cursor-pointer(v-for='(element, index) in categories', :key='element.order') 
                    i.fa.fa-bars.mr-3(aria-hidden="true")
                    span {{ element.name | humanize}}
    .text-right.mt-4
        button.btn.btn-primary.bbq-btn-primary Submit
</template>

<style lang="scss">
</style>
