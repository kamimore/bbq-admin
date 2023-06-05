export default {
    data() {
        return {
            isLoading: true,
        };
    },
    computed: {
        loaderText() {
            if (this.isLoading) return "Loading... Please wait";
            return "No data available";
        },
    },
};
