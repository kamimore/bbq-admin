export default function (contract, mstAreas = []) {
    const items = [];

    let vendorNumber = contract.Vendor ? contract.Vendor.bbqVendorId : '';
    let contractItems = contract.ContractItems && contract.ContractItems.length ? contract.ContractItems : null;
    let paymentTerm = contract.MstPaymentTerm ? contract.MstPaymentTerm.code : ''
    let contractAreas = contract.ContractAreas && contract.ContractAreas.length ? contract.ContractAreas : null;

    if (!vendorNumber) vendorNumber = contract.vendor ? contract.vendor.bbqVendorId : '';
    if (!contractItems) contractItems = contract.contractItems && contract.contractItems.length ? contract.contractItems : [];
    if (!paymentTerm) paymentTerm = contract.paymentTermId ? contract.paymentTermId.code : '';
    if (!contractAreas) {
        const areaIds = contract.areaIds.map(a => a.value);
        contractAreas = mstAreas.filter(a => areaIds.includes(a.id)).map(a => ({ MstArea : a}));
    }

    if (contractItems && contractItems.length) {
        for (const area of contractAreas) {
            contractItems.forEach((row) => {
                const object = {
                    ItemNo: row.MstItem ? row.MstItem.code : '',
                    VendorNo: vendorNumber || '',
                    StartDate: contract.fromDate || '',
                    EndDate: contract.toDate || '',
                    UOM: row.MstItem ? row.MstItem.unit : '',
                    UnitPrice: row.newPrice || '',
                    PaymentTerm: paymentTerm || '',
                    AreaCode: area.MstArea ? area.MstArea.code : '',
                };
                items.push(object);
            });
        }
    }

    console.log('validate contract', items)

    return {
        InsertPurchPriceMultipleRequestBBQNList: items,
    };
}
