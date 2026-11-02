"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { THEMES } from "./powerOverlay/themes";
import { createAbsorbTheme } from "./powerOverlay/absorb";

// Global singleton tracker to ensure only one overlay sound plays at any time
let activeAudioInstance: HTMLAudioElement | null = null;
const audioCache: Record<string, HTMLAudioElement> = {};

function playOverlaySound(themeKey: ThemeKey) {
    if (typeof window === "undefined") return;

    const soundMap: Record<ThemeKey, string> = {
        blood: "/sounds/blood.mp3",
        claws: "/sounds/claws.mp3",
        combat: "/sounds/combat.mp3",
        cosmic: "/sounds/cosmic.mp3",
        defend: "/sounds/defend.mp3",
        diamond: "/sounds/diamond.mp3",
        earth: "/sounds/earth.mp3",
        energy: "/sounds/energy.mp3",
        fire: "/sounds/fire.mp3",
        firearms: "/sounds/firearms.mp3",
        fourthWall: "/sounds/fourthWall.mp3",
        genius: "/sounds/genius.mp3",
        gravity: "/sounds/gravity.mp3",
        heal: "/sounds/heal.mp3",
        ice: "/sounds/ice.mp3",
        light: "/sounds/light.mp3",
        lightning: "/sounds/lightning.mp3",
        magnetic: "/sounds/magnetic.mp3",
        mystic: "/sounds/mystic.mp3",
        nature: "/sounds/nature.mp3",
        omnitrix: "/sounds/omnitrix.mp3",
        poison: "/sounds/poison.mp3",
        psychic: "/sounds/psychic.mp3",
        radiation: "/sounds/radiation.mp3",
        revive: "/sounds/revive.mp3",
        shadow: "/sounds/shadow.mp3",
        sonic: "/sounds/sonic.mp3",
        sword: "/sounds/sword.mp3",
        tech: "/sounds/tech.mp3",
        temporal: "/sounds/temporal.mp3",
        water: "/sounds/water.mp3",
        web: "/sounds/web.mp3",
        wind: "/sounds/wind.mp3",
        speed: "/sounds/speed.mp3",
        breathing: "/sounds/breathing.mp3",
        elastic: "/sounds/elastic.mp3",
        detective: "/sounds/detective.mp3",
        explosion: "/sounds/explosion.mp3",
        wings: "/sounds/wings.mp3",
        transform: "/sounds/cosmic.mp3",
        construct: "/sounds/cosmic.mp3",
        size: "/sounds/cosmic.mp3",
        teleport: "/sounds/wind.mp3",
        archery: "/sounds/claws.mp3",
        weather: "/sounds/wind.mp3",
        nullify: "/sounds/shadow.mp3",
        invisible: "/sounds/psychic.mp3",
        intangible: "/sounds/psychic.mp3",
        stealth: "/sounds/psychic.mp3",
        mist: "/sounds/wind.mp3",
        heatVision: "/sounds/heatVision.mp3",
        absorb: "/sounds/absorb.mp3",
        shockwave: "/sounds/absorb.mp3",
        none: "/sounds/combat.mp3",
    };

    const soundPath = soundMap[themeKey] || "/sounds/combat.mp3";

    try {
        if (activeAudioInstance) {
            activeAudioInstance.pause();
            activeAudioInstance.currentTime = 0;
            activeAudioInstance = null;
        }

        if (!audioCache[soundPath]) {
            audioCache[soundPath] = new Audio(soundPath);
            audioCache[soundPath].volume = 0.25;
        }

        const audio = audioCache[soundPath];
        activeAudioInstance = audio;
        audio.currentTime = 0;

        audio.play().catch(() => {
            // Silently handle browser autoplay policies
        });
    } catch (e) {
        // Fallback safety
    }
}

export type CombatActionType = "attack" | "defend" | "heal" | "revive";

interface PowerOverlayProps {
    action: CombatActionType;
    powerName?: string;
    side?: "left" | "right";
    visible?: boolean;
}

export type ThemeKey =
    | "psychic" | "combat" | "ice" | "water" | "fire" | "lightning" | "construct" | "teleport" | "nullify"
    | "mystic" | "temporal" | "diamond" | "tech" | "shadow" | "light" | "explosion" | "transform" | "archery"
    | "cosmic" | "magnetic" | "gravity" | "sonic" | "poison" | "nature" | "elastic" | "wings" | "size" | "weather"
    | "wind" | "earth" | "radiation" | "blood" | "web" | "omnitrix" | "speed" | "breathing" | "detective"
    | "defend" | "heal" | "revive" | "genius" | "fourthWall" | "energy" | "claws" | "sword" | "firearms"
    | "invisible" | "intangible" | "stealth" | "mist" | "heatVision" | "absorb" | "shockwave" | "none";

function getThemeKey(action: CombatActionType, powerName?: string): ThemeKey {
    if (action === "defend") return "defend";
    if (action === "heal") return "heal";
    if (action === "revive") return "revive";
    // if (!powerName) return "combat";
    if (!powerName) return "none";
    const n = powerName.toLowerCase();

    /* ninjutsu */
    /* elemental control */
    /* lightsaber */
    /* power mimicry */
    /* bounty hunting skills */
    /* energy manipulation */
    /* energy absorption */
    /* energy projection */
    /* weapon proficiency???  */

    if (/\b(cosmic|stellar|power cosmic|reality|omnipotence|reality warping)/.test(n)) return "cosmic";
    if (/\b(vibration|vibrate|shockwave|shock wave|seismic|tremor|quake|concussive wave|oscillat)/.test(n)) return "shockwave";
    if (/\b(absorb|absorption|mimicry|material mimic|copy material|matter absorption|substance|metallic form|iron form|steel form|colossus)/.test(n)) return "absorb";
    if (/\b(durability|durable)/.test(n)) return "defend";
    if (/\b(heat vision|optic blast|eye.?beam|ocular|laser vision|heat ray)/.test(n)) return "heatVision";
    if (/\b(mist|fog|vapor|smoke screen)/.test(n)) return "mist";
    if (/\b(stealth|camouflag|cloaking|blend)/.test(n)) return "stealth";
    if (/\b(invisible|invisibility)/.test(n)) return "invisible";
    if (/\b(intangib|phase|phasing|ethereal|ghost|incorporeal|density)/.test(n)) return "intangible";
    if (/\b(nullif|nullify|nullification|power null|magic null|dampen|suppression|negate|negation|anti.?magic|anti.?power|power drain|neutralize)/.test(n)) return "nullify";
    if (/\b(weather|storm|rain|thunder.?storm|atmosphere|climate|meteorolog|tempest|hurricane|tornado)/.test(n)) return "weather";
    if (/\b(archery|archer|bow|arrow|longbow|crossbow|marksman.?bow|hawkeye|green arrow)/.test(n)) return "archery";
    if (/\b(teleport|teleportation|blink|warp|bamf|portal|apparition|phase.?step|jump.?point|instant transmission)/.test(n)) return "teleport";
    if (/\b(size|grow|shrink|giant|tiny|ant.?man|atom|pym|height|mass manipulation|enlarge|reduce|colossal|miniature)/.test(n)) return "size";
    if (/\b(shadow|darkness|umbral|fear|curse|dark)/.test(n)) return "shadow";
    if (/\b(lantern ring|power ring|energy construct|hard.?light|construct|green lantern|star sapphire|sinestro|orange lantern|blue lantern)/.test(n)) return "construct";
    if (/\b(transform|transformation|shapeshift|shape.?shift|metamorph|metamorphosis|morph|change form|alter form|polymorph)/.test(n)) return "transform";
    if (/\b(wing|wings|gale|feather|bird)/.test(n)) return "wings";
    if (/\b(explosion|explosive|explode|detonate|bomb|grenade|blast wave|kaboom|demolition|combustion burst)/.test(n)) return "explosion";
    if (/\b(detective|deduction|investigation|forensic|insight|criminology|sleuth|observation|evidence|batman.?detective|world.?greatest.?detective)/.test(n)) return "detective";
    if (/\b(elastic|elasticity|stretch|rubber|plasticity|malleable|elongation|gum.?gum|luffy|flexibility)/.test(n)) return "elastic";
    if (/\b(breathing|breath style|breath technique|hinokami|sun breathing|water breathing|flame breathing|thunder breathing|beast breathing|insect breathing|love breathing|stone breathing|mist breathing|sound breathing|flower breathing|serpent breathing|total concentration)/.test(n)) return "breathing";
    if (/\b(speed|superspeed|super speed|speedster|velocity|fast|quickness|speed force)/.test(n)) return "speed";
    if (/\b(firearm|gun|pistol|rifle|sniper|marksmanship|marksman|shooting|bullet|ammo|revolver|shotgun|machine.?gun|blaster gun)/.test(n)) return "firearms";
    if (/\b(claw|claws|adamantium claw|talon|scratch)/.test(n)) return "claws";
    if (/\b(sword|blade|katana|saber|slash|cutlass|excalibur|dagger|knife)/.test(n)) return "sword";
    if (/\b(fourth wall|4th wall|deadpool|break(ing)? the fourth|audience|narrat)/i.test(n)) return "fourthWall";
    if (/\b(wind|air control|aero|air manipulation|tornado|hurricane|flight|sky|breeze|cyclone|airflow|wind)/.test(n)) return "wind";
    if (/\b(web|spider)/.test(n)) return "web";
    if (/\b(omnitrix|alien)/.test(n)) return "omnitrix";
    if (/\b(ice|cryo|frost|freeze|blizzard|arctic)/.test(n)) return "ice";
    if (/\b(water|hydro|aqua|ocean|tidal|aquatic)/.test(n)) return "water";
    if (/\b(fire|flame|pyro|inferno|magma|heat)/.test(n)) return "fire";
    if (/\b(lightning|electric|electro|thunder)/.test(n)) return "lightning";
    if (/\b(time|temporal|chron|proba)/.test(n)) return "temporal";
    if (/\b(magic|mystic|sorcery|spell|chaos magic)/.test(n)) return "mystic";
    if (/\b(telepath|telekin|psychic|mind control|illusion)/.test(n)) return "psychic";
    if (/\b(light|photon|solar|holy|starbolt)/.test(n)) return "light";
    if (/\b(magnet|ferro|metal manipulation)/.test(n)) return "magnetic";
    if (/\b(gravity|gravimetric)/.test(n)) return "gravity";
    if (/\b(sonic|sound|scream)/.test(n)) return "sonic";
    if (/\b(poison|toxin|venom|acid|toxic)/.test(n)) return "poison";
    if (/\b(plant|nature|vine|chlorophyll)/.test(n)) return "nature";
    if (/\b(earth|geo|stone|rock|seismic)/.test(n)) return "earth";
    if (/\b(radiation|gamma|radioactive)/.test(n)) return "radiation";
    if (/\b(blood|vampir|life drain)/.test(n)) return "blood";
    if (/\b(diamond|crystal|invulnerab|force.?field)/.test(n)) return "diamond";
    if (/\b(techology|cyber|android|gadget|repulsor|nanite|tech)/.test(n)) return "tech";
    if (/\b(energy blast|blast|beam|power blast|force blast|repulsor|optic|concussive)/.test(n)) return "energy";
    // if (/\b(hand-to-hand|martial|brawl|punch|melee|combat)/.test(n)) return "combat";
    if (/\b(hand-to-hand|martial|brawl|punch|melee|combat)/.test(n)) return "none";
    if (/\b(genius|intelligent|intelligence|smart|intellect|tactical|strateg|analysis|super.?mind|omniscient|calculation)/.test(n)) return "genius";
    return "none";
    // return "combat";
}

export default function PowerOverlay({ action, powerName, visible = true, side }: PowerOverlayProps) {
    // const key = "shockwave" as ThemeKey;
    const key = getThemeKey(action, powerName) as ThemeKey;
    const t = key === "absorb" ? createAbsorbTheme() : (THEMES[key] ?? THEMES.combat);

    // 🚀 Restored audio playback trigger on visibility change
    useEffect(() => {
        if (visible) {
            playOverlaySound(key == "none" ? "combat" : key);
        }
    }, [visible, key]);

    if (key == "none") return null;

    return (
        <div
            className={cn(
                "absolute inset-0 z-35 overflow-visible pointer-events-none po-fade",
                visible && "po-fade-in",
                side === "left" ? "" : side === "right" ? "-rotate-y-180" : ""
            )}
        >
            <div className={cn("absolute inset-0 rounded-lg blur-sm opacity-75", t.plate)} />
            <div className={cn("absolute inset-0 rounded-lg", t.bloom)} />
            {t.motion}
            <div className={cn("absolute inset-0 rounded-lg border-2", t.rim)} />
        </div>
    );
}