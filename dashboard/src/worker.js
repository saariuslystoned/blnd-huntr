export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Force HTTPS
        if (url.protocol === 'http:') {
            url.protocol = 'https:';
            return Response.redirect(url.toString(), 301);
        }

        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const ua = request.headers.get('User-Agent') || 'unknown';
        const country = request.headers.get('CF-IPCountry') || '??';
        const city = request.cf?.city || '??';
        const region = request.cf?.region || '??';

        console.log(JSON.stringify({
            ts: new Date().toISOString(),
            ip,
            country,
            city,
            region,
            path: url.pathname,
            ua,
        }));

        return env.ASSETS.fetch(request);
    },
};
