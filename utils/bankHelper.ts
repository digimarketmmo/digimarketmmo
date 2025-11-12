// A simple map of common bank names/codes to VietQR BINs
const bankBinMap: { [key: string]: string } = {
    'vietcombank': '970436',
    'vcb': '970436',
    'bidv': '970418',
    'vietinbank': '970415',
    'ctg': '970415',
    'techcombank': '970407',
    'tcb': '970407',
    'acb': '970416',
    'mb bank': '970422',
    'mbbank': '970422',
    'mb': '970422',
    'sacombank': '970403',
    'vpbank': '970432',
    'tpbank': '970423',
    'shb': '970443',
    'hdbank': '970437',
    'scb': '970429',
    'vib': '970441',
    'maritime bank': '970426',
    'msb': '970426',
    'eximbank': '970431',
    'oceanbank': '970414',
    'agribank': '970405',
    'seabank': '970440',
    'dongabank': '970406'
};

/**
 * Gets the VietQR BIN for a given bank name.
 * @param bankName The name or code of the bank.
 * @returns The BIN string or null if not found.
 */
export const getBankBin = (bankName: string): string | null => {
    if (!bankName) return null;
    const key = bankName.toLowerCase().replace(/ /g, '').trim();
    
    // Direct match
    if (bankBinMap[key]) {
        return bankBinMap[key];
    }
    
    // Partial match
    for (const mapKey in bankBinMap) {
        if (key.includes(mapKey)) {
            return bankBinMap[mapKey];
        }
    }

    return null;
};
