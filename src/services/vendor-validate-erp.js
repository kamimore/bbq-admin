export default {
    getVendorERPData(vendor, chkMstState) {
        // Preparing vendor payload
        const data = {
            referenceNo: "",
            Name: vendor.companyName,
            Pan_Holder_Status: "1",
            Tax_Liable: "0",
            divisionCode: "1",
            Food: 0,
            NonFood: 0,
            Beverage: 0,
            CreateModifyVendorBank: [],
            InsertModifyVendorAddress: [],
        };

        const vendorLocations = vendor.VendorLocations.filter(l => l.isDeleted == false);

        if (vendorLocations && vendorLocations.length) {
            const locations = vendorLocations[0];
            let bank = null;

            if (locations.VendorBankDetails && locations.VendorBankDetails.length) {
                bank = locations.VendorBankDetails[0];
            }

            let State_code;
            if (locations && locations.stateId) {
                State_code = chkMstState.find(a => a.id == locations.stateId).code;
            }

            Object.assign(data, {
                Tax_Liable: locations.taxLiable == "true" ? "1" : "0",
                Pan_Holder_Status: locations.panNumber ? "0" : "1",
                Address: locations.address || "",
                Address_2: locations.address || "",
                City: locations.city || "",
                postCode: locations.postCode || "",
                Contact: locations.landlineNumber || "",
                Phone_no: locations.phoneNumber || "",
                Email_id: locations.email || "",
                GST_Registration_no: locations.gstNumber || "",
                PAN_NO: locations.panNumber || "",
                TIN_No: locations.tinNumber || "",
                Bank_Name: bank ? bank.bankName : "",
                Bank_Account_Number: bank ? bank.accountNumber : "",
                IFSC_Code: bank ? bank.IFSCCode : "",
                Account_Holder_Name: bank ? bank.accountHolderName : "",
                branchName: bank ? bank.branchName : "",
                Payment_Terms_code: vendor.MstPaymentTerm ? vendor.MstPaymentTerm.code : "",
                Vendor_Posting_Group: vendor.MstVendorPostingGroup ? vendor.MstVendorPostingGroup.code : "",
                State_code,
                Structure: vendor.MstStructure ? vendor.MstStructure.code : "GST",
                genBusPostGrp: "MAIN STORE",
                vATBusPostGrp: "VAT",
                vATRegNo: "GJKK8688",
                country: 'IN',
                MSME: vendor.isMSME ? '1' : '0',
                Priority: vendor.priority || '0',
            });
        }

        if (vendor.vatRegisterationNumber) data.vATRegNo = vendor.vatRegisterationNumber || "GJKK8688"

        // User supercategory
        if (vendor.User && vendor.User.UserSuperCategories && vendor.User.UserSuperCategories.length) {
            vendor.User.UserSuperCategories.forEach(row => {
                if (row.MstSuperCategory.name === "Food") {
                    data.Food = '1';
                }
                if (row.MstSuperCategory.name === "NonFood") {
                    data.NonFood = '1';
                }
                if (row.MstSuperCategory.name === "Beverage") {
                    data.Beverage = '1';
                }
            });
        }

        // Vendor bank and address array
        const vendorBanks = [];
        const vendorAddress = [];

        if (vendorLocations && vendorLocations.length) {
            vendorLocations.forEach(row => {
                const bankObject = {
                    vendorNo: "",
                    bankCode: '',
                    bankName: '',
                    accountNumber: '',
                    iFSCCode: '',
                    accHolderName: '',
                    branchName: '',
                    divisionCode: "1",
                };

                if (row.VendorBankDetails && row.VendorBankDetails.length) {
                    const bank = row.VendorBankDetails[0];
                    Object.assign(bankObject, {
                        bankCode: '',
                        bankName: bank.bankName || '',
                        accountNumber: bank.accountNumber || '',
                        iFSCCode: bank.IFSCCode || '',
                        accHolderName: bank.accountHolderName || '',
                        branchName: bank.branchName || '',
                    });
                }

                if (
                    bankObject.bankName &&
                    bankObject.accountNumber &&
                    bankObject.iFSCCode &&
                    bankObject.accHolderName &&
                    bankObject.branchName
                ) {
                    vendorBanks.push(bankObject);
                }

                let stateCode = '';
                if (row && row.MstState && row.MstState.code) {
                    stateCode = row.MstState.code;
                } else if (vendor && vendor.VendorData && vendor.VendorData.length) {
                    vendor.VendorData.forEach(a => {
                        stateCode = a.MstState.code;
                    });
                }

                const addressObject = {
                    vendorNo: "",
                    addressCode: "V000944133",
                    vendorName: vendor.companyName || "",
                    address: row.address || "",
                    address2: "",
                    postCode: row.postCode || "",
                    orderCity: row.city || "",
                    coutryRegion: "IN",
                    mobileNo: row.phoneNumber || "",
                    stateCode,
                    gSTRegistrationNo: row.gstNumber || "",
                    gSTVendorType: row.gstVendorType === "registered" ? "1" : "3",
                    email: row.email || "",
                };

                vendorAddress.push(addressObject);
            });
        }

        if (vendorAddress && vendorAddress.length) {
            data.InsertModifyVendorAddress = vendorAddress;
        }

        if (vendorBanks && vendorBanks.length) {
            data.CreateModifyVendorBank = vendorBanks;
        }

        console.log('validate vendor', data);
        
        return data;
    }
};
