import {useEffect, useRef, useState} from "react";
import {loadMapReader, NoMapSourceError, type LoadStatus} from "./data/loadMapData";
import type {IMapReader} from "mudlet-map-renderer";
import {MapController} from "./map/MapController";
import {MapControllerContext} from "./map/context";
import {useI18n} from "./i18n/I18n";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts";
import {useGesturePrevention} from "./hooks/useGesturePrevention";
import {Header} from "./components/Header";
import {InfoBox} from "./components/InfoBox";
import {PreviewMinimap} from "./components/PreviewMinimap";
import {PathBox} from "./components/PathBox";
import {ZoomControls} from "./components/ZoomControls";
import {Toasts} from "./components/Toasts";
import {AreaInfoModal} from "./components/modals/AreaInfoModal";
import {SearchModal} from "./components/modals/SearchModal";
import {FindPathModal} from "./components/modals/FindPathModal";
import {SettingsModal} from "./components/modals/SettingsModal";
import {HelpModal} from "./components/modals/HelpModal";

export function MapApp() {
    const {t} = useI18n();
    const mapRef = useRef<HTMLDivElement>(null);
    const tRef = useRef(t);
    tRef.current = t;
    const [controller, setController] = useState<MapController | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [emptyMap, setEmptyMap] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [loadStatus, setLoadStatus] = useState<LoadStatus | null>(null);
    // Only reveal the loading overlay once loading has taken a moment — an
    // ordinary small map resolves the whole worker round-trip (finalizing +
    // building included) well under this, so the happy path never flashes it.
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!mapRef.current) return;
        let cancelled = false;
        const revealTimer = setTimeout(() => {
            if (!cancelled) setShowLoading(true);
        }, 150);
        loadMapReader(status => {
            if (!cancelled) setLoadStatus(status);
        })
            .then(reader => {
                if (cancelled || !mapRef.current) return;
                clearTimeout(revealTimer);
                setShowLoading(false);
                // Route through tRef so language changes reach controller toasts.
                const ctrl = new MapController(mapRef.current, reader, {t: key => tRef.current(key)});
                ctrl.init();
                setController(ctrl);
                (window as any).controls = ctrl;
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                clearTimeout(revealTimer);
                setShowLoading(false);
                if (err instanceof NoMapSourceError) {
                    setEmptyMap(true);
                    return;
                }
                console.error("mudlet-map-browser: failed to load map data", err);
                setLoadError(err instanceof Error ? err.message : String(err));
            });
        return () => {
            cancelled = true;
            clearTimeout(revealTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleMapLoaded(reader: IMapReader, fileName: string) {
        if (!mapRef.current) throw new Error("Map canvas is not ready.");
        const ctrl = new MapController(mapRef.current, reader, {t: key => tRef.current(key)});
        ctrl.init();
        setController(ctrl);
        setEmptyMap(false);
        setLoadError(null);
        setImportError(null);
        (window as any).controls = ctrl;
        setTimeout(() => ctrl.showToast(`${tRef.current("mapImported")}: ${fileName}`));
    }

    useKeyboardShortcuts(controller);
    useGesturePrevention();

    return (
        <MapControllerContext.Provider value={controller}>
            <Header
                canLoadWithoutMap={emptyMap || loadError !== null}
                onMapLoaded={handleMapLoaded}
                onImportStart={() => {
                    setImportError(null);
                    if (!controller) {
                        setLoadError(null);
                        setEmptyMap(true);
                    }
                }}
                onImportError={message => {
                    setImportError(message);
                    if (!controller) setEmptyMap(true);
                }}
            />
            <AreaInfoModal />
            <SearchModal />
            <FindPathModal />
            <SettingsModal />
            <HelpModal />
            <Toasts />
            <div className="map-container">
                <PreviewMinimap />
                <InfoBox />
                <PathBox />
                <ZoomControls />
                {loadError && (
                    <div className="map-load-error" role="alert">
                        {t("mapLoadError") || "Failed to load map data."}
                        <div className="map-load-error-detail">{loadError}</div>
                    </div>
                )}
                {emptyMap && (
                    <div className="map-empty-state" role={importError ? "alert" : "status"}>
                        <div>{importError ? t("mapImportError") : t("mapEmpty")}</div>
                        {importError && <div className="map-load-error-detail">{importError}</div>}
                        <div className="map-empty-state-hint">{t("mapEmptyHint")}</div>
                    </div>
                )}
                {!loadError && showLoading && loadStatus && (
                    <div className="map-load-status" role="status">
                        {loadStatus.phase === "streaming" && t("mapLoadingStreaming")}
                        {loadStatus.phase === "finalizing" && t("mapLoadingFinalizing")}
                        {loadStatus.phase === "building" && t("mapLoadingBuilding")}
                        {loadStatus.phase === "streaming" && (
                            <div className="map-load-status-detail">
                                {loadStatus.rooms.toLocaleString()} / {loadStatus.total.toLocaleString()}
                                <div className="map-load-status-bar">
                                    <div
                                        className="map-load-status-bar-fill"
                                        style={{width: `${Math.min(100, Math.round((loadStatus.rooms / Math.max(1, loadStatus.total)) * 100))}%`}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div id="map" ref={mapRef}></div>
            </div>
        </MapControllerContext.Provider>
    );
}
