import {useRef, useState} from "react";
import {useController} from "../map/context";
import {useVersion} from "../map/hooks";
import {useI18n} from "../i18n/I18n";
import {fromMudletJson, type MudletJsonMap} from "../data/mudletJson";
import {readerFromParsed, DEFAULT_BIG_MAP_THRESHOLD} from "../data/loadMapData";
import {LanguageSelector} from "./LanguageSelector";
import {CopyIcon, DownloadIcon, GearIcon, QuestionCircleIcon, SearchIcon, UploadIcon} from "./Icons";
import {config} from "../config";
import type {IMapReader} from "mudlet-map-renderer";

interface ToolbarProps {
    canLoadWithoutMap: boolean;
    onMapLoaded: (reader: IMapReader, fileName: string) => void;
    onImportStart: () => void;
    onImportError: (message: string) => void;
}

export function Toolbar({canLoadWithoutMap, onMapLoaded, onImportStart, onImportError}: ToolbarProps) {
    const controller = useController();
    const version = useVersion();
    const {t} = useI18n();
    const fileInput = useRef<HTMLInputElement>(null);
    const [loadingFile, setLoadingFile] = useState(false);

    async function loadMapFile(file?: File) {
        if (!file) return;
        onImportStart();
        setLoadingFile(true);
        try {
            const doc = JSON.parse(await file.text()) as MudletJsonMap;
            const {mapData, colors} = fromMudletJson(doc);
            if (mapData.length === 0) throw new Error("The map contains no areas.");
            const reader = readerFromParsed(
                {mapData, colors},
                config.bigMapThreshold ?? DEFAULT_BIG_MAP_THRESHOLD,
            );
            if (controller) {
                controller.replaceMap(reader);
                controller.showToast(`${t("mapImported")}: ${file.name}`);
            } else {
                onMapLoaded(reader, file.name);
            }
        } catch (error) {
            console.error("mudlet-map-browser: failed to import map JSON", error);
            const detail = error instanceof Error ? error.message : String(error);
            if (controller) controller.showToast(`${t("mapImportError")}: ${detail}`);
            else onImportError(detail);
        } finally {
            setLoadingFile(false);
            if (fileInput.current) fileInput.current.value = "";
        }
    }

    return (
        <div className="controls flex-wrap btn-toolbar">
            <button
                type="button"
                className="control btn btn-secondary"
                title={t("load")}
                onClick={() => fileInput.current?.click()}
                disabled={(!controller && !canLoadWithoutMap) || loadingFile}
            >
                <UploadIcon />
                <span>{loadingFile ? t("loading") : t("load")}</span>
            </button>
            <input
                ref={fileInput}
                type="file"
                accept=".json,application/json"
                className="visually-hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={event => void loadMapFile(event.currentTarget.files?.[0])}
            />
            {controller && (
                <div className="toolbar-map-controls">
                    <div className="btn-group control">
                        <button className="save-image btn btn-secondary" title="Zapisz obraz" onClick={() => controller.saveImage()}>
                            <DownloadIcon />
                            <span data-i18n="save">{t("save")}</span>
                        </button>
                        <button type="button" className="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
                            <span className="visually-hidden">Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item save-image"
                                    href="#"
                                    data-i18n="save-png"
                                    onClick={e => {
                                        e.preventDefault();
                                        controller.saveImage();
                                    }}
                                >
                                    {t("save-png")}
                                </a>
                            </li>
                            <li>
                                <a
                                    className="dropdown-item save-image-svg"
                                    href="#"
                                    data-i18n="save-svg"
                                    onClick={e => {
                                        e.preventDefault();
                                        controller.downloadImage();
                                    }}
                                >
                                    {t("save-svg")}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <button className="control copy-image btn btn-secondary" title="Kopiuj obraz" onClick={() => controller.copyImage()}>
                        <CopyIcon />
                        <span id="trn-copy" data-i18n="copy">
                            {t("copy")}
                        </span>
                    </button>
                    <div className="btn-group control">
                        <button className="search btn btn-secondary" data-bs-toggle="modal" data-bs-target="#search" title="Szukaj">
                            <SearchIcon />
                            <span data-i18n="search">{t("search")}</span>
                        </button>
                        <button type="button" className="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
                            <span className="visually-hidden">Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a className="dropdown-item find-path" href="#" data-bs-toggle="modal" data-bs-target="#findpath" data-i18n="find-path">
                                    {t("find-path")}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <button className="control settings btn btn-secondary" data-bs-toggle="modal" data-bs-target="#settings" title="Ustawienia">
                        <GearIcon />
                        <span data-i18n="settings">{t("settings")}</span>
                    </button>
                    <button className="control help btn btn-secondary" data-bs-toggle="modal" data-bs-target="#help" title="Pomoc">
                        <QuestionCircleIcon />
                        <span>
                            <span data-i18n="help">{t("help")}</span>{" "}
                            <span className="badge bg-secondary version-number" style={version ? {display: "initial"} : {display: "none"}}>
                                {version ? `v${version}` : ""}
                            </span>
                        </span>
                    </button>
                </div>
            )}
            <LanguageSelector />
        </div>
    );
}
