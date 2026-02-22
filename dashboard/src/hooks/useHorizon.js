import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllBalances, fetchPayments, TRACKED_ACCOUNTS } from '../api/horizon';

const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Hook: live balances for all tracked Stellar accounts.
 * Returns { balances, loading, error, lastUpdated, refresh }
 */
export function useLiveBalances() {
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const refresh = useCallback(async () => {
        try {
            const data = await fetchAllBalances();
            setBalances(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        intervalRef.current = setInterval(refresh, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [refresh]);

    return { balances, loading, error, lastUpdated, refresh };
}

/**
 * Hook: live payments for a specific account.
 * Returns { payments, loading, refresh }
 */
export function useLivePayments(accountKey, limit = 10) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const accountId = TRACKED_ACCOUNTS[accountKey] || accountKey;

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await fetchPayments(accountId, limit);
        if (data) setPayments(data);
        setLoading(false);
    }, [accountId, limit]);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [refresh]);

    return { payments, loading, refresh };
}
