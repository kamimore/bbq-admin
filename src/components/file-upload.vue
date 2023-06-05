<script>
import Axios from "axios";

export default {
    name: "FileUpload",
    props: {
        label: {
            type: String,
            default: "Upload a File",
        },
        imageUrl: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            default: "file", // file, string
        },
        folderName: {
            type: String,
            default: "vendor",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        accept: {
            type: String,
            default: "*",
        },
    },
    data() {
        return {
            cloudinary: {
                uploadPreset: process.env.VUE_APP_COUDINARY_UNSIGNED_PRESET_ID,
                url: process.env.VUE_APP_CLOUDINARY_UPLOAD_URL,
            },
            url: "",
            BASE_URL: process.env.VUE_APP_HOST + "/api/v1",
        };
    },
    methods: {
        async upload(file) {
            try {
                console.log("file", file[0]);
                const fileType = file[0].type;
                if (
                    fileType === "image/png" ||
                    fileType === "image/jpg" ||
                    fileType === "image/jpeg" ||
                    fileType === "application/pdf"
                ) {
                    this.$Progress.start();
                    this.$store.dispatch("loader/updateLoader", true);

                    const axios = Axios.create();

                    const formData = new FormData();

                    formData.append("file", file[0]);
                    // formData.append("upload_preset", this.cloudinary.uploadPreset);

                    if (this.folderName) formData.append("folder", this.folderName);

                    const result = await axios.post(`${this.BASE_URL}/upload-image/${this.folderName}`, formData);

                    const { data } = result.data.object;

                    const url = data.Location;
                    this.url = data.Location;

                    this.$emit("save", {
                        fileUrl: this.url,
                        // fileUrl:"https://banner2.kisspng.com/20180402/xce/kisspng-photography-logo-photographer-clip-art-logo-photography-5ac285c480f535.9763365615226976685282.jpg",
                        fileName: file[0].name,
                        fileType: file[0].type,
                        type: this.type,
                    });

                    this.$store.dispatch("loader/updateLoader", false);
                    this.$Progress.finish();

                    this.$utility.showSucessMessage("file successfully added");
                } else {
                    this.$utility.showErrorMessage("file format not supported.");
                }
            } catch (err) {
                this.$store.dispatch("loader/updateLoader", false);
                this.$Progress.finish();
            }
        },
    },
    watch: {
        imageUrl(newVal) {
            this.url = newVal;
        },
    },
};
</script>

<template lang="pug">
.form-group.font-weight-bold.form-control1.document-up
    label.background-barbique.text-center(:class="{ 'cursor-not-allowed': disabled }") {{ label }}
        input(:disabled="disabled", type="file", @change="upload($event.target.files)", :accept="accept")
</template>

<style lang="scss" scoped>
.form-group.form-control1.document-up {
    // margin-top: 27px;
}
.form-group.form-control1.document-up label {
    background-color: #8a553d;
    width: 100%;
    color: #fff;
    border-radius: 2px;
    padding: 8px;
    cursor: pointer;
}

input[type="file"] {
    display: none;
}
</style>
