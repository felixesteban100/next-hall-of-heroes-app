import { Crown, Hash, Users } from "lucide-react";
import { EntityType } from "./SwipeGrid";
import { BackData } from "./EntityCard";
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
import { getCharacterAlignmentText, getCharacterAlignmentTextColor, getCharacterAlignmentVarColor, getCharacterGenderIcon } from "@/lib/character_utils";
import { getAlignmentIcon } from "@/lib/character_utils";
import { PowerRole } from "@/types";
// import { computeMatchScore } from "@/lib/compare";

export const getCardProps = (item: any, type: EntityType) => {
    switch (type) {
        case "character": {
            const TierIconCharacter = CHARACTER_TIER_ICON[item.tier] ?? CHARACTER_TIER_ICON[0];
            const tierColorCharacter = CHARACTER_TIER_COLOR[item.tier as keyof typeof CHARACTER_TIER_COLOR] ?? CHARACTER_TIER_COLOR[0];
            const tierLabelCharacter = CHARACTER_TIER[item.tier as keyof typeof CHARACTER_TIER]?.split("/")[0] ?? "Unrated";

            const ClassIcon = CHARACTER_CLASS_ICON[item.class] ?? CHARACTER_CLASS_ICON[0];
            const classColor = CHARACTER_CLASS_COLOR[item.class as keyof typeof CHARACTER_CLASS_COLOR] ?? CHARACTER_CLASS_COLOR[0];
            const characterClass = CHARACTER_CLASS[item.class as keyof typeof CHARACTER_CLASS]?.split("/")[0].split(" ")[0] ?? "?";

            const TypeIcon = CHARACTER_TYPE_ICON[(item.character_type === "" ? "unknown" : item.character_type) as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_ICON["unknown"];
            const typeColor = CHARACTER_TYPE_COLOR[(item.character_type === "" ? "unknown" : item.character_type) as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_COLOR["unknown"];

            const alignmentColor = getCharacterAlignmentTextColor(item.biography.alignment);
            const IconAlignment = getAlignmentIcon(item.biography.alignment);
            const alignmentText = getCharacterAlignmentText(item.biography.alignment);
            const alignmentVarColor = getCharacterAlignmentVarColor(item.biography.alignment)

            const stats = [
                {
                    icon: IconAlignment,
                    text: alignmentText,
                    colorClass: alignmentColor,
                    title: "Alignment",
                },
                {
                    icon: getCharacterGenderIcon(item.appearance?.gender),
                    text: item.appearance?.gender || "—",
                    colorClass: item.appearance?.gender === "Female" ? "text-pink-500" : "text-blue-500",
                    title: "Gender",
                },
                {
                    icon: TypeIcon,
                    text: item.character_type || "Type",
                    colorClass: typeColor?.text ?? "text-muted-foreground",
                    title: "Type",
                },
                {
                    icon: TierIconCharacter,
                    text: `T-${tierLabelCharacter.slice(0, 3)}...`,
                    colorClass: tierColorCharacter.text,
                    title: "Tier",
                },
                {
                    icon: ClassIcon,
                    text: `C-${characterClass}`,
                    colorClass: classColor.text,
                    title: "Class",
                },
            ];

            // 1. Establish the core thematic blend
            const thematicMix = `color-mix(in srgb, color-mix(in srgb, color-mix(in srgb, ${tierColorCharacter.var}, ${classColor.var}), ${alignmentVarColor}), ${typeColor.var})`;

            // 2. Derive specific UI properties from it
            const cardBackgroundColor = `color-mix(in srgb, ${thematicMix} 50%, #09090b 50%)`; // Blended with dark slate/black
            const cardBorderColor = `color-mix(in srgb, ${thematicMix} 80%, white 20%)`;       // Brighter version for the edge
            const glowShadowColor = `color-mix(in srgb, ${thematicMix} 40%, transparent)`;    // For colored drop-shadows

            const backData: BackData = {
                kind: "character",
                entityName: item.name,
                logo: item.biography.publisher.logo,
                // total: parseInt(computeMatchScore(item).overall.toFixed(0)),
                cardBackgroundColor,
                cardBorderColor,
                glowShadowColor,
            };

            return {
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
            };
        }

        case "team": {
            const alignmentColor = getCharacterAlignmentTextColor(item.alignment);
            const IconAlignment = getAlignmentIcon(item.alignment);
            const alignmentText = getCharacterAlignmentText(item.alignment);
            const alignmentVarColor = getCharacterAlignmentVarColor(item.alignment)

            const stats = [
                {
                    icon: IconAlignment,
                    text: alignmentText,
                    colorClass: alignmentColor,
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

            const thematicMix = `color-mix(in srgb, ${alignmentVarColor})`;
            const cardBackgroundColor = `color-mix(in srgb, ${thematicMix} 50%, #09090b 50%)`; // Blended with dark slate/black
            const cardBorderColor = `color-mix(in srgb, ${thematicMix} 80%, white 20%)`;       // Brighter version for the edge
            const glowShadowColor = `color-mix(in srgb, ${thematicMix} 40%, transparent)`;    // For colored drop-shadows

            const backData: BackData = {
                kind: "team",
                entityName: item.name,
                logo: item.universeData.logo,
                cardBackgroundColor: "var(--color-card)",
                cardBorderColor,
                glowShadowColor,
            };

            return {
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
            const TierIconPower = POWER_TIER_ICON[item.tier] ?? POWER_TIER_ICON[0];
            const tierColorPower = POWER_TIER_COLOR[item.tier as keyof typeof POWER_TIER_COLOR] ?? POWER_TIER_COLOR[0];
            const powerTierLabel = POWER_TIER[item.tier as keyof typeof POWER_TIER]?.split("/")[0] ?? "Unrated";

            const RoleIcon = POWER_COMBAT_ROLE_ICON[item.combatRole as PowerRole] ?? POWER_COMBAT_ROLE_ICON["Utility"];
            const roleColor = POWER_COMBAT_ROLE_COLOR[item.combatRole as PowerRole];

            const ActivationIcon = POWER_ACTIVATION_TYPE_ICON[item.activationType] ?? POWER_ACTIVATION_TYPE_ICON["Instant"];
            const activationColor = POWER_ACTIVATION_TYPE_COLOR[item.activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR]

            const stats = [
                {
                    icon: TierIconPower,
                    text: `T${item.tier || 0}/${powerTierLabel}`,
                    colorClass: tierColorPower.text,
                    title: "Power Tier",
                },
                {
                    icon: RoleIcon,
                    text: item.combatRole?.split("/")[0].trim() || "Utility",
                    colorClass: roleColor.text ?? "text-muted-foreground",
                    title: "Combat Role",
                },
                {
                    icon: ActivationIcon,
                    text: item.activationType || "Instant",
                    colorClass: activationColor?.text ?? "text-muted-foreground",
                    title: "Activation Type",
                },
            ];
            // 1. Establish the core thematic blend
            const thematicMix = `color-mix(in srgb, color-mix(in srgb, ${tierColorPower.var}, ${roleColor.var}), ${activationColor.var})`;

            // 2. Derive specific UI properties from it
            const cardBackgroundColor = `color-mix(in srgb, ${thematicMix} 50%, #09090b 50%)`; // Blended with dark slate/black
            const cardBorderColor = `color-mix(in srgb, ${thematicMix} 80%, white 20%)`;       // Brighter version for the edge
            const glowShadowColor = `color-mix(in srgb, ${thematicMix} 40%, transparent)`;    // For colored drop-shadows

            const backData: BackData = {
                kind: "power",
                // score: Math.floor((item.score ?? item.powerScore ?? 0) / 1000) + 'k',
                entityName: item.name,
                logo: "",
                cardBackgroundColor,
                cardBorderColor,
                glowShadowColor,
            };

            return {
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

            const stats = [
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
            const cardBackgroundColor = "var(--color-card)"

            const backData: BackData = {
                kind: "universe",
                logo: item.logo,
                entityName: item.name,
                cardBackgroundColor,
                cardBorderColor: "",
                glowShadowColor: "",
            };

            return {
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