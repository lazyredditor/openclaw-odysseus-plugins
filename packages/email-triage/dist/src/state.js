export function makeTriageState(store) {
    const vkey = (acc, id) => `verdict:${acc}:${id}`;
    const nkey = (acc) => `notified:${acc}`;
    const skey = (acc) => `style:${acc}`;
    return {
        async getVerdict(acc, id) {
            return (await store.get(vkey(acc, id)));
        },
        async setVerdict(acc, id, v) {
            await store.set(vkey(acc, id), v);
        },
        async isNotified(acc, uid) {
            const set = (await store.get(nkey(acc))) ?? [];
            return set.includes(uid);
        },
        async markNotified(acc, uid) {
            const set = (await store.get(nkey(acc))) ?? [];
            if (!set.includes(uid))
                await store.set(nkey(acc), [...set, uid]);
        },
        async pruneNotified(acc, stillUnread) {
            const keep = new Set(stillUnread);
            const set = (await store.get(nkey(acc))) ?? [];
            await store.set(nkey(acc), set.filter((u) => keep.has(u)));
        },
        async getStyle(acc) {
            return (await store.get(skey(acc)));
        },
        async setStyle(acc, style) {
            await store.set(skey(acc), style);
        },
    };
}
