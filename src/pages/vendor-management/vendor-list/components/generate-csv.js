/* eslint-disable no-restricted-syntax */
import utility from '@services/utilities.js'

const generalBusPostingGroups = (postingGroup) => {
    const groups = utility.getGeneralBusPostingGroups();
    const group = groups.find(a => a.value === postingGroup);

    return group ? group.name : "";
};

const vatBusPostingGroups = (postingGroup) => {
    const groups = utility.getVatBusPostingGroups();
    const group = groups.find(a => a.value === postingGroup);

    return group ? group.name : "";
};

const gstVendorType = (location) => {
    if (location && !location.length) return "";
    const vendorType = utility.getGSTVendorType();

    let type = location[0].gstVendorType;
    type = vendorType.find(a => a.value === type);

    return type ? type.name : "";
};

const vendorLocation = vendor => {
    if (vendor.VendorLocations && vendor.VendorLocations.length)
        return vendor.VendorLocations[0]
    return
}

const vendorBank = vendor => {
    if (vendorLocation(vendor) && vendorLocation(vendor).VendorBankDetails && vendorLocation(vendor).VendorBankDetails.length) 
        return vendorLocation(vendor).VendorBankDetails[0]
    return 
}

const generateCSV = (vendors) => {

    return vendors.map(v => ({
        "Code": v.bbqVendorId || "",
        "Company Name": v.companyName || "",
        "Category":
            v.User && v.User.UserSuperCategories.length
                ? v.User.UserSuperCategories.map(a => a.MstSuperCategory.name).join(", ")
                : "",
        "Email": v.User.email,
        "Phone Number": v.User ? v.User.phone : "",
        "Type": v.type,
        "Status": v.status,
        "Structure": v.MstStructure ? v.MstStructure.code : "",
        "Ledger": v.showLedger,
        "Vendor Type": v.vendorType,
        "MSME": v.isMSME,
        "Priority": v.priority,
        "Payment Term": v.MstPaymentTerm ? v.MstPaymentTerm.name : "",
        "Application Method": v.applicationMethod,
        "Vendor Posting Group": v.MstVendorPostingGroup ? v.MstVendorPostingGroup.code : "",
        "Address": vendorLocation(v) ? vendorLocation(v).address : "",
        "Address 2": vendorLocation(v) ? vendorLocation(v).address2 : "",
        "Contact Person Name": vendorLocation(v) ? vendorLocation(v).contactPersonName : "",
        "City": vendorLocation(v) ? vendorLocation(v).city : "",
        "State": vendorLocation(v) && vendorLocation(v).MstState ? vendorLocation(v).MstState.name : "",
        "Country": "India",
        "Tax Liable": vendorLocation(v) ? vendorLocation(v).taxLiable : "",
        "TIN Number": vendorLocation(v) ? vendorLocation(v).tinNumber : "",
        "Pin Code": vendorLocation(v) ? vendorLocation(v).postCode : "",
        "PAN Number": vendorLocation(v) ? vendorLocation(v).panNumber : "",
        "GST Regisration Number": vendorLocation(v) ? vendorLocation(v).gstNumber: "",
        "GST Vendor Type": gstVendorType(v.VendorLocations),
        "FSSAI Number": vendorLocation(v) ? vendorLocation(v).fssaiNumber : "",
        // "VAT Registration Number": v.vatRegisterationNumber || '',
        "General Bus Posting Group": generalBusPostingGroups(v.generalBusPostingGroup),
        "VAT Bus Posting Group": vatBusPostingGroups(v.vatBusPostingGroup),
        "Bank Name": vendorBank(v) ? vendorBank(v).bankName : "",
        "Branch Name": vendorBank(v) ? vendorBank(v).branchName : "",
        "Account Number": vendorBank(v) ? vendorBank(v).accountNumber : "",
        "IFSC Code": vendorBank(v) ? vendorBank(v).IFSCCode : "",
    }));
};

export default generateCSV
