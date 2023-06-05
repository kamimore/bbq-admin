<script>
import { humanize } from 'underscore.string';

export default {
    name: "SupplyLocationSection",
    props: {
        vendorData: {
            type: Object,
            default: () => {},
        },
        areas: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
    },
    data() {
        return {
            isSelected: false,
            vendorAreas: [],
        };
    },
    created() {
        if (this.areas.length === this.vendorData.vendorAreas.length) this.isSelected = true;
        else this.isSelected = false;

        const data = this.areas.map(a => a.name);

        if (!data.includes("Select All Location")) {
            this.addAllToAreas();
        }

        this.vendorData.vendorAreas.forEach(area => {
            this.vendorAreas.push(area);
            const vendorAreasAll = this.vendorAreas.map(a => a.name);
            if (vendorAreasAll.includes("Select All Location")) this.vendorAreas.shift();
        });
    },
    methods: {
        customLabel(area) {
            if (area.name === "Select All Location") return "Select All Location";
            if (area.name === "Deselect All Location") return "Deselect All Location";

            const name = `${humanize(area.name, true)}-${humanize(area.MstCity.name)}-${humanize(area.MstState.name)}`;
            return name;
        },
        changed(val) {
            const supplyLocationName = this.vendorAreas.map(a => a.name);
            const AllLocation = this.areas.map(a => a.name);

            if (supplyLocationName.includes("Select All Location")) {
                this.areas.shift();
                this.vendorAreas = this.areas;
                this.vendorData.vendorAreas = this.areas;
            } else {
                if (!AllLocation.includes("Select All Location")) {
                    this.addAllToAreas();
                }
                this.addLocations(val);
            }
        },
        addLocations(val) {
            this.vendorAreas = val;
            this.vendorData.vendorAreas = this.vendorAreas;
        },
        addAllToAreas() {
            this.areas.unshift({
                name: "Select All Location",
                MstCity: { name: "Select All Location" },
                MstState: { name: "Select All Location" },
            });
        },
        clearAll() {
            this.vendorAreas = [];
            this.vendorData.vendorAreas = [];
        },
    },
    watch: {
        vendorAreas(val) {
            if (this.mode !== "readOnly" && !val.length) {
                this.$utility.showErrorMessage("Please select atleast one supply location");
            }
        },
    },
};
</script>

<template lang="pug">
.grid-margin.stretch-card.no-padding.supply-location
    .no-borders
        .card-body
            .row.justify-content-between
                .col-md-9.loction-box
                    form-field.supply-location(
                        v-model="vendorAreas",
                        attribute="Select Supply location",
                        input-type="search-multiple-select",
                        :items="areas",
                        label='name',
                        trackBy='id',
                        openDirection="bottom",
                        :close-on-select="false",
                        :required="true",
                        placeholder="Search Area",
                        :disabled="mode === 'readOnly'",
                        :customLabel="customLabel"
                        @input="changed",
                        @clearAll="clearAll",
                        :showClearAll="true"
                    )
</template>

<style lang="scss">
.loction-box .form-group {
    margin-bottom: 0;
}
.supply-location .multiselect__tags {
    height: auto !important;
    max-height: 230px !important;
    overflow-y: auto;
}
</style>
