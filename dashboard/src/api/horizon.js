// Stellar Horizon API — live data layer
// Public API, no keys needed, no CORS issues.

const HORIZON = 'https://horizon.stellar.org';

// Tracked accounts — add more as needed
export const TRACKED_ACCOUNTS = {
    attacker: 'GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC',
    attackerFunder: 'GC2XJKBYLJIQ3LIPITDM6I5WYMBXUCIEXBCMHHA5K7GKM5NLSO4SFZIB',
    xliq: 'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ',
    yhnf: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF',
    blendTreasury: 'GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3',
    yhnfController: 'GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7',
    blndWhale: 'GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG',
    sdfConduit: 'GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF',
};

/**
 * Fetch account details (balances, sequence, etc.)
 * Returns null if account not found or error.
 */
export async function fetchAccount(accountId) {
    try {
        const res = await fetch(`${HORIZON}/accounts/${accountId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Fetch recent operations for an account.
 * @param {string} accountId
 * @param {number} limit - max 200
 * @returns {Array|null}
 */
export async function fetchOperations(accountId, limit = 10) {
    try {
        const res = await fetch(
            `${HORIZON}/accounts/${accountId}/operations?limit=${limit}&order=desc`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data._embedded?.records || [];
    } catch {
        return null;
    }
}

/**
 * Fetch recent payments (more useful than raw operations for fund tracking)
 */
export async function fetchPayments(accountId, limit = 10) {
    try {
        const res = await fetch(
            `${HORIZON}/accounts/${accountId}/payments?limit=${limit}&order=desc`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data._embedded?.records || [];
    } catch {
        return null;
    }
}

/**
 * Parse balances from account response into a clean map.
 * Returns { native: "12345.67", "USDC:GA5ZS...": "500.00", ... }
 */
export function parseBalances(account) {
    if (!account?.balances) return {};
    const result = {};
    for (const b of account.balances) {
        if (b.asset_type === 'native') {
            result.XLM = b.balance;
        } else {
            const key = `${b.asset_code}`;
            // If multiple issuers for same code, append issuer
            if (result[key]) {
                result[`${b.asset_code}:${b.asset_issuer.slice(0, 4)}`] = b.balance;
            } else {
                result[key] = b.balance;
            }
        }
    }
    return result;
}

/**
 * Format a balance string for display: "61249278.3064502" → "61,249,278.31"
 */
export function formatBalance(raw, decimals = 2) {
    const num = parseFloat(raw);
    if (isNaN(num)) return raw;
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Fetch balances for all tracked accounts in parallel.
 * Returns { attacker: { XLM: "...", USDC: "..." }, xliq: { ... }, ... }
 */
export async function fetchAllBalances() {
    const entries = Object.entries(TRACKED_ACCOUNTS);
    const results = await Promise.allSettled(
        entries.map(([, id]) => fetchAccount(id))
    );

    const balances = {};
    entries.forEach(([key], i) => {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
            balances[key] = parseBalances(result.value);
        } else {
            balances[key] = null; // failed or not found
        }
    });

    return balances;
}
