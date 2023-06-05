<script>
export default {
    name: "SelectCategorySection",
    props: {
        vendor: {
            type: Object,
            default: () => {},
        },
        vendorData: {
            type: Object,
            default: () => {},
        },
        categories: {
            type: Array,
            default: () => [],
        },
        isFetching: {
            type: Boolean,
            default: false,
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
        mstVendorTypes: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            selected: [],
        };
    },
    methods: {
        categoryChanged(items) {
            if (items && !items.length) return;

            const nonFood = this.categories.find(c => c.name && c.name.toLowerCase() === "nonfood");
            const isNonFoodSelected = items.includes(nonFood.id);

            if (isNonFoodSelected) {
                const service = this.mstVendorTypes.find(c => c.name && c.name.toLowerCase() === "service");
                this.vendor.vendorTypeId = service ? service.id : null;
            } else {
                const supply = this.mstVendorTypes.find(c => c.name && c.name.toLowerCase() === "supply");
                this.vendor.vendorTypeId = supply ? supply.id : null;
            }
        },
    },
    computed: {
        options() {
            return this.categories.map(c => ({ text: c.name, value: c.id }));
        },
        isDisabled() {
            return this.mode === "readOnly";
        },
    },
};
</script>

<template lang="pug">
.col-md-12.grid-margin.stretch-card.no-padding
    .no-borders
        .card-body
            .row
                .col-md-6
                    b-form-checkbox-group(
                        stacked,
                        v-model="vendorData.vendorSuperCategories"
                        :options="options",
                        :disabled="isDisabled",
                        @change="categoryChanged($event)"
                    )
</template>
