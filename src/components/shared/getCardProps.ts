import { Crown, Hash, Users } from "lucide-react";
import { EntityType } from "./SwipeGrid";
import { BackData, StatColumn } from "./EntityCard";
import {
    CHARACTER_CLASS,
    CHARACTER_CLASS_COLOR,
    CHARACTER_CLASS_ICON,
    CHARACTER_TIER,
    CHARACTER_TIER_COLOR,
    CHARACTER_TIER_ICON,
    CHARACTER_TYPE_COLOR,
    CHARACTER_TYPE_ICON,
    POWER_ACTIVATION_TYPE_COLOR,
    POWER_ACTIVATION_TYPE_ICON,
    POWER_COMBAT_ROLE_COLOR,
    POWER_COMBAT_ROLE_ICON,
    POWER_TIER,
    POWER_TIER_COLOR,
    POWER_TIER_ICON,
} from "@/lib/constants";
import { getCharacterAlignmentText, getCharacterAlignmentTextColor, getCharacterAlignmentVarColor, getCharacterGenderIcon, getCharacterThematicMix, getPowerThematicMix } from "@/lib/character_utils";
import { getAlignmentIcon } from "@/lib/character_utils";
import { PowerRole } from "@/types";
import { computeMatchScore } from "@/lib/compare";

export const getCardProps = (item: any, type: EntityType) => {
    switch (type) {
        case "character": {
            const stats: StatColumn[] = [
                {
                    icon: getAlignmentIcon(item.biography.alignment),
                    text: getCharacterAlignmentText(item.biography.alignment),
                    colorClass: getCharacterAlignmentTextColor(item.biography.alignment),
                    title: "Alignment",
                },
                {
                    icon: getCharacterGenderIcon(item.appearance?.gender),
                    text: item.appearance?.gender || "—",
                    colorClass: item.appearance?.gender === "Female" ? "text-pink-500" : "text-blue-500",
                    title: "Gender",
                },
                {
                    icon: CHARACTER_TYPE_ICON[(item.character_type === "" ? "unknown" : item.character_type) as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_ICON["unknown"],
                    text: item.character_type || "Type",
                    colorClass: CHARACTER_TYPE_COLOR[(item.character_type === "" ? "unknown" : item.character_type) as keyof typeof CHARACTER_TYPE_COLOR].text ?? CHARACTER_TYPE_COLOR["unknown"]?.text ?? "text-muted-foreground",
                    title: "Type",
                },
                {
                    icon: CHARACTER_TIER_ICON[item.tier] ?? CHARACTER_TIER_ICON[0],
                    text: CHARACTER_TIER[item.tier as keyof typeof CHARACTER_TIER]?.split("/")[0].slice(0, 5) ?? "Unrated".slice(0, 5),
                    colorClass: CHARACTER_TIER_COLOR[item.tier as keyof typeof CHARACTER_TIER_COLOR].text ?? CHARACTER_TIER_COLOR[0].text,
                    title: "Tier",
                },
                {
                    icon: CHARACTER_CLASS_ICON[item.class] ?? CHARACTER_CLASS_ICON[0],
                    text: CHARACTER_CLASS[item.class as keyof typeof CHARACTER_CLASS]?.split("/")[0].split(" ")[0] ?? "?",
                    colorClass: CHARACTER_CLASS_COLOR[item.class as keyof typeof CHARACTER_CLASS_COLOR].text ?? CHARACTER_CLASS_COLOR[0].text,
                    title: "Class",
                },
            ];

            const backData: BackData = {
                kind: "character",
                entityName: item.name,
                logo: item.biography.publisher.logo,
            };

            return {
                wholeEntity: item,
                score: computeMatchScore(item).overall,
                title: item.name,
                id: item.id,
                image: item.images?.md || "/placeholder.png",
                imageFocus: item.imageFocus,
                description: item.biography?.fullName && item.biography.fullName !== "-" ? item.biography.fullName : "Unknown",
                transitionKey: `character-${item.id}`,
                publisherLogo: item.biography?.publisher?.logo,
                alignment: item.biography?.alignment,
                universeLogo: item.biography?.publisher.logo,
                stats,
                backData,
                randomPower: item.powers[Math.floor(Math.random() * item.powers.length)].name
            };
        }

        case "team": {
            const stats: StatColumn[] = [
                {
                    icon: getAlignmentIcon(item.alignment),
                    text: getCharacterAlignmentText(item.alignment),
                    colorClass: getCharacterAlignmentTextColor(item.alignment),
                    title: "Alignment",
                },
                {
                    icon: Users,
                    text: item.status || "Active",
                    colorClass: "text-blue-500",
                    title: "Status",
                },
                {
                    icon: Crown,
                    text: `${item.leaders?.length ?? 0} Leaders`,
                    colorClass: "text-amber-400",
                    title: "Leaders",
                },
            ];

            const backData: BackData = {
                kind: "team",
                entityName: item.name,
                logo: item.universeData.logo,
            };

            return {
                wholeEntity: item,
                score: 0,
                title: item.name,
                id: item.id,
                image: item.logo,
                description: item.description || "No description available.",
                transitionKey: `team-${item.id}`,
                universeLogo: item.universeData.logo,
                stats,
                backData,
            };
        }

        case "power": {
            const stats: StatColumn[] = [
                {
                    icon: POWER_TIER_ICON[item.tier] ?? POWER_TIER_ICON[0],
                    text: `T${item.tier || 0}/${POWER_TIER[item.tier as keyof typeof POWER_TIER]?.split("/")[0] ?? "Unrated"}`,
                    colorClass: POWER_TIER_COLOR[item.tier as keyof typeof POWER_TIER_COLOR].text ?? POWER_TIER_COLOR[0].text,
                    title: "Power Tier",
                },
                {
                    icon: POWER_COMBAT_ROLE_ICON[item.combatRole as PowerRole] ?? POWER_COMBAT_ROLE_ICON["Utility"],
                    text: item.combatRole?.split("/")[0].trim() || "Utility",
                    colorClass: POWER_COMBAT_ROLE_COLOR[item.combatRole as PowerRole].text ?? "text-muted-foreground",
                    title: "Combat Role",
                },
                {
                    icon: POWER_ACTIVATION_TYPE_ICON[item.activationType] ?? POWER_ACTIVATION_TYPE_ICON["Instant"],
                    text: item.activationType || "Instant",
                    colorClass: POWER_ACTIVATION_TYPE_COLOR[item.activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR]?.text ?? "text-muted-foreground",
                    title: "Activation Type",
                },
            ];

            const backData: BackData = {
                kind: "power",
                entityName: item.name,
                logo: item.img,
            };

            return {
                wholeEntity: item,
                score: Math.floor((item.score ?? item.powerScore ?? 0) / 1000) + 'k',
                title: item.name,
                id: item.id,
                image: item.img,
                description: item.description || "No description available.",
                transitionKey: `power-${item.id}`,
                stats,
                backData,
            };
        }

        case "universe": {
            const universeColor = CHARACTER_TYPE_COLOR[item.type as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_COLOR["unknown"];
            const UniverseIcon = CHARACTER_TYPE_ICON[item.type as keyof typeof CHARACTER_TYPE_ICON] ?? CHARACTER_TYPE_ICON["unknown"];

            const stats: StatColumn[] = [
                {
                    icon: UniverseIcon,
                    text: item.type || "Universe",
                    colorClass: universeColor?.text ?? "text-muted-foreground",
                    title: "Type",
                },
                {
                    icon: Users,
                    text: `${item.characterCount ?? 0} Characters`,
                    colorClass: "text-amber-500",
                    title: "Characters",
                },
                {
                    icon: Hash,
                    text: `${item.id}`,
                    colorClass: "text-cyan-500",
                    title: "Canon Status",
                },
            ];

            const backData: BackData = {
                kind: "universe",
                logo: item.logo,
                entityName: item.name,
            };

            return {
                wholeEntity: item,
                score: 0,
                title: item.name,
                id: item.id,
                image: item.logo,
                background: item.background,
                description: item.description || "No description available.",
                transitionKey: `universe-${item.id}`,
                stats,
                backData,
            };
        }
    }
};