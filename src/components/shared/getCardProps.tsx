import { Crown, Hash, ImageIcon, Mars, Venus, Users } from "lucide-react";
import { EntityType } from "./SwipeGrid";
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
import { getCharacterAlignmentText, getCharacterAlignmentTextColor } from "@/lib/character_utils";
import { getAligmentIcon } from "@/lib/characters_utils";
import { PowerRole } from "@/types";

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
            const IconAlignment = getAligmentIcon(item.biography.alignment);
            const alignmentText = getCharacterAlignmentText(item.biography.alignment);

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
                stats: [
                    {
                        icon: IconAlignment,
                        text: alignmentText,
                        colorClass: alignmentColor,
                        title: "Alignment",
                    },
                    {
                        icon: item.appearance?.gender === "Female" ? Venus : Mars,
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
                        // text: `T${item.tier}/${tierLabelCharacter.slice(0, 6)}...`,
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
                ],
            };
        }

        case "team": {
            const alignmentColor = getCharacterAlignmentTextColor(item.alignment);
            const IconAlignment = getAligmentIcon(item.alignment);
            const alignmentText = getCharacterAlignmentText(item.alignment);

            return {
                title: item.name,
                id: item.id,
                image: item.logo,
                description: item.description || "No description available.",
                transitionKey: `team-${item.id}`,
                stats: [
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
                ],
            };
        }

        case "power": {
            const TierIconPower = POWER_TIER_ICON[item.tier] ?? POWER_TIER_ICON[0];
            const tierColorPower = POWER_TIER_COLOR[item.tier as keyof typeof POWER_TIER_COLOR] ?? POWER_TIER_COLOR[0];
            const powerTierLabel = POWER_TIER[item.tier as keyof typeof POWER_TIER]?.split("/")[0] ?? "Unrated";

            const RoleIcon = POWER_COMBAT_ROLE_ICON[item.combatRole as PowerRole] ?? POWER_COMBAT_ROLE_ICON["Utility"];
            const roleColor = POWER_COMBAT_ROLE_COLOR[item.combatRole as PowerRole]?.text ?? "text-muted-foreground";

            const ActivationIcon = POWER_ACTIVATION_TYPE_ICON[item.activationType] ?? POWER_ACTIVATION_TYPE_ICON["Instant"];
            const activationColor = POWER_ACTIVATION_TYPE_COLOR[item.activationType as keyof typeof POWER_ACTIVATION_TYPE_COLOR]?.text ?? "text-muted-foreground";

            return {
                title: item.name,
                id: item.id,
                image: item.img,
                description: item.description || "No description available.",
                transitionKey: `power-${item.id}`,
                stats: [
                    {
                        icon: TierIconPower,
                        text: `T${item.tier || 0}/${powerTierLabel}`,
                        colorClass: tierColorPower.text,
                        title: "Power Tier",
                    },
                    {
                        icon: ActivationIcon,
                        text: item.activationType || "Instant",
                        colorClass: activationColor,
                        title: "Activation Type",
                    },
                    {
                        icon: RoleIcon,
                        text: item.combatRole?.split("/")[0].trim() || "Utility",
                        colorClass: roleColor,
                        title: "Combat Role",
                    },
                ],
            };
        }

        case "universe": {
            const universeColor = CHARACTER_TYPE_COLOR[item.type as keyof typeof CHARACTER_TYPE_COLOR] ?? CHARACTER_TYPE_COLOR["unknown"];
            const UniverseIcon = CHARACTER_TYPE_ICON[item.type as keyof typeof CHARACTER_TYPE_ICON] ?? CHARACTER_TYPE_ICON["unknown"];

            return {
                title: item.name,
                id: item.id,
                image: item.logo,
                background: item.background,
                description: item.description || "No description available.",
                transitionKey: `universe-${item.id}`,
                stats: [
                    {
                        icon: UniverseIcon,
                        text: item.type || "Universe",
                        colorClass: universeColor?.text ?? "text-muted-foreground",
                        title: "Type",
                    },
                    {
                        icon: ImageIcon,
                        text: `${item.comics?.length ?? 0} Gallery`,
                        colorClass: "text-amber-500",
                        title: "Comics",
                    },
                    {
                        icon: Hash,
                        text: `${item.id}`,
                        colorClass: "text-cyan-500",
                        title: "Canon Status",
                    },
                ],
            };
        }
    }
};