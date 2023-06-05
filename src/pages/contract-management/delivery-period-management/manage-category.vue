<script>
export default {
    name: "ManageCategory",
    props: {
        selectedSuperCategories: {
            type: Array,
            default: () => [],
        },
        selectedCategories: {
            type: Array,
            default: () => [],
        },
        mstSuperCategories: {
            type: Array,
            default: () => [],
        },
        mstCategories: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            categories: [],
            superCategories: [],
        };
    },
    methods: {
        saveCategories() {
            if (!this.categories.length) return this.$utility.showErrorMessage("Please select at least one category!");
            this.$emit("saveCategories", this.categories);
        },
        selectCategories(data) {
            const ids = data.map(s => s.id);
            this.categories = this.categories.filter(a => ids.includes(a.superCategoryId));
        },
    },
    computed: {
        filteredCategories() {
            if (!this.mstSuperCategories || !this.mstSuperCategories.length) return [];
            const ids = this.superCategories.map(s => s.id);

            return this.mstCategories.filter(s => ids.includes(s.superCategoryId));
        },
    },
    created() {
        this.$root.$on("clearCategories", () => {
            this.categories = this.selectedCategories;
            this.superCategories = this.selectedSuperCategories;
        });
    },
    watch: {
        selectedCategories(val) {
            // if (!this.categories.length) {
            this.categories = val;
            // }
        },
        selectedSuperCategories(val) {
            // if (!this.superCategories.length) {
            this.superCategories = val;
            // }
        },
    },
};
</script>

<template lang="pug">
div.manage-category
    .title-style-1.text-barbique.custom-arrow-add-AV  Manage Categories
        //- hr
    .sweet-modal-max-height
        form-field(
            v-model="superCategories",
            inputType="search-multiple-select",
            label="name",
            attribute="Super Category",
            trackBy="id",
            :items="mstSuperCategories",
            placeholder="Select Super Category",
            @clearAll="superCategories = []",
            :showClearAll="true",
            @input="selectCategories"
        )
        form-field(
            v-model="categories",
            inputType="search-multiple-select",
            label="name",
            attribute="Category",
            trackBy="id",
            openDirection="up"
            :items="filteredCategories",
            placeholder="Select Category",
            @clearAll="categories = []",
            :showClearAll="true"
        )
    .text-right
        button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', :disabled="!categories.length || !superCategories.length" @click="saveCategories()") Save
</template>