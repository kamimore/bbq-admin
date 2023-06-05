<script>
import FileUpload from "@components/file-upload";

export default {
    name: "UploadVendorDocuments",
    components: {
        FileUpload,
    },
    props: {
        label: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            default: "", // pan, bpan, chq, cancel_cheque, gst, gst_ack_copy
        },
        data: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: "add", // add, edit
        },
        documentType: {
            type: String,
            default: "location", // location, bank
        },
    },
    data() {
        return {
            showFile: false,
            showLocations: false,
            showBank: false,
        };
    },
    created() {
        if (this.data && this.data.length && this.documentType === "location") {
            this.data.forEach(d => {
                if (d.type === this.type) {
                    this.showFile = true;
                    this.showLocations = true;
                }
            });
        }

        if (this.data && this.data.length && this.documentType === "bank") {
            this.data.forEach(d => {
                if (d.type === this.type) {
                    this.showFile = true;
                    this.showBank = true;
                }
            });
        }
    },
    methods: {
        saveFile(data) {
            if (this.documentType === "location") {
                this.data.push(data);
                this.showFile = true;
                this.showLocations = true;
            }

            if (this.documentType === "bank") {
                this.data.push(data);
                this.showFile = true;
                this.showBank = true;
            }
        },
        customLabel(val) {
            return `Uploaded ${val}`;
        },
        confirmDelete(file) {
            this.$confirm("Are you sure you want to delete?", "Delete Certificate", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false
            }).then(async () => {
                if (this.data && this.data.length && this.documentType === "location") {
                    const toDelete = this.data.find(a => a.type === file.type);

                    this.data.splice(this.data.indexOf(toDelete), 1);
                    this.showLocations = false;
                }

                if (this.data && this.documentType === "bank") {
                    const toDelete = this.data.find(a => a.type === file.type);

                    this.data.splice(this.data.indexOf(toDelete), 1);
                    this.showBank = false;
                }

                this.showFile = false;

                this.$forceUpdate();
                if (file && !file.id) return;

                await this.$http.updateById("vendor-document", file.id, {
                    isDeleted: true,
                });
            });
        },
    },
};
</script>
<template lang="pug">
    div 
        span(v-if="!showFile && mode !== 'readOnly'")
            file-upload(
                :label="label",
                :type="type"
                @save="saveFile($event)",
                accept=".jpg,.jpeg,.png,.pdf",
            )
        span(v-if="mode === 'readOnly' && !showFile")
            .text-left.text-muted No {{label}} uploaded yet
        span.width_100.close-star(v-if="showFile && showLocations")
            span  {{customLabel(label)}} : 
            span.link(
                @click="$utility.downloadFile(data.find(a => a.type === type ).fileUrl, data.find(a => a.type === type ).fileName, false)"
            ) {{data.find(a => a.type === type ).fileName}}
            span.text-center.cursor-pointer.ml-2.close-icon(
                v-if="mode === 'add'",
                @click="confirmDelete(data.find(a => a.type === type))"
            ) 
                i.fa.fa-times(aria-hidden="true")
        span(v-if="showFile && showBank")
            span  {{customLabel(label)}} : 
            span.link(
                @click="$utility.downloadFile(data.find(a => a.type === type ).fileUrl, data.find(a => a.type === type ).fileName, false)"
            ) {{data.find(a => a.type === type ).fileName}}
            span.text-center.cursor-pointer.ml-2.close-icon(
                v-if="mode === 'add'",
                @click="confirmDelete(data.find(a => a.type === type))"
            ) 
                i.fa.fa-times(aria-hidden="true")
</template>
<style lang="scss" scoped>
// .star span.close-star span.close-icon i.fa.fa-times {
//     position: absolute;
//     top: -5px;
//     left: -6px;
//     font-size: 10px;
// }
</style>

