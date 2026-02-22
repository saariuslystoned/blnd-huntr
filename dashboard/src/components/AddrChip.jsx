import { useState, useCallback } from 'react';

export default function AddrChip({ address, label, mono = true }) {
    const [copied, setCopied] = useState(false);

    const short = label || (address.length > 20
        ? `${address.slice(0, 5)}...${address.slice(-4)}`
        : address);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    }, [address]);

    return (
        <span
            className={`addr-chip ${mono ? 'mono' : ''} ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title={address}
        >
            {short}
            {copied && <span className="addr-tooltip">COPIED</span>}
        </span>
    );
}
