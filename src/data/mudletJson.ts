interface MudletJsonExit {
    name: string;
    exitId: number;
}

interface MudletJsonRoom {
    id: number;
    name?: string;
    coordinates: [number, number, number];
    environment?: number;
    weight?: number;
    hash?: string;
    symbol?: {text: string};
    userData?: Record<string, string>;
    exits?: MudletJsonExit[];
}

export interface MudletJsonMap {
    formatVersion: number;
    areas: {
        id: number;
        name: string;
        rooms: MudletJsonRoom[];
    }[];
    customEnvColors?: {id: number; color24RGB: number[]}[];
    envToColorMapping?: Record<string, number>;
}

const DIRECTIONS: MapData.direction[] = [
    "north", "south", "east", "west", "northwest", "northeast",
    "southeast", "southwest", "up", "down", "in", "out",
];

function isDirection(name: string): name is MapData.direction {
    return DIRECTIONS.some(direction => direction === name);
}

/** Adapt Mudlet's JSON export without changing the source file's coordinates. */
export function fromMudletJson(doc: MudletJsonMap): {mapData: MapData.Map; colors: MapData.Env[]} {
    if (doc.formatVersion !== 1) {
        throw new Error(`Unsupported Mudlet JSON format version: ${doc.formatVersion}`);
    }
    const mapData: MapData.Map = doc.areas.map(area => ({
        areaId: String(area.id),
        areaName: area.name,
        labels: [],
        rooms: area.rooms.map(room => {
            const exits: Partial<Record<MapData.direction, number>> = {};
            const specialExits: Record<string, number> = {};
            for (const exit of room.exits ?? []) {
                if (isDirection(exit.name)) exits[exit.name] = exit.exitId;
                else specialExits[exit.name] = exit.exitId;
            }
            return {
                id: room.id,
                area: area.id,
                areaId: String(area.id),
                x: room.coordinates[0],
                y: -room.coordinates[1],
                z: room.coordinates[2],
                env: room.environment ?? -1,
                weight: room.weight ?? 1,
                name: room.name ?? "",
                hash: room.hash ?? "",
                roomChar: room.symbol?.text ?? "",
                userData: room.userData ?? {},
                customLines: {},
                stubs: [],
                doors: {},
                // Renderer exports contain only present exits despite the required-key type.
                exits: exits as Record<MapData.direction, number>,
                specialExits,
            };
        }),
    }));
    const colors: MapData.Env[] = (doc.customEnvColors ?? []).map(color => ({
        envId: color.id,
        colors: color.color24RGB,
    }));
    for (const [envId, colorId] of Object.entries(doc.envToColorMapping ?? {})) {
        const color = colors.find(entry => entry.envId === colorId);
        if (color) colors.push({envId: Number(envId), colors: color.colors});
    }
    return {mapData, colors};
}
