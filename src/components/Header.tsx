import type {IMapReader} from "mudlet-map-renderer";
import {useI18n} from "../i18n/I18n";
import {config, resolveLocalized} from "../config";
import {AreaControls} from "./AreaControls";
import {Toolbar} from "./Toolbar";
import {ZoomBar} from "./ZoomBar";
import {useController} from "../map/context";
import {MapIcon} from "./Icons";

interface HeaderProps {
    canLoadWithoutMap: boolean;
    onMapLoaded: (reader: IMapReader, fileName: string) => void;
    onImportStart: () => void;
    onImportError: (message: string) => void;
}

export function Header({canLoadWithoutMap, onMapLoaded, onImportStart, onImportError}: HeaderProps) {
    const {t, lang} = useI18n();
    const controller = useController();
    const title = resolveLocalized(config.title, lang) ?? t("title");

    return (
        <header>
            <div className="left-header">
                <h2>
                    <a className="brand-link" href="index.html">
                        {config.logo ? <img className="logo" src={config.logo} alt="" /> : <MapIcon />}
                        <span id="title" data-i18n="title">
                            {title}
                        </span>
                    </a>
                </h2>
                {controller && <AreaControls />}
            </div>
            <Toolbar
                canLoadWithoutMap={canLoadWithoutMap}
                onMapLoaded={onMapLoaded}
                onImportStart={onImportStart}
                onImportError={onImportError}
            />
            <ZoomBar />
        </header>
    );
}
