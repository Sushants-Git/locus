import { Store } from "@tauri-apps/plugin-store";

const STORE_NAME = "settings.json";
const CHART_STORE_NAME = "chart_data.json";

let storeCache: Store | null = null;
let chartStoreCache: Store | null = null;

async function loadStore(): Promise<Store> {
    if (!storeCache) {
        storeCache = await Store.load(STORE_NAME, { autoSave: true });
    }
    return storeCache;
}

async function loadChartStore(): Promise<Store> {
    if (!chartStoreCache) {
        chartStoreCache = await Store.load(CHART_STORE_NAME, { autoSave: true });
    }
    return chartStoreCache;
}

export { loadStore, loadChartStore };
