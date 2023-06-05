<script>
import uniqBy from "lodash/uniqBy";
import FileUpload from "@components/file-upload";

export default {
    name: "SelectItems",
    components: {
        FileUpload
    },
    props: {
        contract: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            dialog: false,
            pagination: {},
            search: null,
            isFetching: false,
            serviceHeaders: [
                { text: "Item Name", value: "MstItem.name", sortable: false, align: "center", width: "25%" },
                { text: "Price (₹)", value: "newPrice", sortable: false, align: "center", width: "20%" },
                { text: "Actions", value: "", sortable: false, align: "center", width: "10%" },
            ],
            items: [],
            allItems: [],
            tempSpec: null,
            imageTitle: null,
            selectedItem: {}
        };
    },
    created() {
        this.getItem();
    },
    methods: {
        async renderCSV(file) {
            const isCSV = file[0].name.split(".")[1];
            if (isCSV !== "csv") return this.$message.error("File should be CSV.");
            let count = 0;
            this.isFetching = true;
            const csvJsonData = await this.$http.postFile("csv-to-json", file[0]);
            let itemNotFound = [];
            this.isFetching = false;

            const ifCode = csvJsonData.find(a => !a.hasOwnProperty("code"));
            const ifNewPrice = csvJsonData.find(a => !a.hasOwnProperty("new price"));
            const ifUnit = csvJsonData.find(a => !a.hasOwnProperty("unit"));

            if (ifCode) return this.$message("Code column does not exist in CSV");
            if (ifNewPrice) return this.$message("New price column does not exist in CSV");
            if (ifUnit) return this.$message("Unit column does not exist in CSV");

            this.isFetching = true;

            for (const item of csvJsonData) {
                const itemsWithCode = this.allItems.filter(a => a.code == item.code);

                if (itemsWithCode && itemsWithCode.length) {
                    const selectedItem = itemsWithCode.find(a => item.unit && a.unit.toLowerCase() == item.unit.toLowerCase());
                    const itemExists = this.contract.contractItems.find(a => a.itemId == selectedItem.id);

                    if (selectedItem && !itemExists) {
                        let data = {};
                        data.MstItem = selectedItem;
                        data.itemId = selectedItem.id;
                        data.newPrice = item["new price"];
                        data.currentPrice = null;
                        data.tax = selectedItem.tax;
                        this.contract.contractItems.push(data);
                        count++;
                    }
                    // else itemNotFound.push(item.code);
                } else {
                    itemNotFound.push(item.code);
                }
            }

            this.$utility.showSucessMessage(`${count} items imported from CSV`);

            if (itemNotFound && itemNotFound.length) {
                this.$utility.showErrorMessage(`Items ${itemNotFound.join(", ")} not found in selected category`);
            }

            this.isFetching = false;
            this.$refs.upload_csv.value = "";
        },
        async getItem() {
            this.$Progress.start();
            const items = await this.$http.get("mst-item", {
                attributes: ["id", "code", "name", "tax", "unit"],
                include: [
                    {
                        model: "MstProductGroup",
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: "MstItemCategory",
                                attributes: ["id", "categoryId"],
                                required: true,
                                where: {
                                    categoryId: this.contract.categoryId.map(a => a.value),
                                },
                            },
                        ],
                    },
                ],
            });
            this.allItems = items;
            this.items = uniqBy(items, "name");
            this.$Progress.finish();
        },
        addItem() {
            if (this.contract.contractService === "service") {
                const isItemEmpty = this.contract.contractItems.find(a => !a.itemName);
                const isCostNull = this.contract.contractItems.find(a => !a.newPrice);
                const isNegativeCost = this.contract.contractItems.find(a => a.newPrice < 0);

                if (isItemEmpty) return this.$utility.showErrorMessage("Please enter the item name");
                if (isCostNull) return this.$utility.showErrorMessage("Please enter new purchase price");
                if (isNegativeCost) return this.$utility.showErrorMessage("Price can not be negative");

                this.contract.contractItems = [
                    ...this.contract.contractItems,
                    ...[{ itemName: null, currentPrice: null, newPrice: null, tax: null }],
                ];
            } else {
                const isItemEmpty = this.contract.contractItems.find(a => !a.MstItem);
                const isCostNull = this.contract.contractItems.find(a => !a.newPrice);
                const isNegativeCost = this.contract.contractItems.find(a => a.newPrice < 0);

                if (isItemEmpty) return this.$utility.showErrorMessage("Please select the item");
                if (isCostNull) return this.$utility.showErrorMessage("Please enter new purchase price");
                if (isNegativeCost) return this.$utility.showErrorMessage("Price can not be negative");

                this.contract.contractItems = [
                    ...this.contract.contractItems,
                    ...[
                        {
                            MstItem: null,
                            currentPrice: null,
                            newPrice: null,
                            tax: null,
                            brand: null,
                            specification: null,
                        },
                    ],
                ];
            }
            this.$forceUpdate();
        },
        deleteItem(index) {
            const currentItem = this.contract.contractItems[index];

            if (currentItem && currentItem.MstItem && currentItem.MstItem.code) this.allItems.push(currentItem.MstItem);

            this.contract.contractItems.splice(index, 1);

            this.$forceUpdate();
        },
        itemSelected(index, data) {
            this.contract.contractItems[index].itemId = data.id;
            this.contract.contractItems[index].tax = data.tax;

            if (data && data.ContractItems && data.ContractItems.length) {
                this.contract.contractItems[index].currentPrice = data.ContractItems[0].currentPrice || null;
            }
            this.allItems.splice(index, 1);
            this.$forceUpdate();
        },
        unitOptions(index) {
            const currentItem = this.contract.contractItems[index];
            const units = this.allItems.filter(a => currentItem.MstItem && a.code === currentItem.MstItem.code);

            const selectedUnits = this.contract.contractItems.filter(
                c => currentItem.MstItem && c.MstItem && currentItem.MstItem.code === c.MstItem.code,
            );

            const selectedIds = selectedUnits.map(u => u.itemId);

            const filteredUnits = units.filter(u => !selectedIds.includes(u.id));

            return uniqBy(filteredUnits, "unit");
        },
        unitSelected(data, item) {
            const index = this.contract.contractItems.indexOf(item);
            this.contract.contractItems[index].itemId = data.id;
        },
        calculateTax(item) {
            item.finalPrice = item.newPrice;
            return this.$utility.calculatePriceWithTax(item.newPrice, item.tax);
        },
        openItemImage(item) {
            this.imageTitle = item.MstItem.name;
            this.selectedItem = item
            this.$refs.item_image.open();
        },
        saveFile(file) {
            this.$refs.item_image.close();
            this.selectedItem.imageUrl = file.fileUrl
            this.selectedItem.imageName = file.fileName
            this.$forceUpdate();
        },
        removeSelectedImage() {
            this.selectedItem.imageUrl = null
            this.selectedItem.imageName = null
            this.$forceUpdate();
        }
    },
    computed: {
        filteredItems() {
            const itemIds = this.contract.contractItems.map(i => i.itemId);
            const arr = this.allItems.filter(i => i && !itemIds.includes(i.id));
            return uniqBy(arr, "name");
        },
    },
};
</script>

<template lang="pug">
.col-md-12.mt-3.grid-margin.stretch-card.no-mar-pad.contract-table
    .categ-p.top-border-1
        .pull-left.m-2
            input(
                type="file",
                @change="renderCSV($event.target.files)", 
                ref="upload_csv"
                style="display: none;",
                accept=".csv"
            )
            button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="$refs.upload_csv.click()", v-if="contract.contractService !== 'service'") Upload CSV
            a.link.ml-3(href="/sample_upload_items.csv", target="_blank") Download sample csv
        .pull-right.m-2.mr-0
            button.btn.btn-primary.mr-1.bbq-btn-primary(type='button', @click="addItem()") Add Item
        // One time contract
        v-data-table(
            v-if="contract.contractService === 'service'",
            item-key="id",
            :headers="serviceHeaders", 
            :search="search", 
            :items="contract.contractItems", 
            :rows-per-page-items="[1000]",
        )
            template(v-slot:items='{ item, index }')
                td.text-center
                    input.mr-2.text-center.new_price(
                        v-model="item.itemName",
                        type='text', 
                        placeholder='item name',
                        :maxLength="50"
                    )
                td.text-center
                    input.mr-2.text-center.new_price(
                        type='text',
                        v-model="item.newPrice",
                        placeholder='price',
                        onkeypress='return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46',
                        :maxLength="10"
                    )
                td.text-center
                    v-icon.far.fa-trash-alt(small, @click='deleteItem(index)')
                    v-icon.far.fa.fa-plus.ml-3(v-if="index === contract.contractItems.length - 1", small, @click='addItem()')
        // Recurring contract
        table.table.item-select(v-else)
            thead
                tr
                    th.td-width-12.text-center Item Code
                    th.td-width-25.text-center Item Name
                    th.td-width-15.text-center Unit Detail
                    th.td-width-15.text-center Brand
                    th.td-width-8.text-center(v-b-tooltip.hover, title="Specification") Spec
                    th.td-width-8.text-center(v-b-tooltip.hover, title="Item Image") Img
                    th.td-width-10.text-center.white-space-nowrap Price (₹)
                    //- th.td-width-8.text-center.white-space-nowrap GST (%)
                    //- th.td-width-12.text-center.white-space-nowrap Price + GST (₹)
                    th.td-width-8.text-center Actions
            tbody
                tr(v-if="!contract.contractItems.length")
                    td
                    td
                    td 
                        .text-center(v-if="isFetching")
                            b-spinner.text-center( label="Loading.Please wait...") 
                        .text-center(v-else) No item added
                    td
                    td
                    td
                    //- td
                    //- td
                    td
                tr(
                    v-else,
                    v-for="(item,index) of contract.contractItems",
                    :key="index"
                )
                    td.text-center {{ item.MstItem ? item.MstItem.code : '-' }}
                    td.text-center
                        form-field-input.item-select(
                            v-model="item.MstItem",
                            attribute="Item",
                            :openDirection="index  > 2 ? 'top' : 'bottom'",
                            input-type="search-select",
                            :items="filteredItems",
                            label='name',
                            trackBy='id',
                            :required="true",
                            placeholder="Search Item",
                            @change="itemSelected(index, $event)"
                        )
                    td.text-center 
                        form-field-input(
                            v-model="item.MstItem",
                            attribute="Unit",
                            input-type="select",
                            :items="unitOptions(index)",
                            :openDirection="index  > 2 ? 'top' : 'bottom'",
                            label="unit"
                            :required="true",
                            placeholder="unit",
                            :disabled="!item.MstItem",
                            @input="unitSelected($event, item)"
                        )
                    td.text-center
                        form-field-input(
                            v-model="item.brand",
                            attribute="Brand",
                            input-type="text",
                            placeholder='brand',
                            :disabled="!item.MstItem",
                            :maxLength="20"
                        )
                    td.text-center(
                        v-b-tooltip.hover, 
                        :title="item.specification"
                    )
                        .text-center.text-muted(v-if="!item.MstItem") -
                        v-edit-dialog.custom-dialog-box-items(
                            v-else,
                            :return-value.sync="item.specification",
                            @save="item.specification = tempSpec;",
                            @cancel="item.specification = null", 
                            @open="tempSpec=item.specification",
                            @close="tempSpec=null",
                        )
                            .text-center(v-if="item.specification") {{ item.specification | truncate(6) }}
                            .text-center.text-muted(v-else).now-warp Add spec.
                            template.edit-dialog-box(v-slot:input="")
                                v-text-field(
                                    v-model="tempSpec",
                                    counter="50",
                                    maxlength="50",
                                    clearable
                                )
                    td.text-center(
                        v-b-tooltip.hover, 
                        title="Item Image"
                    )
                        .text-center.text-muted(v-if="!item.MstItem") -
                        .text-center.text-muted(v-else, ) 
                            span(v-if="item && item.imageName" @click="openItemImage(item)") {{ item.imageName }}
                            v-icon.fa.fa-upload.mr-3(small, v-else @click="openItemImage(item)")

                        //sweet-modal.view-contract(
                            ref="item_image",
                            width="40%",
                            overlay-theme="dark",
                         )
                            file-upload(
                                :label="item.MstItem.name",
                                type="item"
                                @save="saveFile($event)",
                                accept=".jpg,.jpeg,.png,.pdf",
                            )
                    td.text-center
                        form-field-input(
                            v-model="item.newPrice",
                            attribute="Specification",
                            input-type="text-float",
                            placeholder='price',
                            :disabled="!item.MstItem",
                            :maxLength="10"
                        )
                    //- td.text-center  {{item.tax || '-'}}
                    //- td.text-center(v-if="item.newPrice")  {{ calculateTax(item) }}
                    //- td.text-center(v-else) 0
                    td.text-center
                        v-icon.far.fa-trash-alt.mr-3(small, @click='deleteItem(index)')
                        v-icon.far.fa.fa-plus(v-if="index === contract.contractItems.length - 1",small, @click='addItem()')
            //- div.text-center(v-else)
                b-spinner(v-if="isFetching", label="Loading.Please wait...") 
                span.font-weight-bold.text-center(v-else) {{ 'No data found' }}
        sweet-modal.view-contract(
            ref="item_image",
            width="30%",
            overlay-theme="dark",
        )
            .row
                .col-md-8.bbq-cust-button.upload-btn.mb-2(v-if="selectedItem && selectedItem.imageUrl")
                    div
                        span.close-star.width_100
                            span.link(
                                @click="$utility.downloadFile(selectedItem.imageUrl)"
                            ) {{ selectedItem.imageName }}
                            v-icon.far.fa-trash-alt.mx-3(@click="removeSelectedImage")
                .col-md-12.bbq-cust-button.width_100.upload-btn.mb-2(v-else)
                    file-upload.btn-width_100(
                        :label="imageTitle",
                        type="item"
                        @save="saveFile($event)",
                        accept=".jpg,.jpeg,.png,.pdf",
                    )
</template>

<style lang="scss">
table.table.item-select thead tr th,
table.table.item-select tbody tr th {
    color: #000 !important;
    position: relative !important;
}
table.table.item-select tbody tr td {
    position: relative;
    vertical-align: middle;
    border-bottom: 1px solid #dee2e6;
    padding: 5px !important;
}
.td-width-25 {
    width: 250px;
}
.td-width-10 {
    width: 100px;
}
.td-width-8 {
    width: 80px;
}
.td-width-12 {
    width: 120px;
}
.td-width-15 {
    width: 150px;
}
.td-width-12 {
    width: 120px;
}
.td-width-5 {
    width: 50px;
}
.custom-dialog-box-items .v-menu__content.v-small-dialog__content {
    min-width: 300px !important;
    top: 40px !important;
    left: 5px !important;
}
.custom-dialog-box-items .v-text-field__slot input[type="text"] {
    font-size: 14px;
}
.custom-dialog-box-items .v-menu__activator a {
    width: 100%;
    text-align: center;
}
</style>
