<script>
import FileUpload from "@components/file-upload";

export default {
    name: "UploadDocument",
    components: {
        FileUpload,
    },
    props: {
        label: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            default: "other"
        },
        belongsTo: {
            type: String,
            default: "bank", // sourcing, bank, location
        },
        showHeading: {
            type: Boolean,
            default: true,
        },
        showUnderlineHeading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            data: {
                fileUrl: "",
                fileName: "",
                type: "",
                comment: "",
                belongsTo: "",
            },
        };
    },
    methods: {
        async saveFile(file) {
            // Object.assign(this.data, {
            //     fileUrl: file.fileUrl,
            //     fileName: file.fileName,
            //     belongsTo: this.belongsTo,
            // });

            this.$emit("save", Object.assign({}, {
                fileUrl: file.fileUrl,
                fileName: file.fileName,
                belongsTo: this.belongsTo,
                type : this.data.type || this.type,
                comment : this.data.comment,
            }));

            Object.assign(this.data, {
                fileUrl: "",
                fileName: "",
                belongsTo: "",
                type: "",
                comment: "",
            });
        },
        // submit() {
        //     this.$emit("save", Object.assign({}, this.data));

        //     Object.assign(this.data, {
        //         fileUrl: "",
        //         fileName: "",
        //         belongsTo: "",
        //         type: "",
        //         comment: "",
        //     });
        // },
    },
};
</script>

<template lang="pug">
//- .pb-3.pt-4
.row
    .col-sm-12
        .title-style-2(v-if="showHeading") Upload Documents
        div(v-if="showUnderlineHeading")
        .row
            .col-md-2(v-if="label")
                label.font-weight-400.mt-2 {{ label }}
            //.col-md-3
                form-field(
                    v-model="data.type",
                    attribute="Type",
                    input-type="select-option",
                    :items="$utility.getDocumentTypes()",
                    :required="true",
                    placeholder="Search type"
                )
            .col-md-3
                form-field-input(
                    v-model="data.comment",
                    attribute="Remark",
                    input-type="text",
                    :required="false",
                    placeholder="Enter your remark",
                    :maxLength="50"
                )
            .col-md-2.m-mt-2.pl-0
                file-upload(
                    :disabled="false",
                    @save="saveFile",
                    accept=".jpg,.jpeg,.png,.pdf"
                )
            //.col-sm-12
                span.text-muted Accepted file types are: jpg, jpeg, png, pdf.
        //- .col-md-3
        //-     .form-group.upload-file
        //-         br
        //-         input#UploadBtn.btn.btn-primary.background-barbique(
        //-             type="submit", 
        //-             value="Save File", 
        //-             name="submit",
        //-             @click.prevent="submit()"
        //-         )
</template>
<style lang="scss">
</style>
