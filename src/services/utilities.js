import Vue from "vue";
import {
    humanize
} from "underscore.string";
import {
    isEmpty,
    orderBy,
    flattenDeep
} from "lodash";
// import store from '@state';
import api from "./api";
import vendorValidateERP from "./vendor-validate-erp";
import contractValidateERP from "./contract-validate-erp";
const axios = require("axios");
import {
    Message
} from 'element-ui';

const service = {
    getRoleRoutes() {
        const list = [{
            name: "Manage Question Category",
            value: "bd.category.list",
        }, {
            name: "Manage Project",
            value: "bd.survey.list",
        }, {
            name: "Manage Question",
            value: "bd.question.list",
        }, {
            name: "Project Status",
            value: "bd.survey.status.list",
        }, {
            name: "Manage Vendor",
            value: "vendor.list",
        }, {
            name: "New / Renew Contract",
            value: "contract.create",
        }, {
            name: "Manage Template",
            value: "template.create",
        }, {
            name: "Manage Template Category",
            value: "template.category",
        }, {
            name: "Contract History",
            value: "contract.history",
        }, {
            name: "Manage Delivery Term",
            value: "delivery.term",
        }, {
            name: "Manage Advance Payment",
            value: "advance.payment",
        }, {
            name: "Manange User",
            value: "user.list",
        }, {
            name: "Manange Log",
            value: "logs.list",
        }, {
            name: "Manange Role",
            value: "role.list",
        }];
        return list;
    },
    getApplicationMethods() {
        const items = [{
            name: "Manual",
            value: "manual",
        }, {
            name: "Apply to Oldest",
            value: "apply_to_oldest",
        }];
        return items;
    },
    getGeneralBusPostingGroups() {
        const items = [{
            name: "MAIN STORE",
            value: "main_store",
        }];
        return items;
    },
    getVatBusPostingGroups() {
        const items = [{
            name: "VAT",
            value: "vat",
        }];
        return items;
    },
    getYesNoOption() {
        const items = [{
            name: "Yes",
            value: 'true',
        }, {
            name: "No",
            value: 'false',
        }];
        return items;
    },
    getGSTVendorType() {
        const items = [{
            name: "Registered",
            value: "registered",
        }, {
            name: "Non-Registered",
            value: "not_registered",
        }];
        return items;
    },
    getDocumentTypes() {
        const items = [{
            name: "PAN",
            value: "pan",
        }, {
            name: "CANCEL CHEQUE",
            value: "cancel_cheque",
        }, {
            name: "GST",
            value: "gst",
        }, {
            name: "OTHERS",
            value: "other",
        }];
        return items;
    },
    getContractTypes() {
        const items = [{
            name: "Recurring",
            value: "recurring"
        }, {
            name: "One time",
            value: "one_time"
        }];
        return items;
    },
    getContractServices() {
        const items = [{
            name: "Supply",
            value: "supply"
        }, {
            name: "Service",
            value: "service"
        }];
        return items;
    },
    arrayToObject(array) {
        const mapped = array.map(value => ({
            name: humanize(value),
            value,
        }));
        return [...mapped];
    },
    redirectToHttps() {
        const loc = `${window.location.href} `;
        if (loc.indexOf("http://") === 0 && process.env.VUE_APP_NODE_ENV === "production") {
            window.location.href = loc.replace("http://", "https://");
        }
    },
    downloadFile(url, fileName = "", download = true) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        if (download) {
            link.setAttribute("download", fileName);
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    goToPage(name = "home", data = {}, type = "params") {
        const obj = {
            name,
        };
        if (!isEmpty(data)) obj[type] = data;
        Vue.router.push(obj);
    },
    redirectToLink(url) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    parseSiteLocation(responses) {
        let locationResponses = responses.filter(r => r.question_category.name === "location");

        locationResponses = locationResponses.filter(
            r => !["coordinates", "site_coordinates"].includes(r.question.answerType),
        );
        locationResponses = orderBy(locationResponses, ["question.order"], ["asc"]);

        let address = locationResponses.map(r => r.response);

        address = flattenDeep(address);

        // return address && address.length) ? address[0] : '';
        return address.join(",");
    },
    parseSiteRegion(responses) {
        let locationResponses = responses.filter(r => r.question_category.name === "location");

        if (locationResponses && locationResponses.length) {
            const res = locationResponses.find(r => r.question.label === "Region");
            if (res) return res.response && res.response.length ? res.response[0] : "";
        }
        return "";
    },
    vendorProfileValidation(vendor, categories, supplyLocations) {
        if (vendor && !vendor.companyName)
            return {
                type: 'vendor',
                isValid: false,
                message: "Company name is required.",
                component: 'company-detail-section'
            };

        if (vendor && vendor.isMSME && !vendor.MSMECertificate)
            return {
                type: 'vendor',
                isValid: false,
                message: "Please upload MSME certificate.",
                component: 'company-detail-section'
            }

        if (categories && !categories.length) {
            return {
                type: 'vendor',
                isValid: false,
                message: "Please select atleast one category",
                component: 'select-category-section'
            };
        }

        if (supplyLocations && !supplyLocations.length) {
            return {
                type: 'vendor',
                isValid: false,
                message: "Please select atleast one supply location",
                component: 'supply-location-section'
            };
        }

        return {
            type: 'vendor',
            isValid: true,
            message: "Vendor profile is valid",
        };
    },
    mdmValidation(vendor) {
        if (!vendor)
            return {
                type: 'mdm',
                isValid: false,
                message: "Please fill all the mandatory fields",
            };

        if (!vendor.vendorPostingGroupId)
            return {
                type: 'mdm',
                isValid: false,
                message: "Vendor posting group is mandatory",
                component: 'vendor-detail-section'
            };

        if (!vendor.structureId)
            return {
                type: 'mdm',
                isValid: false,
                message: "Structure is mandatory",
                component: 'vendor-detail-section'
            };

        // if (!vendor.productGroupId)
        //     return {
        //         type: 'mdm',
        //         isValid: false,
        //         message: "Product group is mandatory",
        //     };

        if (!vendor.priority)
            return {
                type: 'mdm',
                isValid: false,
                message: "Please enter some priority value",
                component: 'vendor-detail-section'
            };

        if (!vendor.applicationMethod)
            return {
                type: 'mdm',
                isValid: false,
                message: "Please select application method",
                component: 'vendor-detail-section'
            };

        // if (!vendor.vatRegisterationNumber)
        //     return {
        //         type: 'mdm',
        //         isValid: false,
        //         message: "Vat registeration number is mandatory"
        //     };

        if (vendor.vatRegisterationNumber && vendor.vatRegisterationNumber.length !== 15)
            return {
                type: 'mdm',
                isValid: false,
                message: "Vat registeration number must be 15 character long.",
                component: 'vendor-detail-section'
            };

        // if (!vendor.cashLimit)
        //     return {
        //         isValid: false,
        //         message: "cash limit can not be empty"
        //     };

        if (vendor.type === "internal" && vendor.cashLimit && vendor.cashLimit <= 0)
            return {
                type: 'mdm',
                isValid: false,
                message: "cash limit can not be zero or negative",
            };

        // if (!vendor.paymentTermId)
        //     return {
        //    type: 'mdm',
        //         isValid: false,
        //         message: "Payment Term is required"
        //     };

        return {
            type: 'mdm',
            isValid: true,
            message: "Vendor profile is valid",
        };
    },
    bankDetailValidation(bankDetails) {
        if (!bankDetails)
            return {
                isValid: false,
                type: 'bank',
                message: "Please fill all the required bank details.",
                component: 'location-detail-section'
            };

        if (!bankDetails.accountHolderName)
            return {
                isValid: false,
                type: 'bank',
                message: "Account holder name is mandatory",
                component: 'location-detail-section'
            };

        if (!bankDetails.bankName)
            return {
                isValid: false,
                type: 'bank',
                message: "Bank name is mandatory.",
                component: 'location-detail-section'
            };

        if (!bankDetails.branchName)
            return {
                isValid: false,
                type: 'bank',
                message: "Bank branch name is mandatory.",
                component: 'location-detail-section'
            };

        if (!bankDetails.accountNumber)
            return {
                isValid: false,
                type: 'bank',
                message: "Account number is mandatory.",
                component: 'location-detail-section'
            };

        if (!bankDetails.isAccountConfirmed && !bankDetails.confirmAccountNumber)
            return {
                isValid: false,
                type: 'bank',
                message: `Confirm account number is mandatory for ${bankDetails.bankName} bank!`,
                component: 'location-detail-section'
            };

        if (!bankDetails.isAccountConfirmed && bankDetails.confirmAccountNumber !== bankDetails.accountNumber)
            return {
                isValid: false,
                type: 'bank',
                message: `Account number doesn't match for ${bankDetails.bankName} bank.`,
                component: 'location-detail-section'
            };

        if (!bankDetails.IFSCCode)
            return {
                isValid: false,
                type: 'bank',
                message: "IFSC code is mandatory.",
                component: 'location-detail-section'
            };

        if (bankDetails.IFSCCode.length !== 11)
            return {
                isValid: false,
                type: 'bank',
                message: "IFSC code must be 11 character long.",
                component: 'location-detail-section'
            };

        // if (bankDetails.VendorDocuments) {
        //     if (!bankDetails.VendorDocuments.length)
        //         return {
        //             isValid: false,
        //              type: 'bank',
        //             message: 'Documents are required'
        //         }

        //     const pan = bankDetails.VendorDocuments.find(a => a.type === 'bPan')
        //     if (!pan) return {
        //         isValid: false,
        //         type: 'bank',
        //         message: "PAN is required."
        //     }

        //     const chq = bankDetails.VendorDocuments.find(a => a.type === 'cancel_cheque')
        //     if (!chq) return {
        //         isValid: false,
        //         type: 'bank',
        //         message: "Cancel Cheque is required."
        //     }
        // }

        return {
            isValid: true,
            type: 'bank',
            message: "Bank details are valid.",
        };
    },
    vendorLocationDetailValidation(locationDetails, softValidate = false) {
        if (!locationDetails)
            return {
                isValid: false,
                type: 'location',
                message: "Please fill all the required location detail",
                component: 'location-detail-section'
            };

        if (locationDetails.VendorBankDetails && !locationDetails.VendorBankDetails.length)
            return {
                isValid: false,
                type: 'location',
                message: "Please enter atleast one bank detail",
                component: 'location-detail-section'
            };

        if (!locationDetails.contactPersonName)
            return {
                isValid: false,
                type: 'location',
                message: "Contact Person Name is mandatory",
                component: 'location-detail-section'
            };

        if (!locationDetails.phoneNumber)
            return {
                isValid: false,
                type: 'location',
                message: "Phone number is mandatory",
                component: 'location-detail-section'
            };

        if (locationDetails.phoneNumber.length !== 10)
            return {
                isValid: false,
                type: 'location',
                message: "Phone number should be 10 character long",
                component: 'location-detail-section'
            };

        // if (!locationDetails.email)
        //     return {
        //         isValid: false,
        //         type: 'location',
        //         message: "Email is mandatory",
        //         component: 'location-detail-section'
        //     };

        if (!locationDetails.address)
            return {
                isValid: false,
                type: 'location',
                message: "Address 1 can not be empty",
                component: 'location-detail-section'
            };

        if (locationDetails.address && locationDetails.address.length < 3)
            return {
                isValid: false,
                type: 'location',
                message: "Address should be more than 3 characters",
                component: 'location-detail-section'
            };

        // if (!locationDetails.address2)
        //     return {
        //         isValid: false,
        //         type: 'location',
        //         message: "Address 2 can not be empty",
        //         component: 'location-detail-section'
        //     };

        if (locationDetails.address2 && locationDetails.address2.length < 3)
            return {
                isValid: false,
                type: 'location',
                message: "Address 2 should be more than 3 characters",
                component: 'location-detail-section'
            };

        if (!locationDetails.postCode)
            return {
                isValid: false,
                type: 'location',
                message: "Pin Code is mandatory",
                component: 'location-detail-section'
            };

        if (locationDetails.postCode.length !== 6)
            return {
                isValid: false,
                type: 'location',
                message: "Pin code should be 6 character long",
                component: 'location-detail-section'
            };

        if (locationDetails.fssaiNumber && locationDetails.fssaiNumber.length !== 14)
            return {
                isValid: false,
                type: 'location',
                message: "FSSAI Number should be 14 character long",
                component: 'location-detail-section'
            };

        if (locationDetails.fssaiNumber && !locationDetails.fssaiValidTill)
            return {
                isValid: false,
                type: 'location',
                message: "FSSAI Validity Date is required",
                component: 'location-detail-section'
            };

        if (!locationDetails.city)
            return {
                isValid: false,
                type: 'location',
                message: "City is mandatory",
                component: 'location-detail-section'
            };

        if (!locationDetails.stateId)
            return {
                isValid: false,
                type: 'location',
                message: "State is mandatory",
                component: 'location-detail-section'
            };

        if (!locationDetails.panNumber && !softValidate)
            return {
                isValid: false,
                type: 'location',
                message: "PAN number is mandatory",
                component: 'location-detail-section'
            };

        if (locationDetails.panNumber && locationDetails.panNumber.length !== 10 && !softValidate)
            return {
                isValid: false,
                type: 'location',
                message: "PAN number should be 10 character long",
                component: 'location-detail-section'
            };

        // if (!locationDetails.tinNumber)
        //     return {
        //         isValid: false,
        //         type: 'location',
        //         message: "TIN number is mandatory"
        //     };

        if (locationDetails.tinNumber && locationDetails.tinNumber.length !== 11)
            return {
                isValid: false,
                type: 'location',
                message: "TIN number should be 11 character long",
                component: 'location-detail-section'
            };

        // if (!locationDetails.taxLiable)
        //     return {
        //         isValid: false,
        //         type: 'location',
        //         message: "Tax liable is mandatory"
        //     };

        // if (locationDetails.taxLiable && !locationDetails.taxLiableCode)
        // return { isValid: false,
        //          type: 'location', message: "TAX liable code is required." };

        if (!locationDetails.gstVendorType)
            return {
                isValid: false,
                type: 'location',
                message: "Please select GST vendor type",
                component: 'location-detail-section'
            };

        if (locationDetails.gstVendorType === "registered" && !locationDetails.gstNumber)
            return {
                isValid: false,
                type: 'location',
                message: "GST number is mandatory",
                component: 'location-detail-section'
            };

        if (
            locationDetails.gstVendorType === "registered" &&
            locationDetails.gstNumber &&
            locationDetails.gstNumber.length !== 15
        )
            return {
                isValid: false,
                type: 'location',
                message: "GST number should be 15 character long.",
                component: 'location-detail-section'
            };

        if (locationDetails.VendorDocuments) {
            if (!locationDetails.VendorDocuments.length)
                return {
                    isValid: false,
                    type: 'location',
                    subType: 'document',
                    message: 'Documents are required',
                    component: 'location-detail-section'
                }

            const pan = locationDetails.VendorDocuments.find(a => a.type === 'pan')
            if (!pan) return {
                isValid: false,
                type: 'location',
                subType: 'document',
                message: "PAN is required.",
                component: 'location-detail-section'
            }

            const chq = locationDetails.VendorDocuments.find(a => a.type === 'chq')
            if (!chq) return {
                isValid: false,
                type: 'location',
                subType: 'document',
                message: "Cancel Cheque is required.",
                component: 'location-detail-section'
            }

            const gst = locationDetails.VendorDocuments.find(a => a.type === 'gst')
            if (locationDetails.gstVendorType === "registered" && !gst) return {
                isValid: false,
                type: 'location',
                subType: 'document',
                message: "GST ACK. Copy is required.",
                component: 'location-detail-section'
            }
        }

        const banks = locationDetails.VendorBankDetails.filter(b => !b.isDeleted);

        for (const bank of banks) {
            const validateBank = this.bankDetailValidation(bank);
            if (!validateBank.isValid) return validateBank;
        }

        return {
            isValid: true,
            type: 'location',
            message: "Vendor location details are valid.",
        };
    },
    validateVendor({
        vendor,
        vendorLocations = [],
        categories = [],
        supplyLocations = [],
        softValidate = false,
        isMDM = false,
    }) {

        if (isMDM) {
            const data = this.mdmValidation(vendor);
            if (!data.isValid) return data;
        } else {
            const validateProfile = this.vendorProfileValidation(vendor, categories, supplyLocations);

            if (!validateProfile.isValid) return validateProfile;

            const locations = vendorLocations.filter(l => !l.isDeleted);

            if (locations && !locations.length)
                return {
                    isValid: false,
                    message: "Please select atleast one supply location",
                };

            for (const loc of locations) {
                const validateLocation = this.vendorLocationDetailValidation(loc, softValidate);
                if (!validateLocation.isValid) return validateLocation;

                if (!softValidate) {
                    const banks = loc.VendorBankDetails.filter(b => !b.isDeleted);

                    for (const bank of banks) {
                        const validateBank = this.bankDetailValidation(bank);
                        if (!validateBank.isValid) return validateBank;
                    }
                }
            }
        }

        return {
            isValid: true,
        };
    },
    sendOtp(phone) {
        return api.rawPost("send-sms", {
            phone,
        });
    },
    verifyOtp(phone, otp) {
        return api.rawPost("verify-otp", {
            phone,
            otp,
        });
    },
    vendorERPValidation(vendor, mstState) {
        const data = vendorValidateERP.getVendorERPData(vendor, mstState);
        return data;
        // return axios.post(`${process.env.VUE_APP_BBQ_API_HOST}/ValidateVendor`, data);
    },
    contractERPValidation(contract, mstAreas = []) {
        const data = contractValidateERP(contract, mstAreas);
        return data;
        // return axios.post(`${process.env.VUE_APP_BBQ_API_HOST}/ValidatePurchPriceMultiple`, data);
    },
    showSucessMessage(message) {
        if (!message) return;

        Message({
            type: 'success', // success/warning/info/error	
            message,
            showClose: true,
        });
    },
    showWarningMessage(message) {
        if (!message) return;

        Message({
            type: 'warning', // success/warning/info/error	
            message,
            showClose: true,
        });
    },
    showErrorMessage(message) {
        if (!message) return;

        Message({
            type: 'error', // success/warning/info/error	
            message,
            duration: 6000,
            showClose: true,
        });
    },
    calculatePriceWithTax(price, tax) {
        if (!price) return 0;

        const value = (tax / 100) * price + parseFloat(price);
        return value.toFixed(2);
    },
    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    validatePhone(phone) {
        var re = /^[0-9]+$/;
        return phone.match(re);
    },
};

// Bind Utilities to Vue$
Vue.$http = service;
Object.defineProperty(Vue.prototype, "$utility", {
    get() {
        return service;
    },
});

export default service;
