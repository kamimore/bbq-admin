<script>
export default {
    name: "UploadedFilesList",
    props: {
        files: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
            default: "vendor", // vendor, contract
        },
        mode: {
            type: String,
            default: "add", // add, readOnly
        },
        showHeading: {
            type: Boolean,
            default: true,
        },
        showUploadedBy: {
            type: Boolean,
            default: true,
        },
        showFileType: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    methods: {
        confirmDelete(index, file) {
            this.$confirm("Are you sure you want to delete?", "Delete File", {
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                type: "error",
                showCancelButton: true,
                lockScroll: false,
            }).then(async () => {
                this.files = this.files.filter(a => a.fileUrl !== file.fileUrl);

                this.$emit("remove", file);
                if (file && !file.id) return;

                const route = this.type === "vendor" ? "vendor-document" : "contract-document";

                await this.$http.updateById(route, file.id, {
                    isDeleted: true,
                });
            });
        },
    },
    computed: {
        uploadedFiles() {
            return this.files.filter(b => !b.isDeleted);
        },
    },
};
</script>

<template lang="pug">
div.other-upload-document
    label#lblUpload2.font-weight-bold(v-if="showHeading") Uploaded Files
    table.table.table-bordered
        thead
        tr
            th(v-if="showFileType")  Type
            th  File
            th(v-if="showUploadedBy")  Uploaded by
            th  Remark
            th 
                span.pull-left &nbsp;
                .text-center(v-if="mode === 'add'")  Action
        tr(v-if="!uploadedFiles.length")
            td 
            td  
            td No file uploaded yet.
            td
        tr(v-else, v-for="(file,index) in uploadedFiles")
            td(v-if="showFileType") {{file.type | humanize}}
            td.link(@click="$utility.downloadFile(file.fileUrl, file.fileName, false)") {{file.fileName}}
            td(v-if="showUploadedBy") {{file.belongsTo | humanize}}
            td {{file.comment}}
            td.text-center.pointer.cursor-pointer(
                v-if="mode === 'add'",
                @click="confirmDelete(index, file)"
            )
                i.fa.fa-times(aria-hidden="true")
        tbody(dl="upld")
</template>
