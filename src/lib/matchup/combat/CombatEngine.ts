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
  StatusEffectType,
} from "./types";
import type { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
import { computeMatchScore } from "@/lib/matchup/scoringUtils";
import { isRealPower } from "@/lib/matchup/cinematicCombatView";

export const MAX_SHIELDS_PER_FIGHTER = 4

export class CombatEngine {
  state: CombatState;
  private eventId = 1;
  private readonly MAX_SHIELDS_PER_FIGHTER = MAX_SHIELDS_PER_FIGHTER;

  constructor() {
    this.state = this.createEmptyState();
  }

  // ── Setup ────────────────────────────────────────────────
  initialize(
    teamA: CharacterWithJoinTeamUniversePowerEnemies[],
    teamB: CharacterWithJoinTeamUniversePowerEnemies[],
    playerSide: Side = "A",
    nameA: string,
    nameB: string
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
      teamAName: nameA ?? "Team A",
      teamBName: nameB ?? "Team B",
      fighters: [...fightersA, ...fightersB],
      turnOrder: [],
      currentTurnIndex: 0,
      round: 1,
      teamOrders: [],
      events: [],
      winner: null,
      playerSide,

      battleStarted: false,
      startingSide: "A",
      activeSide: "A",

      isPlayerTurn: false,
      selectedActorId: null,
      phase: "player",
      availablePlayerIds: [],
      availableAIIds: [],
      selectedTargetId: null
    };

    this.startSidePhase(this.state.startingSide);
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

    const maxEnergy = Math.round(
      50 + overall * 0.5
    );

    const startingEnergy = Math.round(
      maxEnergy * 0.7
    );

    return {
      id: c.id,
      name: c.name ?? "Unknown",
      side,
      original: c,
      row,
      maxHp,
      currentHp: maxHp,
      energy: startingEnergy,
      maxEnergy,
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

    if (!this.state.battleStarted) {
      return { ok: false, reason: "The battle has not started yet" };
    }


    const actor = this.state.fighters.find(
      (f) => f.id === action.actorId
    );

    if (!actor) {
      return { ok: false, reason: "Invalid actor" };
    }

    const activeShieldCount = actor.status.filter(
      (status) => status.type === "shield" && status.duration > 0
    ).length;

    if (action.type === "defend" && activeShieldCount >= 4) {
      return {
        ok: false,
        reason: `${actor.name} already has the maximum of 4 shields`,
      };
    }

    if (action.type === "use_power") {
      const power = actor.powers.find(
        (p) => p.id === action.powerId
      );

      if (
        power?.combatRole === "Defensive" &&
        activeShieldCount >= 4
      ) {
        return {
          ok: false,
          reason: `${actor.name} already has the maximum of 4 shields`,
        };
      }
    }

    if (actor.side !== this.state.activeSide) {
      return { ok: false, reason: "This fighter's side is not currently acting" };
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


    // if (this.state.phase === "player") {
    //   if (!this.state.availablePlayerIds.includes(actor.id)) {
    //     return { ok: false, reason: "This character already acted this phase" };
    //   }
    // }

    const availableIds =
      this.state.phase === "player"
        ? this.state.availablePlayerIds
        : this.state.availableAIIds;

    if (!availableIds.includes(action.actorId)) {
      return {
        ok: false,
        reason: "This fighter is not eligible to act.",
      };
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

      let effectiveRole = power.combatRole;
      if (
        effectiveRole === "Hybrid / Versatile" &&
        action.chosenRole
      ) {
        effectiveRole = action.chosenRole;
      }

      if (
        effectiveRole === "Control" &&
        target.status.some(
          (status) =>
            status.type === "stun_immune" &&
            status.duration > 0
        )
      ) {
        return {
          ok: false,
          reason: `${target.name} is immune to stun`,
        };
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


    const baseDamage = this.calculateDamage(actor);

    const focusStatus = actor.status.find(
      (status) => status.type === "focus" && status.duration > 0
    );

    const damage = focusStatus
      ? Math.round(baseDamage * (1 + focusStatus.value))
      : baseDamage;

    const shieldResult = this.resolveShieldDamage(target, damage);

    const finalDamage = shieldResult.damage;
    const damageBlocked = shieldResult.damageBlocked;
    const totalIncomingDamage = finalDamage + damageBlocked;

    if (finalDamage === 0) {
      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [target.id],
        damage: 0,
        damageBlocked,
        text:
          `${actor.name}'s attack deals ${totalIncomingDamage} damage, ` +
          `but ${target.name}'s SHIELD absorbs all ${damageBlocked} damage! ` +
          `${shieldResult.shieldsConsumed} shield consumed — ` +
          `${shieldResult.shieldsRemaining} remaining. ` +
          `HP unchanged (${target.currentHp}/${target.maxHp}).`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
      }];
    }

    target.currentHp = Math.max(0, target.currentHp - finalDamage);

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
        damage: finalDamage,
        damageBlocked,
        text:
          `${actor.name} strikes ${target.name}${focusStatus ? " with Focus" : ""} ` +
          `for ${totalIncomingDamage} total damage` +
          `${focusStatus ? ` (${focusStatus.value * 100}% boost)` : ""}` +
          `${damageBlocked > 0
            ? ` — SHIELD absorbs ${damageBlocked} damage, allowing ${finalDamage} damage through to HP. ` +
            `${shieldResult.shieldsConsumed} shield consumed — ${shieldResult.shieldsRemaining} remaining.`
            : ` — ${finalDamage} damage dealt to HP.`}` +
          `${isKO ? " — KO!" : ""}`,
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

    const damage = this.calculateDamage(actor, power.score ?? 50);

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

    // Only spend resources after the action has passed target validation.
    const spendPower = () => {
      actor.energy = Math.max(0, actor.energy - cost);
      actor.cooldowns[power.id] = 1;
    };

    // HEALING / SELF-REVIVAL
    if (isHealingPower) {
      const targetId = targetIds[0] ?? actor.id;

      const target = this.state.fighters.find(
        (fighter) => fighter.id === targetId
      );

      if (!target || target.side !== actor.side) return [];

      // A KO'd character can only revive themselves.
      if (!actor.isAlive && target.id !== actor.id) return [];

      const isRevive = !target.isAlive;

      if (isRevive && (target.id !== actor.id || target.hasRevived)) {
        return [];
      }

      if (!isRevive && target.currentHp >= target.maxHp) {
        return [];
      }

      spendPower();

      const healAmount = Math.round(
        target.maxHp * 0.28 + (power.tier ?? 1) * 8
      );

      const previousHp = target.currentHp;

      target.currentHp = Math.min(
        target.maxHp,
        target.currentHp + healAmount
      );

      const actualHealing = target.currentHp - previousHp;

      if (isRevive) {
        target.isAlive = true;
        target.hasRevived = true;
      }

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
      const targetId = targetIds[0] ?? actor.id;

      const target = this.state.fighters.find(
        (fighter) => fighter.id === targetId
      );

      if (!target || !target.isAlive || target.side !== actor.side) {
        return [];
      }

      spendPower();

      const focusStatus: StatusEffect = {
        id: `focus-${this.nextEventId()}`,
        type: "focus",
        name: "Focus",
        duration: 2,
        value: 0.4,
        sourceId: actor.id,
      };

      this.applyStatus(target, focusStatus);

      return [{
        id: this.nextEventId(),
        type: "status_applied",
        power,
        actorId: actor.id,
        targetIds: [target.id],
        status: focusStatus,
        text: `${target.name} gained Focus!`,
        side: actor.side,
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

      // Stun immunity prevents the stun and does not consume energy.
      const isStunImmune = target.status.some(
        (status) =>
          status.type === "stun_immune" && status.duration > 0
      );

      if (isStunImmune) return [];

      const stunStatus: StatusEffect = {
        id: `stun-${target.id}-${power.id}-${this.nextEventId()}`,
        type: "stun",
        name: "Stunned",
        duration: 2,
        value: 1,
        sourceId: actor.id,
      };

      // Only spend resources if the stun was successfully applied.
      const applied = this.applyStatus(target, stunStatus);

      if (!applied) return [];

      spendPower();

      return [{
        id: this.nextEventId(),
        type: "power",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        status: stunStatus,
        text: `${actor.name} uses [${power.name}] and stuns ${target.name} for 2 turns!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }


    // DEFENSIVE
    if (role === "Defensive") {
      spendPower();

      let shieldsAdded = 0;

      // Attempt to apply two shields, respecting the character limit.
      for (let i = 0; i < 2; i++) {
        const applied = this.applyStatus(actor, {
          id: `shield-${actor.id}-${power.id}-${Date.now()}-${i}`,
          type: "shield",
          name: power.name,
          duration: 2,
          value: 1,
          sourceId: actor.id,
        });

        if (applied) shieldsAdded++;
      }

      const totalShields = actor.status.filter(
        (status) => status.type === "shield" && status.duration > 0
      ).length;

      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [actor.id],
        power,
        text: shieldsAdded > 0
          ? `${actor.name} activates [${power.name}] and gains ${shieldsAdded} protective shield${shieldsAdded > 1 ? "s" : ""}! (${totalShields}/4 shields)`
          : `${actor.name} activates [${power.name}], but already has the maximum of 4 shields!`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: actor.name,
        powerName: power.name,
      }];
    }

    // OFFENSIVE
    const target = this.state.fighters.find(
      (fighter) =>
        fighter.id === targetIds[0] &&
        fighter.isAlive &&
        fighter.side !== actor.side
    );

    if (!target) return [];

    spendPower();

    // Calculate bonus from ALL active Focus stacks.
    const focusStacks = actor.status.filter(
      (status) => status.type === "focus" && status.duration > 0
    );

    const totalFocusBonus = focusStacks.reduce(
      (total, status) => total + status.value,
      0
    );

    const finalDamage = Math.round(
      damage * (1 + totalFocusBonus)
    );

    const shieldResult = this.resolveShieldDamage(target, finalDamage);

    const actualDamage = shieldResult.damage;
    const damageBlocked = shieldResult.damageBlocked;
    const totalIncomingDamage = actualDamage + damageBlocked;

    if (actualDamage === 0) {
      return [{
        id: this.nextEventId(),
        type: "defend",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        damage: 0,
        damageBlocked,
        text:
          `${actor.name} unleashes [${power.name}] on ${target.name} ` +
          `for ${totalIncomingDamage} total damage, but the SHIELD ` +
          `absorbs all ${damageBlocked} damage! ` +
          `${shieldResult.shieldsConsumed} shield consumed — ` +
          `${shieldResult.shieldsRemaining} remaining. ` +
          `HP unchanged (${target.currentHp}/${target.maxHp}).`,
        side: actor.side,
        attackerName: actor.name,
        defenderName: target.name,
        powerName: power.name,
      }];
    }

    target.currentHp = Math.max(0, target.currentHp - actualDamage);

    // Consume Focus only after damage successfully lands.
    if (focusStacks.length > 0) {
      const focusIds = new Set(
        focusStacks.map((status) => status.id)
      );

      actor.status = actor.status.filter(
        (status) => !focusIds.has(status.id)
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
      damage: actualDamage,
      damageBlocked,
      text:
        `${actor.name} unleashes [${power.name}] on ${target.name} ` +
        `for ${totalIncomingDamage} total damage` +
        `${focusStacks.length > 0
          ? ` (${focusStacks.length} FOCUS STACKS: +${Math.round(totalFocusBonus * 100)}% DAMAGE!)`
          : ""}` +
        `${damageBlocked > 0
          ? ` — SHIELD absorbs ${damageBlocked} damage, allowing ${actualDamage} damage through to HP. ` +
          `${shieldResult.shieldsConsumed} shield consumed — ${shieldResult.shieldsRemaining} remaining.`
          : ` — ${actualDamage} damage dealt to HP.`}` +
        `${isKO ? " — KO!" : ""}`,
      side: actor.side,
      isKO,
      attackerName: actor.name,
      defenderName: target.name,
      powerName: power.name,
    }];
  }


  private resolveDefend(actor: CombatFighter): CombatEvent {
    const applied = this.applyStatus(actor, {
      id: `shield-${actor.id}-${Date.now()}`,
      type: "shield",
      name: "Guard",
      duration: 2,
      value: 1,
      sourceId: actor.id,
    });

    const totalShields = actor.status.filter(
      (status) => status.type === "shield" && status.duration > 0
    ).length;

    return {
      id: this.nextEventId(),
      type: "status_applied",
      power: { name: "Defense", combatRole: "Defensive" },
      powerName: "Defense",
      actorId: actor.id,
      text: applied
        ? `${actor.name} raises a protective shield! (${totalShields}/4 shields)`
        : `${actor.name} already has the maximum of 4 shields!`,
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

    // Both teams can still continue.
    if (teamAHasFighters && teamBHasFighters) {
      return null;
    }

    // Neither team can continue: draw.
    if (!teamAHasFighters && !teamBHasFighters) {
      this.state.winner = "draw";

      const event: CombatEvent = {
        id: this.nextEventId(),
        type: "battle_end",
        text: "The battle ends in a draw!",
        side: this.state.playerSide,
      };

      this.state.events.push(event);

      return event;
    }

    // One team can continue: victory.
    const winner: Side = teamAHasFighters ? "A" : "B";

    this.state.winner = winner;

    const metadata = this.generateBattleMetadata(winner);

    const event: CombatEvent = {
      id: this.nextEventId(),
      type: "battle_end",
      text: `${winner === "A"
        ? this.state.teamAName
        : this.state.teamBName} wins the battle!`,
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
      teamAName: "Team A",
      teamBName: "Team B",
      fighters: [],
      turnOrder: [],
      currentTurnIndex: 0,
      round: 0,
      teamOrders: [],
      events: [],
      winner: null,
      playerSide: "A",

      battleStarted: false,
      startingSide: "A",
      activeSide: "A",

      phase: "player",
      isPlayerTurn: false,
      selectedActorId: null,
      availablePlayerIds: [],
      availableAIIds: [],
      selectedTargetId: null
    };
  }

  private calculateDamage(
    actor: CombatFighter,
    attackScore: number = 50
  ): number {
    const randomScore = Math.random() * 100;

    const damage =
      actor.overall * 0.90 +
      Math.min(100, Math.max(0, attackScore)) * 0.08 +
      randomScore * 0.02;

    return Math.max(1, Math.round(damage));
  }

  // ── Phase Management ───────────────────────────────────────

  // private getLivingIds(side: Side): number[] {
  //   return this.state.fighters
  //     .filter((f) => f.side === side && f.isAlive)
  //     .map((f) => f.id);
  // }

  // ── Phase Management ───────────────────────────────────────

  private getOppositeSide(side: Side): Side {
    return side === "A" ? "B" : "A";
  }

  // Called after the dice roll.
  startBattle(firstSide: Side) {
    if (this.state.battleStarted || this.state.winner) return;

    this.state.battleStarted = true;
    this.state.startingSide = firstSide;
    this.state.round = 1;

    this.startSidePhase(firstSide);
  }

  // Starts the phase for whichever side should act.
  private startSidePhase(side: Side) {
    if (this.state.winner || !this.state.battleStarted) return;

    const ids = this.getActionableIds(side);

    // No fighters on either side can act.
    if (ids.length === 0) {
      this.checkWinCondition();

      if (this.state.winner) return;

      // If the first side cannot act, try the other side.
      if (side === this.state.startingSide) {
        this.startSidePhase(this.getOppositeSide(side));
      } else {
        // Both phases have been skipped; advance the round.
        this.advanceRoundAndTickCooldowns();
      }

      return;
    }

    this.state.activeSide = side;

    // Determine whether this is the human or AI phase.
    const isPlayerSide = side === this.state.playerSide;

    this.state.phase = isPlayerSide ? "player" : "ai";
    this.state.isPlayerTurn = isPlayerSide;

    this.state.availablePlayerIds = isPlayerSide ? [...ids] : [];
    this.state.availableAIIds = isPlayerSide ? [] : [...ids];

    this.state.selectedActorId = null;
    this.state.selectedTargetId = null;

    this.pushEvent({
      type: "turn_start",
      text: isPlayerSide
        ? "Player Phase – select a character"
        : "Enemy Phase",
      side,
    });
  }

  // Called after the active side uses its action.
  private finishActivePhase() {
    if (this.state.winner) return;

    this.state.availablePlayerIds = [];
    this.state.availableAIIds = [];
    this.state.selectedActorId = null;
    this.state.selectedTargetId = null;

    // The starting side has acted, so the opposing side goes next.
    if (this.state.activeSide === this.state.startingSide) {
      this.startSidePhase(this.getOppositeSide(this.state.activeSide));
      return;
    }

    // Both sides have acted. Start the next round.
    this.advanceRoundAndTickCooldowns();
  }

  private afterPlayerAction(actorId: number) {
    this.finishActivePhase();
  }

  private afterAIAction(actorId: number) {
    this.finishActivePhase();
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
    if (this.state.phase !== "ai") return null;

    const aiSide = this.state.activeSide;

    const candidates = this.getActionableIds(aiSide)
      .map((id) => this.getFighter(id))
      .filter((f): f is CombatFighter => !!f);

    if (candidates.length === 0) return null;

    // Prioritize KO'd characters who can revive themselves.
    const revivalCandidates = candidates.filter((fighter) => !fighter.isAlive && this.canSelfRevive(fighter));

    const livingCandidates = candidates.filter((fighter) => fighter.isAlive);

    const actor = revivalCandidates.length > 0
      ? revivalCandidates[Math.floor(Math.random() * revivalCandidates.length)]
      : livingCandidates[Math.floor(Math.random() * livingCandidates.length)];

    if (!actor) return null;

    // console.log(actor.id)
    // this.selectActor(actor.id);
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

    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];

    // const randomAlly = allies[Math.floor(Math.random() * allies.length)];

    const activeShieldCount = actor.status.filter(
      (status) => status.type === "shield" && status.duration > 0
    ).length;

    const possibleActions: CombatAction[] = [
      {
        type: "basic_attack",
        actorId: actor.id,
        targetIds: [randomEnemy.id],
      },
    ];

    if (activeShieldCount < 4) {
      possibleActions.push({
        type: "defend",
        actorId: actor.id,
      });
    }

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

      const role = power.combatRole;

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
      } else if (role === "Utility") {
        if (allies.length === 0) continue;

        const target = allies[Math.floor(Math.random() * allies.length)];

        possibleActions.push({
          type: "use_power",
          actorId: actor.id,
          powerId: power.id,
          targetIds: [target.id],
        });
      } else if (role === "Defensive") {
        if (activeShieldCount >= 4) continue;
        possibleActions.push({
          type: "use_power",
          actorId: actor.id,
          powerId: power.id,
          targetIds: [actor.id],
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
    const overall = fighter.overall ?? 50;

    const regen = Math.round(
      4 + overall * 0.12
    );

    fighter.energy = Math.min(
      fighter.maxEnergy,
      fighter.energy + regen
    );
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

  private applyStatus(
    fighter: CombatFighter,
    status: StatusEffect
  ): boolean {
    const stackableStatuses: StatusEffectType[] = ["shield", "focus"];

    // Stun immunity prevents new stuns.
    if (
      status.type === "stun" &&
      fighter.status.some(
        (s) => s.type === "stun_immune" && s.duration > 0
      )
    ) {
      return false;
    }

    // Stun is non-stackable: a new stun replaces the existing one.
    if (!stackableStatuses.includes(status.type)) {
      fighter.status = fighter.status.filter(
        (s) => s.type !== status.type
      );
    }

    fighter.status.push(status);
    return true;
  }

  // private hasShield(fighter: CombatFighter): boolean {
  //   return fighter.status.some((s) => s.type === "shield" && s.duration > 0);
  // }

  // private consumeShield(fighter: CombatFighter): boolean {
  //   const shieldIndex = fighter.status.findIndex((s) => s.type === "shield" && s.duration > 0);
  //   if (shieldIndex === -1) return false;

  //   fighter.status.splice(shieldIndex, 1);
  //   return true;
  // }

  private resolveShieldDamage(
    target: CombatFighter,
    incomingDamage: number
  ): {
    damage: number;
    damageBlocked: number;
    shieldsConsumed: number;
    shieldsRemaining: number;
    totalProtection: number;
  } {
    const shields = target.status.filter(
      (status) => status.type === "shield" && status.duration > 0
    );

    const shieldCount = shields.length;

    if (shieldCount === 0) {
      return {
        damage: incomingDamage,
        damageBlocked: 0,
        shieldsConsumed: 0,
        shieldsRemaining: 0,
        totalProtection: 0,
      };
    }

    // Protection is calculated using HP and all shields
    // active immediately before this attack.
    const totalProtection = target.currentHp * shieldCount;

    // Every damaging attack consumes exactly ONE shield.
    const consumedShield = shields[0];

    target.status = target.status.filter(
      (status) => status !== consumedShield
    );

    // Only damage exceeding total protection reaches HP.
    const actualDamage = Math.max(
      0,
      incomingDamage - totalProtection
    );

    const damageBlocked = incomingDamage - actualDamage;

    return {
      damage: actualDamage,
      damageBlocked,
      shieldsConsumed: 1,
      shieldsRemaining: shieldCount - 1,
      totalProtection,
    };
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

      // 2. Tick down status durations and detect expired stuns.
      const hadActiveStun = fighter.status.some(
        (status) => status.type === "stun" && status.duration > 0
      );

      fighter.status = fighter.status
        .map((status) =>
          status.type === "shield" || status.type === "focus"
            ? status
            : { ...status, duration: status.duration - 1 }
        )
        .filter((status) => status.duration > 0);

      const hasActiveStun = fighter.status.some(
        (status) => status.type === "stun" && status.duration > 0
      );

      // When the stun expires, grant one round of stun immunity.
      if (hadActiveStun && !hasActiveStun) {
        fighter.status = fighter.status.filter(
          (status) => status.type !== "stun_immune"
        );

        fighter.status.push({
          id: `stun-immune-${fighter.id}-${this.state.round}`,
          type: "stun_immune",
          name: "Stun Immunity",
          duration: 1,
          value: 1,
          sourceId: fighter.id,
        });
      }

      // 3. Regenerate Energy each round
      this.regenerateEnergy(fighter);
    }

    this.pushEvent({
      type: "round_start",
      text: `—— Round ${this.state.round} ——`,
      side: "A",
    });
    this.startSidePhase(this.state.startingSide);
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

      const blockedEvents = incomingEvents.filter(
        (event) => (event.damageBlocked ?? 0) > 0
      );

      const attacksLanded = damagingEvents.length;

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
        (total, event) => total + (event.damageBlocked ?? 0),
        0
      );

      const offensiveEvents = fighterEvents.filter(
        (event) =>
          event.type === "attack" ||
          event.type === "power" ||
          event.type === "ko" ||
          (event.type === "defend" && (event.damageBlocked ?? 0) > 0)
      );

      const attempts = offensiveEvents.length;


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
      teamAName: this.state.teamAName,
      teamBName: this.state.teamBName,
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

  finishAIPhase() {
    if (this.state.phase !== "ai") return;

    this.finishActivePhase();
  }
}