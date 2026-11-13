import type {
  CombatState,
  CombatFighter,
  CombatAction,
  CombatEvent,
  Side,
  Row,
  StatusEffect,
  BattleMetadata,
  FighterTelemetry,
} from "./types";
import type { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import { computeMatchScore } from "@/lib/matchup/scoringUtils";
import { isRealPower } from "@/lib/matchup/cinematicCombatView";

export class CombatEngine {
  state: CombatState;
  private eventId = 1;

  constructor() {
    this.state = this.createEmptyState();
  }

  // ── Setup ────────────────────────────────────────────────
  initialize(
    teamA: CharacterWithJoinTeamUniversePowerEnemies[],
    teamB: CharacterWithJoinTeamUniversePowerEnemies[],
    playerSide: Side = "A"
  ) {
    const idsA = new Set(teamA.map((c) => c.id));
    const cleanTeamB = teamB.filter((c) => !idsA.has(c.id));

    if (cleanTeamB.length < teamB.length) {
      console.warn(
        `[CombatEngine] Removed ${teamB.length - cleanTeamB.length} duplicate characters that were on both teams`
      );
    }

    const fightersA = teamA.map((c, i) =>
      this.toFighter(c, "A", i < Math.ceil(teamA.length / 2) ? "front" : "back")
    );
    const fightersB = teamB.map((c, i) =>
      this.toFighter(c, "B", i < Math.ceil(teamB.length / 2) ? "front" : "back")
    );

    this.state = {
      fighters: [...fightersA, ...fightersB],
      turnOrder: [],
      currentTurnIndex: 0,
      round: 1,
      teamOrders: [],
      events: [],
      winner: null,
      playerSide,
      isPlayerTurn: false,
      selectedActorId: null,
      phase: "player",
      availablePlayerIds: [],
      availableAIIds: [],
      selectedTargetId: null
    };

    this.startPlayerPhase();
  }

  private toFighter(
    c: CharacterWithJoinTeamUniversePowerEnemies,
    side: Side,
    row: Row
  ): CombatFighter {
    const durability = c.powerstats?.durability ?? 50;
    const maxHp = Math.max(40, durability * 2);
    const overall = computeMatchScore(c as any).overall ?? 50;
    const realPowers = (Array.isArray(c.powers) ? c.powers : []).filter(
      isRealPower
    ) as Power[];

    return {
      id: c.id,
      name: c.name ?? "Unknown",
      side,
      original: c,
      row,
      maxHp,
      currentHp: maxHp,
      energy: 80,
      maxEnergy: 100,
      overall,
      powerstats: c.powerstats,
      powers: realPowers,
      status: [],
      cooldowns: {},
      hasRevived: false,
      isAlive: true,
      image: c.images?.md ?? "",
      imageFocus: c.imageFocus ?? "50% 18%",
    };
  }

  // ── Action API ───────────────────────────────────────────

  canPerform(action: CombatAction): { ok: boolean; reason?: string } {
    if (this.state.winner) {
      return { ok: false, reason: "The battle has already ended" };
    }


    const actor = this.state.fighters.find(
      (f) => f.id === action.actorId
    );

    if (!actor) {
      return { ok: false, reason: "Invalid actor" };
    }

    const isStunned = actor.status.some(
      (status) => status.type === "stun" && status.duration > 0
    );

    if (isStunned) {
      return {
        ok: false,
        reason: `${actor.name} is stunned and cannot act this turn`,
      };
    }

    if (!actor.isAlive) {
      const power = action.type === "use_power"
        ? actor.powers.find((p) => p.id === action.powerId)
        : undefined;

      const powerName = power?.name.toLowerCase() ?? "";

      const isHealingPower =
        powerName.includes("heal") ||
        powerName.includes("regene") ||
        powerName.includes("recovery");

      const isSelfRevive =
        isHealingPower &&
        !actor.hasRevived &&
        action.targetIds?.[0] === actor.id;

      if (!isSelfRevive) {
        return { ok: false, reason: "Invalid actor" };
      }
    }


    if (this.state.phase === "player") {
      if (!this.state.availablePlayerIds.includes(actor.id)) {
        return { ok: false, reason: "This character already acted this phase" };
      }
    }

    if (action.type === "use_power") {

      const power = actor.powers.find(
        (p) => p.id === action.powerId
      );

      if (!power) {
        return { ok: false, reason: "Power not found" };
      }

      const targetId = action.targetIds?.[0];

      if (targetId == null) {
        return { ok: false, reason: "No target selected" };
      }

      const target = this.getFighter(targetId);

      if (!target) {
        return { ok: false, reason: "Invalid target" };
      }

      const name = power.name.toLowerCase();

      const isHealingPower =
        name.includes("heal") ||
        name.includes("regene") ||
        name.includes("recovery");
      const isUtilityPower = power.combatRole === "Utility";

      if (isHealingPower) {
        if (target.side !== actor.side) {
          return { ok: false, reason: "Healing powers require an ally" };
        }

        // A KO'd actor must revive themselves, never another fighter.
        if (!actor.isAlive && target.id !== actor.id) {
          return { ok: false, reason: "Self-revival must target the actor" };
        }

        if (!target.isAlive) {
          if (target.id !== actor.id || target.hasRevived) {
            return { ok: false, reason: "Invalid revival target" };
          }
        } else if (target.currentHp >= target.maxHp) {
          return { ok: false, reason: "Target already has full HP" };
        }
      } else if (isUtilityPower) {
        if (target.side !== actor.side || !target.isAlive) {
          return {
            ok: false,
            reason: "Utility powers require a living ally",
          };
        }
      } else if (!target.isAlive) {
        return { ok: false, reason: "Invalid target" };
      }

      if ((actor.cooldowns[power.id] ?? 0) > 0) {
        return {
          ok: false,
          reason: `Power is on cooldown (${actor.cooldowns[power.id]} turns left)`,
        };
      }

      const { energy } = this.getPowerCost(power);

      if (actor.energy < energy) {
        return {
          ok: false,
          reason: `Not enough energy (needs ${energy})`,
        };
      }

    }

    return { ok: true };
  }


  performAction(action: CombatAction): CombatEvent[] {
    const check = this.canPerform(action);
    if (!check.ok) {
      console.warn("[CombatEngine]", check.reason);
      return [];
    }

    const actor = this.state.fighters.find((f) => f.id === action.actorId)!;
    let events: CombatEvent[] = [];

    switch (action.type) {
      case "basic_attack":
        events = this.resolveBasicAttack(actor, action.targetIds?.[0]);
        break;
      case "use_power":
        events = this.resolvePower(
          actor,
          action.powerId!,
          action.targetIds ?? [],
          action.chosenRole
        );
        break;
      case "defend":
        events = [this.resolveDefend(actor)];
        break;
      case "swap_row":
        events = [this.resolveSwapRow(actor, action.newRow ?? "front")];
        break;
      case "pass":
        events = [
          {
            id: this.nextEventId(),
            type: "turn_start",
            actorId: actor.id,
            text: `${actor.name} holds position.`,
            side: actor.side,
            attackerName: actor.name,
          },
        ];
        break;
    }

    this.state.events.push(...events);

    const endEvent = this.checkWinCondition();

    if (endEvent) {
      events.push(endEvent);
    }

    if (this.state.winner) return events;

    // Phase progression
    if (this.state.phase === "player") {
      this.afterPlayerAction(actor.id);
    } else {
      this.afterAIAction(actor.id);
    }

    return events;
  }

  // ── Resolvers ──────────────────────────────────────────
  private resolveBasicAttack(actor: CombatFighter, targetId?: number): CombatEvent[] {
    const target = this.state.fighters.find((f) => f.id === targetId && f.isAlive);
    if (!target) return [];

    if (this.hasShield(target)) {
      this.consumeShield(target);

      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [target.id],
        damage: 0,
        text: `${target.name}'s shield absorbs the attack from ${actor.name}!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
      }];
    }

    const base =
      16 +
      actor.powerstats.strength * 0.32 +
      actor.powerstats.combat * 0.18 +
      actor.overall * 0.12;

    const baseDamage = Math.max(
      8,
      Math.round(base + (Math.random() * 14 - 7))
    );

    const focusStatus = actor.status.find(
      (status) => status.type === "focus" && status.duration > 0
    );

    const damage = focusStatus
      ? Math.round(baseDamage * (1 + focusStatus.value))
      : baseDamage;

    target.currentHp = Math.max(0, target.currentHp - damage);

    // Consume Focus only after damage successfully lands.
    if (focusStatus) {
      actor.status = actor.status.filter(
        (status) => status.id !== focusStatus.id
      );
    }

    const isKO = target.currentHp <= 0;
    if (isKO) target.isAlive = false;

    return [
      {
        id: this.nextEventId(),
        type: isKO ? "ko" : "attack",
        actorId: actor.id,
        targetIds: [target.id],
        damage,
        text: `${actor.name} strikes ${target.name}${focusStatus ? " with Focus" : ""} for ${damage} damage${focusStatus ? ` (${focusStatus.value * 100}% boost)` : ""}${isKO ? " — KO!" : "!"}`,
        side: actor.side,
        isKO,
        attackerName: actor.name,
        defenderName: target.name,
      },
    ];
  }


  private resolvePower(
    actor: CombatFighter,
    powerId: number,
    targetIds: number[],
    chosenRole?: PowerRole
  ): CombatEvent[] {
    const power = actor.powers.find((p) => p.id === powerId);
    if (!power) return [];

    const tierBonus = (power.tier ?? 1) * 0.09;
    const scoreBonus = Math.min(power.score ?? 40, 100) / 110;
    const multiplier = 1.15 + tierBonus + scoreBonus;

    const base =
      20 +
      actor.powerstats.power * 0.38 +
      actor.powerstats.combat * 0.15 +
      actor.overall * 0.18;

    const damage = Math.max(12, Math.round(base * multiplier));

    const { energy: cost } = this.getPowerCost(power);

    let role = power.combatRole;

    if (role === "Hybrid / Versatile" && chosenRole) {
      role = chosenRole;
    }


    const powerName = power.name.toLowerCase();

    const isHealingPower =
      powerName.includes("heal") ||
      powerName.includes("regene") ||
      powerName.includes("recovery");

    actor.energy = Math.max(0, actor.energy - cost);
    actor.cooldowns[power.id] = 1;

    // HEALING / SELF-REVIVAL
    if (isHealingPower) {
      const targetId = targetIds[0] ?? actor.id;

      const target = this.state.fighters.find((fighter) => fighter.id === targetId);

      if (!target || target.side !== actor.side) return [];

      // A KO'd character can only revive themselves.
      if (!actor.isAlive && target.id !== actor.id) return [];

      const isRevive = !target.isAlive;

      if (isRevive && (target.id !== actor.id || target.hasRevived)) return [];
      if (!isRevive && target.currentHp >= target.maxHp) return [];

      const healAmount = Math.round(target.maxHp * 0.28 + (power.tier ?? 1) * 8);

      const previousHp = target.currentHp;

      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);

      const actualHealing = target.currentHp - previousHp;

      if (isRevive) target.isAlive = true; target.hasRevived = true;

      return [{
        id: this.nextEventId(),
        type: isRevive ? "revive" : "heal",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        healing: actualHealing,
        text: isRevive
          ? `${actor.name} regenerates and revives themselves with ${actualHealing} HP!`
          : `${actor.name} uses [${power.name}] and restores ${actualHealing} HP to ${target.name}!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }

    // UTILITY — FOCUS
    if (role === "Utility") {
      const target = this.state.fighters.find(
        (fighter) =>
          fighter.id === (targetIds[0] ?? actor.id) &&
          fighter.isAlive &&
          fighter.side === actor.side
      );

      if (!target) return [];

      const focusStatus = {
        id: `focus-${target.id}-${power.id}-${Date.now()}`,
        type: "focus" as const,
        name: "Focused",
        duration: 2,
        value: 0.40,
        sourceId: actor.id,
      };

      this.applyStatus(target, focusStatus);

      return [{
        id: this.nextEventId(),
        type: "status_applied",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        status: focusStatus,
        text: `${actor.name} uses [${power.name}] and grants ${target.name} Focus! Their next damaging attack is empowered by ${focusStatus.value * 100}!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }

    // CONTROL
    if (role === "Control") {
      const target = this.state.fighters.find(
        (fighter) =>
          fighter.id === targetIds[0] &&
          fighter.isAlive &&
          fighter.side !== actor.side
      );

      if (!target) return [];

      // Apply stun for the target's next round.
      this.applyStatus(target, {
        id: `stun-${target.id}-${power.id}-${Date.now()}`,
        type: "stun",
        name: "Stunned",
        duration: 2,
        value: 1,
        sourceId: actor.id,
      });

      return [{
        id: this.nextEventId(),
        // type: "status_applied",
        type: "power",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        status: {
          id: `stun-${target.id}-${power.id}`,
          type: "stun",
          name: "Stunned",
          duration: 2,
          value: 1,
          sourceId: actor.id,
        },
        text: `${actor.name} uses [${power.name}] and completely disables ${target.name}!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }

    // DEFENSIVE
    if (role === "Defensive") {
      // Apply two independent shield charges.
      for (let i = 0; i < 2; i++) {
        this.applyStatus(actor, {
          id: `shield-${actor.id}-${power.id}-${Date.now()}-${i}`,
          type: "shield",
          name: power.name,
          duration: 2,
          value: 1,
          sourceId: actor.id,
        });
      }

      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [actor.id],
        power,
        text: `${actor.name} activates [${power.name}] and gains two protective shields!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: actor.name,
        powerName: power.name,
      }];
    }

    // OFFENSIVE
    const target = this.state.fighters.find(
      (f) => f.id === targetIds[0] && f.isAlive
    );

    if (!target) return [];

    if (this.hasShield(target)) {
      this.consumeShield(target);

      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        damage,
        text: `${target.name}'s shield absorbs [${power.name}]!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }

    const focusStatus = actor.status.find(
      (status) => status.type === "focus" && status.duration > 0
    );

    const finalDamage = focusStatus
      ? Math.round(damage * (1 + focusStatus.value))
      : damage;

    target.currentHp = Math.max(0, target.currentHp - finalDamage);

    // Consume Focus only after damage successfully lands.
    if (focusStatus) {
      actor.status = actor.status.filter(
        (status) => status.id !== focusStatus.id
      );
    }

    const isKO = target.currentHp <= 0;

    if (isKO) {
      target.isAlive = false;
    }

    return [{
      id: this.nextEventId(),
      type: isKO ? "ko" : "power",
      actorId: actor.id,
      targetIds: [target.id],
      power,
      damage: finalDamage,
      text: `${actor.name} unleashes [${power.name}] on ${target.name} for ${finalDamage} damage${focusStatus ? " (FOCUS BONUS!)" : ""}${isKO ? " — KO!" : "!"}`,
      side: actor.side,
      isKO,
      attackerName: actor.name,
      defenderName: target.name,
      powerName: power.name,
    }];
  }


  private resolveDefend(actor: CombatFighter): CombatEvent {
    this.applyStatus(actor, {
      id: `shield-${actor.id}-${Date.now()}`,
      type: "shield",
      name: "Guard",
      duration: 2,
      value: 1,
      sourceId: actor.id,
    });

    return {
      id: this.nextEventId(),
      type: "status_applied",
      actorId: actor.id,
      text: `${actor.name} raises a protective shield.`,
      side: actor.side,
      attackerName: actor.name,
    };
  }

  private resolveSwapRow(actor: CombatFighter, newRow: Row): CombatEvent {
    actor.row = newRow;
    return {
      id: this.nextEventId(),
      type: "swap_row",
      actorId: actor.id,
      text: `${actor.name} moves to the ${newRow} line.`,
      side: actor.side,
      attackerName: actor.name,
    };
  }

  // ── Win Condition ────────────────────────────────────────
  private checkWinCondition(): CombatEvent | null {
    // Don't check again if the battle has already ended.
    if (this.state.winner) return null;

    const teamAHasFighters = this.state.fighters.some(
      (fighter) =>
        fighter.side === "A" &&
        (fighter.isAlive || this.canSelfRevive(fighter))
    );

    const teamBHasFighters = this.state.fighters.some(
      (fighter) =>
        fighter.side === "B" &&
        (fighter.isAlive || this.canSelfRevive(fighter))
    );

    // Both teams still have fighters capable of continuing.
    if (teamAHasFighters && teamBHasFighters) {
      return null;
    }

    // Neither team can continue.
    if (!teamAHasFighters && !teamBHasFighters) {
      return null; // Handle a draw here if your game supports it.
    }

    const winner: Side = teamAHasFighters ? "A" : "B";

    this.state.winner = winner;

    const metadata = this.generateBattleMetadata(winner);

    const event: CombatEvent = {
      id: this.nextEventId(),
      type: "battle_end",
      text: `Team ${winner} wins the battle!`,
      side: winner,
      metadata,
    };

    this.state.events.push(event);

    return event;
  }

  // ── Public Helpers ───────────────────────────────────────
  getState(): CombatState {
    return this.state;
  }

  getAliveFighters(side?: Side): CombatFighter[] {
    return this.state.fighters.filter(
      (f) => f.isAlive && (side === undefined || f.side === side)
    );
  }

  getFighter(id: number): CombatFighter | undefined {
    return this.state.fighters.find((f) => f.id === id);
  }

  // ── Internal ─────────────────────────────────────────────
  private nextEventId() {
    return this.eventId++;
  }

  private pushEvent(partial: Omit<CombatEvent, "id">) {
    this.state.events.push({ ...partial, id: this.nextEventId() });
  }

  private createEmptyState(): CombatState {
    return {
      fighters: [],
      turnOrder: [],
      currentTurnIndex: 0,
      round: 0,
      teamOrders: [],
      events: [],
      winner: null,
      playerSide: "A",
      phase: "player",
      isPlayerTurn: false,
      selectedActorId: null,
      availablePlayerIds: [],
      availableAIIds: [],
      selectedTargetId: null
    };
  }

  // ── Phase Management ───────────────────────────────────────

  // private getLivingIds(side: Side): number[] {
  //   return this.state.fighters
  //     .filter((f) => f.side === side && f.isAlive)
  //     .map((f) => f.id);
  // }

  startPlayerPhase() {
    const idsPlayer = this.getActionableIds(this.state.playerSide);
    const idsAI = this.getActionableIds(
      this.state.playerSide === "A" ? "B" : "A"
    );

    this.state.phase = "player";
    this.state.isPlayerTurn = true;

    this.state.availablePlayerIds = [...idsPlayer];
    this.state.availableAIIds = [...idsAI];

    // Prefer a living character; otherwise select a character
    // who is eligible for self-revival.
    // const livingIds = this.getLivingIds(this.state.playerSide);

    this.state.selectedActorId =
      /* livingIds[0] ?? idsPlayer[0] ?? */ null;

    this.pushEvent({
      type: "turn_start",
      text: `Player Phase – select a character`,
      side: this.state.playerSide,
    });
  }

  startAIPhase() {
    const aiSide =
      this.state.playerSide === "A" ? "B" : "A";

    const ids = this.getActionableIds(aiSide);

    this.state.phase = "ai";
    this.state.isPlayerTurn = false;
    this.state.availableAIIds = [...ids];
    this.state.selectedActorId = null;

    this.pushEvent({
      type: "turn_start",
      text: `Enemy Phase`,
      side: aiSide,
    });
  }

  private afterPlayerAction(actorId: number) {
    this.state.availablePlayerIds = [];
    this.state.selectedActorId = null;
    this.startAIPhase();
  }

  private afterAIAction(actorId: number) {
    this.state.availableAIIds = [];
    this.state.selectedTargetId = null;
    // 🌟 Safely tick down cooldowns and advance round
    this.advanceRoundAndTickCooldowns();
  }

  selectActor(id: number) {
    if (this.state.phase !== "player") return;
    if (!this.state.availablePlayerIds.includes(id)) return;

    this.state.selectedActorId = id;
  }

  deselectActor() {
    if (this.state.phase !== "player") return;

    this.state.selectedActorId = null;
  }

  // make this select the target on the other side
  selectTarget(id: number) {
    if (this.state.phase !== "player") return;

    const target = this.getFighter(id);

    if (!target || !target.isAlive) return;
    if (target.side === this.state.playerSide) return;

    this.state.selectedTargetId = id;
  }



  chooseAIAction(): CombatAction | null {
    if (this.state.phase !== "ai" || this.state.availableAIIds.length === 0) {
      return null;
    }

    const candidates = this.state.availableAIIds
      .map((id) => this.getFighter(id))
      .filter(
        (f): f is CombatFighter =>
          !!f && (f.isAlive || this.canSelfRevive(f))
      );

    if (candidates.length === 0) return null;

    // Prioritize KO'd characters who can revive themselves.
    const revivalCandidates = candidates.filter(
      (fighter) => !fighter.isAlive && this.canSelfRevive(fighter)
    );

    const livingCandidates = candidates.filter(
      (fighter) => fighter.isAlive
    );

    const actor = revivalCandidates.length > 0
      ? revivalCandidates[Math.floor(Math.random() * revivalCandidates.length)]
      : livingCandidates[Math.floor(Math.random() * livingCandidates.length)];

    if (!actor) return null;

    this.regenerateEnergy(actor);

    // A KO'd AI character can only perform self-revival.
    if (!actor.isAlive) {
      const revivePower = actor.powers.find((power) => {
        const name = power.name.toLowerCase();

        const isHealingPower =
          name.includes("heal") ||
          name.includes("regene") ||
          name.includes("recovery");

        const cooldown = actor.cooldowns[power.id] ?? 0;
        const { energy } = this.getPowerCost(power);

        return (
          isHealingPower &&
          cooldown <= 0 &&
          actor.energy >= energy
        );
      });

      if (!revivePower || actor.hasRevived) return null;

      return {
        type: "use_power",
        actorId: actor.id,
        powerId: revivePower.id,
        targetIds: [actor.id],
      };
    }

    const enemies = this.getAliveFighters(this.state.playerSide);
    const allies = this.getAliveFighters(actor.side);

    if (enemies.length === 0) return null;

    const randomEnemy =
      enemies[Math.floor(Math.random() * enemies.length)];

    const randomAlly =
      allies[Math.floor(Math.random() * allies.length)];

    const possibleActions: CombatAction[] = [
      {
        type: "basic_attack",
        actorId: actor.id,
        targetIds: [randomEnemy.id],
      },
      {
        type: "defend",
        actorId: actor.id,
      },
    ];

    const readyPowers = actor.powers.filter((power) => {
      const cooldown = actor.cooldowns[power.id] ?? 0;
      const { energy } = this.getPowerCost(power);

      return cooldown <= 0 && actor.energy >= energy;
    });

    for (const power of readyPowers) {
      const name = power.name.toLowerCase();

      const isHealingPower =
        name.includes("heal") ||
        name.includes("regene") ||
        name.includes("recovery");

      if (isHealingPower) {
        const injuredAllies = allies.filter(
          (fighter) => fighter.currentHp < fighter.maxHp
        );

        if (injuredAllies.length === 0) continue;

        const target =
          injuredAllies[Math.floor(Math.random() * injuredAllies.length)];

        possibleActions.push({
          type: "use_power",
          actorId: actor.id,
          powerId: power.id,
          targetIds: [target.id],
        });
      } else {
        possibleActions.push({
          type: "use_power",
          actorId: actor.id,
          powerId: power.id,
          targetIds: [randomEnemy.id],
        });
      }
    }

    return possibleActions[
      Math.floor(Math.random() * possibleActions.length)
    ];
  }



  private regenerateEnergy(fighter: CombatFighter) {
    const regen = Math.round(
      14 +
      fighter.powerstats.power * 0.07 +
      fighter.powerstats.intelligence * 0.05
    );
    fighter.energy = Math.min(fighter.maxEnergy, fighter.energy + regen);
  }

  private getPowerCost(power: Power): { energy: number; cooldown: number } {
    const tier = Math.min(power.tier ?? 1, 10);
    const score = Math.min(power.score ?? 40, 100);

    const energy = Math.round(14 + tier * 5 + score * 0.18);
    const cooldown = 1;

    return {
      energy: Math.min(45, Math.max(12, energy)),
      cooldown,
    };
  }

  // private applyStatus(fighter: CombatFighter, status: StatusEffect) {
  //   fighter.status = fighter.status.filter((s) => s.type !== status.type);
  //   fighter.status.push(status);
  // }

  private applyStatus(fighter: CombatFighter, status: StatusEffect) {
    // Allow shields to stack infinitely; overwrite other status types to refresh them
    if (status.type !== "shield") {
      fighter.status = fighter.status.filter((s) => s.type !== status.type);
    }
    fighter.status.push(status);
  }

  private hasShield(fighter: CombatFighter): boolean {
    return fighter.status.some((s) => s.type === "shield" && s.duration > 0);
  }

  private consumeShield(fighter: CombatFighter): boolean {
    const shieldIndex = fighter.status.findIndex((s) => s.type === "shield" && s.duration > 0);
    if (shieldIndex === -1) return false;

    fighter.status.splice(shieldIndex, 1);
    return true;
  }

  private advanceRoundAndTickCooldowns() {
    this.state.round++;

    for (const fighter of this.state.fighters) {
      if (!fighter.isAlive) continue;

      // 1. Tick down cooldowns by 1 round
      for (const key of Object.keys(fighter.cooldowns)) {
        const powerId = Number(key);
        fighter.cooldowns[powerId] = Math.max(0, (fighter.cooldowns[powerId] ?? 0) - 1);
      }

      // 🌟 2. Tick down status durations and filter out expired ones (duration <= 0)
      fighter.status = fighter.status
        .map((status) =>
          status.type === "shield"
            ? status
            : { ...status, duration: status.duration - 1 }
        )
        .filter((status) => status.duration > 0);

      // 3. Regenerate Energy each round
      this.regenerateEnergy(fighter);
    }

    this.pushEvent({
      type: "round_start",
      text: `—— Round ${this.state.round} ——`,
      side: "A",
    });
    this.startPlayerPhase();
  }

  private generateBattleMetadata(winner: Side): BattleMetadata {
    const events = this.state.events;
    const fighters = this.state.fighters;

    const createTelemetry = (fighter: CombatFighter): FighterTelemetry => {
      const fighterEvents = events.filter(
        (event) => event.actorId === fighter.id
      );

      const incomingEvents = events.filter(
        (event) => event.targetIds?.includes(fighter.id)
      );

      const damagingEvents = fighterEvents.filter(
        (event) =>
          (event.type === "attack" ||
            event.type === "power" ||
            event.type === "ko") &&
          (event.damage ?? 0) > 0
      );

      // The attacker owns the attempted action, but the defender receives
      // credit for the damage their shield prevented.
      const blockedEvents = incomingEvents.filter(
        (event) => event.type === "defend" && (event.damage ?? 0) > 0
      );

      const attacksLanded = damagingEvents.length;

      const blockedCount = fighterEvents.filter(
        (event) => event.type === "defend" && (event.damage ?? 0) > 0
      ).length;

      const damageDealt = damagingEvents.reduce(
        (total, event) => total + (event.damage ?? 0),
        0
      );

      const damageTaken = incomingEvents
        .filter(
          (event) =>
            event.type === "attack" ||
            event.type === "power" ||
            event.type === "ko"
        )
        .reduce(
          (total, event) => total + (event.damage ?? 0),
          0
        );

      const damageBlocked = blockedEvents.reduce(
        (total, event) => total + (event.damage ?? 0),
        0
      );

      const healingDone = fighterEvents.reduce(
        (total, event) => total + (event.healing ?? 0),
        0
      );

      const kos = fighterEvents.filter(
        (event) => event.type === "ko"
      ).length;

      const revivals = incomingEvents.filter(
        (event) => event.type === "revive"
      ).length;

      const attempts = attacksLanded + blockedCount;

      return {
        name: fighter.name,
        attacksLanded,
        damageDealt,
        damageBlocked,
        hitsTaken: incomingEvents.filter(
          (event) =>
            (event.type === "attack" ||
              event.type === "power" ||
              event.type === "ko") &&
            (event.damage ?? 0) > 0
        ).length,
        damageTaken,
        revivals,
        healingDone,
        accuracy: attempts > 0
          ? Math.round((attacksLanded / attempts) * 100)
          : 0,
        survivalRate: Math.round(
          (fighter.currentHp / fighter.maxHp) * 100
        ),
        efficiency: Math.round(
          (damageDealt / Math.max(1, damageTaken)) * 100
        ),
        kos,
      };
    };

    const teamA = fighters.filter((fighter) => fighter.side === "A");
    const teamB = fighters.filter((fighter) => fighter.side === "B");

    const teamAStats = teamA.map(createTelemetry);
    const teamBStats = teamB.map(createTelemetry);

    const emptyTelemetry: FighterTelemetry = {
      name: "—",
      attacksLanded: 0,
      damageDealt: 0,
      damageBlocked: 0,
      hitsTaken: 0,
      damageTaken: 0,
      revivals: 0,
      healingDone: 0,
      accuracy: 0,
      survivalRate: 0,
      efficiency: 0,
      kos: 0,
    };

    const best = (
      stats: FighterTelemetry[],
      key: keyof FighterTelemetry
    ): FighterTelemetry => {
      if (stats.length === 0) return emptyTelemetry;

      return stats.reduce((current, candidate) =>
        Number(candidate[key]) > Number(current[key])
          ? candidate
          : current
      );
    };

    const totalDamageA = teamAStats.reduce(
      (total, fighter) => total + fighter.damageDealt,
      0
    );

    const totalDamageB = teamBStats.reduce(
      (total, fighter) => total + fighter.damageDealt,
      0
    );

    const totalDamageDealt = totalDamageA + totalDamageB;

    const winnerDamage = winner === "A" ? totalDamageA : totalDamageB;
    const loserDamage = winner === "A" ? totalDamageB : totalDamageA;

    const dominance =
      totalDamageDealt > 0
        ? Math.round(
          (Math.abs(winnerDamage - loserDamage) / totalDamageDealt) *
          100
        )
        : 0;

    const totalKoCount = events.filter(
      (event) => event.type === "ko"
    ).length;

    const totalHealingDone = events.reduce(
      (total, event) => total + (event.healing ?? 0),
      0
    );

    // const allStats = [...teamAStats, ...teamBStats];

    const biggestHit = events
      .filter(
        (event) =>
          (event.type === "attack" ||
            event.type === "power" ||
            event.type === "ko") &&
          (event.damage ?? 0) > 0
      )
      .reduce<{
        name: string;
        damage: number;
      }>(
        (best, event) => {
          if ((event.damage ?? 0) > best.damage) {
            return {
              name: event.attackerName ?? "—",
              damage: event.damage ?? 0,
            };
          }

          return best;
        },
        {
          name: "—",
          damage: 0,
        }
      );

    let longestStreak = {
      name: "—",
      streak: 0,
    };

    let currentStreak = 0;
    let previousAttackerId: number | undefined;

    for (const event of events) {
      const isDamageEvent =
        (event.type === "attack" ||
          event.type === "power" ||
          event.type === "ko") &&
        (event.damage ?? 0) > 0;

      if (!isDamageEvent || event.actorId == null) {
        continue;
      }

      if (event.actorId === previousAttackerId) {
        currentStreak++;
      } else {
        previousAttackerId = event.actorId;
        currentStreak = 1;
      }

      if (currentStreak > longestStreak.streak) {
        const fighter = fighters.find(
          (f) => f.id === event.actorId
        );

        longestStreak = {
          name: fighter?.name ?? "—",
          streak: currentStreak,
        };
      }
    }

    const winnerTeam = winner === "A" ? teamAStats : teamBStats;

    const perfectVictory = winnerTeam.every(
      (fighter) => fighter.survivalRate === 100
    );

    const teamAPowerAvg =
      teamA.length > 0
        ? teamA.reduce((sum, fighter) => sum + fighter.overall, 0) / teamA.length
        : 0;

    const teamBPowerAvg =
      teamB.length > 0
        ? teamB.reduce((sum, fighter) => sum + fighter.overall, 0) / teamB.length
        : 0;

    const winnerPowerAvg =
      winner === "A" ? teamAPowerAvg : teamBPowerAvg;

    return {
      totalRounds: this.state.round,
      totalKoCount,

      winType: perfectVictory
        ? "Perfect Victory"
        : "Elimination Victory",

      dominance,

      teamAPowerAvg,
      teamBPowerAvg,
      winnerPowerAvg,

      teamAStats,
      teamBStats,

      mvpA: best(teamAStats, "damageDealt"),
      mvpB: best(teamBStats, "damageDealt"),

      wallA: best(teamAStats, "damageBlocked"),
      wallB: best(teamBStats, "damageBlocked"),

      strikerA: best(teamAStats, "attacksLanded"),
      strikerB: best(teamBStats, "attacksLanded"),

      reviveA: best(teamAStats, "revivals"),
      reviveB: best(teamBStats, "revivals"),

      healerA: best(teamAStats, "healingDone"),
      healerB: best(teamBStats, "healingDone"),

      longestStreak,
      mostDamageSingleHit: biggestHit,

      totalDamageDealt,
      totalHealingDone,

      mostKOA: best(teamAStats, "kos"),
      mostKOB: best(teamBStats, "kos"),

    };
  }


  private canSelfRevive(fighter: CombatFighter): boolean {
    if (fighter.isAlive || fighter.hasRevived) {
      return false;
    }

    return fighter.powers.some((power) => {
      const name = power.name.toLowerCase();

      const isHealingPower =
        name.includes("heal") ||
        name.includes("regene") ||
        name.includes("recovery");

      const cooldown = fighter.cooldowns[power.id] ?? 0;
      const { energy } = this.getPowerCost(power);

      return (
        isHealingPower &&
        cooldown <= 0 &&
        fighter.energy >= energy
      );
    });
  }


  private getActionableIds(side: Side): number[] {
    return this.state.fighters
      .filter(
        (fighter) =>
          fighter.side === side &&
          (fighter.isAlive || this.canSelfRevive(fighter)) &&
          !fighter.status.some(
            (status) => status.type === "stun" && status.duration > 0
          )
      )
      .map((fighter) => fighter.id);
  }
}