import type { CharacterWithJoinTeamUniversePowerEnemies, Universe } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
    CHARACTER_TIER,
    CHARACTER_TIER_COLOR,
    CHARACTER_TIER_ICON,
    CHARACTER_CLASS,
    CHARACTER_CLASS_COLOR,
    CHARACTER_CLASS_ICON,
} from "@/lib/constants";
import {
    getCharacterAlignmentText,
    getCharacterAlignmentTextColor,
    getCharacterGenderIcon,
    getCharacterGenderTextColor,
    getCharacterRaceIcon,
} from "../character_utils";
import { getAligmentIcon } from "../characters_utils";
import { getEnemyNames, getPowerNames, getTeamNames } from "./formatters";

export type SharedItem = {
    name: string;
    members: { id: number; name: string }[];
};

export type GroupedItems = {
    shared: SharedItem[];
    byCharacter: { id: number; name: string; items: string[] }[];
    highlightItem?: boolean;
};

export function groupItemsByCharacter(
    entities: CharacterWithJoinTeamUniversePowerEnemies[],
    itemsForEntity: (e: CharacterWithJoinTeamUniversePowerEnemies) => string[],
    property = "",
    sharedThreshold = 2
): GroupedItems {
    if (!entities.length) {
        return { shared: [], byCharacter: [] };
    }

    const idToName = new Map(entities.map((e) => [e.id, e.name]));
    const itemToChars = new Map<string, Set<number>>();

    for (const e of entities) {
        for (const item of new Set(itemsForEntity(e).filter(Boolean))) {
            if (!itemToChars.has(item)) itemToChars.set(item, new Set());
            itemToChars.get(item)!.add(e.id);
        }
    }

    const shared: SharedItem[] = [];
    for (const [name, ids] of itemToChars) {
        if (ids.size >= sharedThreshold) {
            shared.push({
                name,
                members: [...ids]
                    .map((id) => ({ id, name: idToName.get(id) ?? String(id) }))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }
    shared.sort((a, b) => a.name.localeCompare(b.name));

    const sharedNames = new Set(shared.map((s) => s.name));

    const byCharacter = entities.map((e) => {
        const all = [...new Set(itemsForEntity(e).filter(Boolean))];
        return {
            id: e.id,
            name: e.name,
            items: all
                .filter((x) => !sharedNames.has(x))
                .sort((a, b) => a.localeCompare(b)),
        };
    });

    return { shared, byCharacter };
}

export function groupPowers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) => getPowerNames(e.powers));
}

export function groupWeaknesses(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) => e.weaknesses || []);
}

export function groupEnemies(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupItemsByCharacter(entities, (e) => getEnemyNames(e.connections?.enemies));
}

export function groupTeams(
    entities: CharacterWithJoinTeamUniversePowerEnemies[],
    shareThreshold?: number
) {
    return groupItemsByCharacter(
        entities,
        (e) => getTeamNames(e.connections?.groupAffiliation),
        "teams",
        shareThreshold ?? 2
    );
}

export type BadgeMeta = {
    key: string;
    value: string;
    className?: string;
    icon?: LucideIcon | null;
    imageSrc?: string | null;
    imageAlt?: string;
};

export type SharedBadge = BadgeMeta & {
    members: { id: number; name: string }[];
};

export type GroupedBadges = {
    shared: SharedBadge[];
    byCharacter: {
        id: number;
        name: string;
        items: BadgeMeta[];
    }[];
};

export function groupBadgesByCharacter(
    entities: CharacterWithJoinTeamUniversePowerEnemies[],
    metaForEntity: (e: CharacterWithJoinTeamUniversePowerEnemies) => BadgeMeta | null,
    sharedThreshold = 2
): GroupedBadges {
    if (!entities.length) return { shared: [], byCharacter: [] };

    const map = new Map<string, { meta: BadgeMeta; ids: Set<number> }>();

    for (const e of entities) {
        const meta = metaForEntity(e);
        if (!meta?.key) continue;
        const cur = map.get(meta.key);
        if (!cur) {
            map.set(meta.key, { meta, ids: new Set([e.id]) });
        } else {
            cur.ids.add(e.id);
        }
    }

    const idToName = new Map(entities.map((e) => [e.id, e.name]));

    const shared: SharedBadge[] = [];
    for (const { meta, ids } of map.values()) {
        if (ids.size >= sharedThreshold) {
            shared.push({
                ...meta,
                members: [...ids]
                    .map((id) => ({ id, name: idToName.get(id) ?? String(id) }))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            });
        }
    }
    shared.sort((a, b) => a.value.localeCompare(b.value));

    const sharedKeys = new Set(shared.map((s) => s.key));

    const byCharacter = entities.map((e) => {
        const meta = metaForEntity(e);
        const items = meta && !sharedKeys.has(meta.key) ? [meta] : [];
        return { id: e.id, name: e.name, items };
    });

    return { shared, byCharacter };
}

export function groupGenders(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.appearance.gender;
        return {
            key: `gender:${a ?? "unknown"}`,
            value: a,
            className: getCharacterGenderTextColor(a),
            icon: getCharacterGenderIcon(a),
        };
    });
}

export function groupRaces(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.appearance.race;
        return {
            key: `race:${a ?? "unknown"}`,
            value: a ?? "unknown",
            className: "",
            icon: getCharacterRaceIcon(a),
        };
    });
}

export function groupTiers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const tier = c.tier as keyof typeof CHARACTER_TIER;
        return {
            key: `tier:${c.tier}`,
            value: CHARACTER_TIER[tier] ?? "N/A",
            className: CHARACTER_TIER_COLOR[tier]?.text,
            icon: CHARACTER_TIER_ICON[tier],
        };
    });
}

export function groupClasses(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const cls = c.class as keyof typeof CHARACTER_CLASS;
        return {
            key: `class:${c.class}`,
            value: CHARACTER_CLASS[cls] ?? "N/A",
            className: CHARACTER_CLASS_COLOR[cls]?.text,
            icon: CHARACTER_CLASS_ICON[cls],
        };
    });
}

export function groupAlignments(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const a = c.biography?.alignment;
        return {
            key: `align:${a ?? "unknown"}`,
            value: getCharacterAlignmentText(a),
            className: getCharacterAlignmentTextColor(a),
            icon: getAligmentIcon(a),
        };
    });
}

export function groupPublishers(entities: CharacterWithJoinTeamUniversePowerEnemies[]) {
    return groupBadgesByCharacter(entities, (c) => {
        const p: Universe = c.biography?.publisher;
        const name = typeof p === "string" ? p : p?.name ?? "Unknown";
        const logo = typeof p === "object" ? p?.logo : undefined;
        return {
            key: `pub:${name}`,
            value: name,
            imageSrc: logo || "/placeholder.png",
            imageAlt: name,
        };
    });
}