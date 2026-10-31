import {
    POWER_TIER,
    POWER_COMBAT_ROLE_ICON,
    POWER_ACTIVATION_TYPE_ICON
} from "@/lib/constants";

export type EntityFilterType = "character" | "power" | "team" | "universe";

export function getFilterProps(type: EntityFilterType, searchParams: URLSearchParams, extraData?: {
    universes?: any[];
    teams?: any[];
    powers?: any[];
}) {
    switch (type) {
        case "character": {
            const name = searchParams.get("name") || "";
            const modes = searchParams.get("modes") ? searchParams.get("modes")!.split(",") : [];
            const alignment = searchParams.get("alignment") || "";
            const universe = searchParams.get("universe") || "";
            const team = searchParams.get("team") || "";
            const character_type = searchParams.get("character_type") || "";
            const tier = searchParams.get("tier") || "";
            const character_class = searchParams.get("class") || "";
            const gender = searchParams.get("gender") || "";
            const powers = JSON.parse(searchParams.get("powers") || "[]");

            const activeCount = [alignment, universe, team, character_type, tier, character_class, gender].filter(Boolean).length + (powers.length > 0 ? 1 : 0);

            return {
                title: "Filter Characters",
                placeholder: "Search characters by name...",
                searchParams,
                name,
                modes,
                activeCount,
                universes: extraData?.universes || [],
                teams: extraData?.teams || [],
                powers: extraData?.powers || [],
                draftFilters: { alignment, universe, team, character_type, tier, class: character_class, gender, powers },
            };
        }

        case "power": {
            const name = searchParams.get("name") || "";
            const tier = searchParams.get("tier") || "";
            const combatRole = searchParams.get("combatRole") || "";
            const activationType = searchParams.get("activationType") || "";

            const activeCount = [tier, combatRole, activationType].filter(Boolean).length;

            return {
                title: "Filter Powers",
                placeholder: "Search powers by name...",
                searchParams,
                name,
                activeCount,
                draftFilters: { tier, combatRole, activationType },
                filterOptions: [
                    { key: "combatRole", label: "Combat Role", options: Object.keys(POWER_COMBAT_ROLE_ICON) },
                    { key: "activationType", label: "Activation Type", options: Object.keys(POWER_ACTIVATION_TYPE_ICON) },
                    { key: "tier", label: "Tier", options: Object.keys(POWER_TIER) },
                ],
            };
        }

        case "team": {
            const name = searchParams.get("name") || "";
            const alignment = searchParams.get("alignment") || "";
            const status = searchParams.get("status") || "";
            const activeCount = [alignment, status].filter(Boolean).length;

            return {
                title: "Filter Teams",
                placeholder: "Search teams by name...",
                searchParams,
                name,
                activeCount,
                draftFilters: { alignment, status },
            };
        }

        case "universe": {
            const name = searchParams.get("name") || "";
            const typeFilter = searchParams.get("type") || "";
            const activeCount = [typeFilter].filter(Boolean).length;

            return {
                title: "Filter Universes",
                placeholder: "Search universes by name...",
                searchParams,
                name,
                activeCount,
                draftFilters: { type: typeFilter },
            };
        }
    }
}