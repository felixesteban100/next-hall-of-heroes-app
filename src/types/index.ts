export type Character = {
    _id: { $oid: string };
    id: number;
    name: string;
    slug: string;
    powerstats: {
        intelligence: number;
        strength: number;
        speed: number;
        durability: number;
        power: number;
        combat: number;
        total: number;
    };
    appearance: {
        gender: string;
        race: string;
        height: [string, string];
        weight: [string, string];
        eyeColor: string;
        hairColor: string;
        age: string;
        description: string;
    };
    biography: {
        fullName: string;
        alterEgos: string;
        aliases: string[];
        placeOfBirth: string;
        firstAppearance: string;
        publisher: string;
        alignment: string;
        origin: string;
    };
    work: {
        occupation: string;
        base: string;
    };
    connections: {
        groupAffiliation: number[];
        relatives: string;
        enemies: string[];
    };
    images: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
    };
    powers: number[];
    class: number;
    logo: string;
    tier: number;
    weaknesses: string[];
    character_type: string; // anime, cartoon, comic, game, movie, novel, real, tv
}

export type Universe = {
    _id: { $oid: string };
    value: string;
    name: string;
    comics: string[];
    logo: string;
    id: number;
    description: string;
    background: string;
    type: string;
}

export type Enemy = Omit<Character, "biography.publisher" | "connections" | "powers">[]

export type CharacterWithJoinTeamUniversePowerEnemies = Omit<Character, "biography.publisher" | "connections" | "powers"> & {
    biography: {
        publisher: Omit<Universe, "teams">;
    };
    connections: {
        groupAffiliation: /* TeamWithJoinCharacterUniverse[] */ (Omit<Team, "universe"> | FallbackItem)[];
        relatives: string;
        enemies: (Character | FallbackItem)[]/* Enemy */;
    };
    powers: (Power | FallbackItem)[],
}

export type Team = {
    _id: string;
    id: number;
    name: string,
    value: string,
    description: string,
    // universe: { name: string, value: string, logo: string }, // OLD
    universe: number;
    logo: string,
    comics: string[]

    // Base Metadata
    leaders: (number | string)[]
    baseOfOperations?: string;
    alignment: "good" | "bad" | "neutral";
    status?: "active" | "disbanded" | "reformed";
    firstAppearance?: string; // e.g. "The Avengers #1 (Sept. 1963)" or "Ben 10: Alien Force S1E1"

    // Leadership & Relationships
    enemyTeamIds?: number[];
}

export type Power = {
    _id: string;
    id: number;
    name: string,
    value: string,
    img: string,
    description: string,
    score: number
    tier: number
    logo: string
}

export interface FallbackItem {
    name: string;
    isFallback: true;
}

export type QueryOptions = {
    id?: number | { $in: number[] }
    name?: { $in: RegExp[] }
    "biography.fullName"?: { $in: RegExp[] }
    "biography.alignment"?: string;
    "biography.publisher.value"?: string;
    "connections.groupAffiliation.value"?: string | RegExp;
    "appearance.gender"?: string;
    "appearance.race"?: string | RegExp;
    "powers.value"?: string | RegExp;
};