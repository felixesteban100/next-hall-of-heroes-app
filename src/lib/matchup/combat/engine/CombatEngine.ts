import type { CombatState, CombatFighter, CombatAction, CombatEvent, Side, Row, StatusEffect, BattleMetadata, FighterTelemetry, StatusEffectType, TeamOrderType } from "../types/types";
import type { CharacterWithJoinTeamUniversePowerEnemies, Power, PowerRole } from "@/types";
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
      selectedTargetId: null,
      lastActorBySide: {
        A: null,
        B: null,
      },
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
    const overall = c.overall ?? 50;
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
      fatigue: 0,
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

    const activeShieldCount = actor.status.filter((status) => status.type === "shield" && status.duration > 0).length;

    if (action.type === "defend" && activeShieldCount >= 4) {
      return {
        ok: false,
        reason: `${actor.name} already has the maximum of 4 shields`,
      };
    }

    if (actor.side !== this.state.activeSide) {
      return { ok: false, reason: "This fighter's side is not currently acting" };
    }

    const isStunned = actor.status.some((status) => status.type === "stun" && status.duration > 0);

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
    if (action.type === "team_order") {
      if (action.teamOrderType !== "protect") {
        return { ok: false, reason: "Unsupported team order" };
      }

      const targetId = action.targetIds?.[0];
      const target = targetId != null ? this.getFighter(targetId) : undefined;

      if (!actor.isAlive) {
        return { ok: false, reason: "A KO'd fighter cannot protect an ally" };
      }

      if (!target || !target.isAlive) {
        return { ok: false, reason: "Invalid protection target" };
      }

      if (target.side !== actor.side) {
        return { ok: false, reason: "You can only protect an ally" };
      }

      if (target.id === actor.id) {
        return { ok: false, reason: "You cannot protect yourself" };
      }

      if (
        this.state.teamOrders.some(
          (order) =>
            order.type === "protect" &&
            order.side === actor.side &&
            order.targetId === target.id &&
            order.duration > 0 &&
            (order.value ?? 0) > 0
        )
      ) {
        return {
          ok: false,
          reason: `${target.name} is already protected`,
        };
      }
    }

    // if (this.state.phase === "player") {
    //   if (!this.state.availablePlayerIds.includes(actor.id)) {
    //     return { ok: false, reason: "This character already acted this phase" };
    //   }
    // }

    const availableIds = this.state.phase === "player"
      ? this.state.availablePlayerIds
      : this.state.availableAIIds;

    if (!availableIds.includes(action.actorId)) {
      return {
        ok: false,
        reason: "This fighter is not eligible to act.",
      };
    }

    if (action.type === "use_power") {
      const power = actor.powers.find((p) => p.id === action.powerId);

      if (!power) {
        return { ok: false, reason: "Power not found" };
      }

      // SILENCE — PREVENTS POWER USAGE
      const isSilenced = actor.status.some(
        (status) =>
          status.type === "silence" &&
          status.duration > 0
      );

      if (isSilenced) {
        return {
          ok: false,
          reason: `${actor.name} is silenced and cannot use powers`,
        };
      }

      const targetIds = [...new Set(action.targetIds ?? [])];

      if (targetIds.length === 0) return { ok: false, reason: "No target selected" };

      const targets = targetIds.map(id => this.getFighter(id));
      if (targets.some(target => !target)) return { ok: false, reason: "Invalid target" };

      const validTargets = targets as CombatFighter[];
      const effectiveRole = power.combatRole === "Hybrid / Versatile" ? action.chosenRole : power.combatRole;

      if (!effectiveRole || effectiveRole === "Hybrid / Versatile") return { ok: false, reason: "Choose a combat role" };

      const eligibleTargets = this.getPowerEligibleTargets(actor, power, effectiveRole);
      const eligibleIds = eligibleTargets.map(f => f.id);
      const expectedIds = this.getPowerTargetIds(actor, power, effectiveRole);

      if (power.targetType === "Self") {
        if (targetIds.length !== 1 || targetIds[0] !== actor.id || !eligibleIds.includes(actor.id)) {
          return { ok: false, reason: "This power must target the acting fighter" };
        }
      } else if (power.targetType === "Single Target") {
        if (targetIds.length !== 1 || !eligibleIds.includes(targetIds[0])) {
          return { ok: false, reason: "This power requires exactly one eligible target" };
        }
      } else if (power.targetType === "Area of Effect (AoE)") {
        if (targetIds.length !== expectedIds.length || !expectedIds.every(id => targetIds.includes(id))) {
          return { ok: false, reason: "This power must target all eligible fighters" };
        }
      } else if (power.targetType === "Self / AoE") {
        if (targetIds.length !== expectedIds.length || !expectedIds.every(id => targetIds.includes(id))) {
          return { ok: false, reason: "This power must target itself and all eligible fighters" };
        }
      } else if (power.targetType === "Single Target / AoE") {
        if (targetIds.some(id => !eligibleIds.includes(id))) {
          return { ok: false, reason: "This power contains an invalid target" };
        }
      } else {
        return { ok: false, reason: "Unsupported target type" };
      }

      for (const target of validTargets) {
        if (this.isHealingPower(power)) {
          if (target.side !== actor.side) return { ok: false, reason: "Healing powers require an ally" };
          if (!actor.isAlive && target.id !== actor.id) return { ok: false, reason: "Self-revival must target the actor" };
          if (!target.isAlive && (target.id !== actor.id || target.hasRevived)) return { ok: false, reason: "Invalid revival target" };
          if (target.isAlive && target.currentHp >= target.maxHp) return { ok: false, reason: "Target already has full HP" };
        } else if (effectiveRole === "Utility" || effectiveRole === "Defensive") {
          if (target.side !== actor.side || !target.isAlive) return { ok: false, reason: "This power requires a living ally" };
        } else {
          if (!target.isAlive || target.side === actor.side) return { ok: false, reason: "Invalid enemy target" };
        }
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

  performAction(action: CombatAction, deferPhaseProgression = false): CombatEvent[] {
    const check = this.canPerform(action);
    if (!check.ok) {
      console.warn("[CombatEngine] Action rejected:", { action, reason: check.reason });
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
      case "team_order":
        events = this.resolveTeamOrder(
          actor,
          action.teamOrderType!,
          action.targetIds?.[0]
        );
        break;
      case "pass":
        events = [
          {
            id: this.nextEventId(),
            type: `turn_start-${actor.side}`,
            actorId: actor.id,
            text: `${actor.name} holds position.`,
            side: actor.side,
            attackerName: actor.name,
          },
        ];
        break;
    }

    this.state.events.push(...events);

    if (events.length > 0) {
      actor.fatigue = Math.min(100, actor.fatigue + 30);
      this.state.lastActorBySide[actor.side] = actor.id;
    }

    const endEvent = this.checkWinCondition();

    if (endEvent) {
      events.push(endEvent);
    }

    if (this.state.winner) return events;

    if (!deferPhaseProgression) {
      if (this.state.phase === "player") this.afterPlayerAction(actor.id);
      else this.afterAIAction(actor.id);
    }

    return events;
  }

  completeActionPhase(actorId: number) {
    if (this.state.winner) return;

    if (this.state.phase === "player") this.afterPlayerAction(actorId);
    else if (this.state.phase === "ai") this.afterAIAction(actorId);
  }

  /* Resolvers */
  private resolveProtectionTarget(
    intendedTarget: CombatFighter
  ): {
    target: CombatFighter;
    protectedTarget?: CombatFighter;
  } {
    const order = this.state.teamOrders.find(
      (item) =>
        item.type === "protect" &&
        item.side === intendedTarget.side &&
        item.targetId === intendedTarget.id &&
        item.duration > 0 &&
        (item.value ?? 0) > 0
    );

    if (!order) {
      return { target: intendedTarget };
    }

    const protectorId = Number(order.id.split("-")[1]);
    const protector = this.getFighter(protectorId);

    if (!protector) {
      this.state.teamOrders = this.state.teamOrders.filter(
        (item) => item.id !== order.id
      );

      return { target: intendedTarget };
    }

    order.value = (order.value ?? 0) - 1;

    if (order.value <= 0) {
      this.state.teamOrders = this.state.teamOrders.filter(
        (item) => item.id !== order.id
      );
    }

    return {
      target: protector,
      protectedTarget: intendedTarget,
    };
  }

  private resolveBasicAttack(actor: CombatFighter, targetId?: number): CombatEvent[] {
    const selectedTarget = this.state.fighters.find((f) => f.id === targetId && f.isAlive);

    if (!selectedTarget) return [];

    const { target, protectedTarget } = this.resolveProtectionTarget(selectedTarget);

    const hpBefore = target.currentHp;

    const baseDamage = this.calculateDamage(actor);

    const focusStatus = actor.status.find((status) => status.type === "focus" && status.duration > 0);

    const damage = focusStatus ? Math.round(baseDamage * (1 + focusStatus.value)) : baseDamage;

    const shieldResult = this.resolveShieldDamage(target, damage);

    const finalDamage = shieldResult.damage;
    const damageBlocked = shieldResult.damageBlocked;
    const totalIncomingDamage = finalDamage + damageBlocked;

    if (finalDamage === 0) {
      return [{
        id: this.nextEventId(),
        // type: "defend",
        type: "attack",
        actorId: actor.id,
        targetIds: [target.id],
        damage: 0,
        damageBlocked,
        hpBefore,
        hpAfter: target.currentHp,
        text:
          protectedTarget
            ? `${actor.name} strikes ${protectedTarget.name}, but ${target.name} intercepts the attack! `
            : `${actor.name} strikes ${target.name}${focusStatus ? " with Focus" : ""} ` +
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
      actor.status = actor.status.filter((status) => status.id !== focusStatus.id);
    }

    const isKO = target.currentHp <= 0;
    if (isKO) target.isAlive = false;
    if (isKO) {
      this.state.teamOrders = this.state.teamOrders.filter((order) => order.type !== "protect" || Number(order.id.split("-")[1]) !== target.id);
    }

    return [{
      id: this.nextEventId(),
      type: isKO ? "ko" : "attack",
      actorId: actor.id,
      targetIds: [target.id],
      damage: finalDamage,
      damageBlocked,
      hpBefore,
      hpAfter: target.currentHp,
      text:
        protectedTarget
          ? `${actor.name} strikes ${protectedTarget.name}, but ${target.name} intercepts the attack! `
          : `${actor.name} strikes ${target.name}${focusStatus ? " with Focus" : ""} ` +
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
    }];
  }

  private resolvePower(actor: CombatFighter, powerId: number, targetIds: number[], chosenRole?: PowerRole): CombatEvent[] {
    const power = actor.powers.find((p) => p.id === powerId);
    if (!power) return [];

    const damage = this.calculateDamage(actor, power.score ?? 50);

    const { energy: cost } = this.getPowerCost(power);

    let role = power.combatRole;

    if (role === "Hybrid / Versatile" && chosenRole) {
      role = chosenRole;
    }

    const powerName = power.name.toLowerCase();

    const isHealingPower = powerName.includes("heal") || powerName.includes("regene") || powerName.includes("recovery");

    // Only spend resources after the action has passed target validation.
    const spendPower = () => {
      actor.energy = Math.max(0, actor.energy - cost);
      actor.cooldowns[power.id] = 1;
    };

    // HEALING / SELF-REVIVAL
    if (isHealingPower) {
      const selectedTargets = [...new Set(targetIds.length > 0 ? targetIds : [actor.id])];

      const events: CombatEvent[] = [];

      for (const targetId of selectedTargets) {
        const target = this.state.fighters.find(
          (fighter) => fighter.id === targetId
        );

        if (!target || target.side !== actor.side) continue;

        // A KO'd character can only revive themselves.
        if (!actor.isAlive && target.id !== actor.id) continue;

        const isRevive = !target.isAlive;

        if (isRevive && (target.id !== actor.id || target.hasRevived)) {
          continue;
        }

        if (!isRevive && target.currentHp >= target.maxHp) {
          continue;
        }

        const healAmount = Math.round(target.maxHp * 0.12 + (power.tier ?? 1) * 8);

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

        // Apply the power's status effects (Regen, etc.).
        this.applyPowerStatusEffects(actor, target, power);

        events.push({
          id: this.nextEventId(),
          type: isRevive ? "revive" : "heal",
          actorId: actor.id,
          targetIds: [target.id],
          power,
          healing: actualHealing,
          hpBefore: previousHp,
          hpAfter: target.currentHp,
          text: isRevive
            ? `${actor.name} regenerates and revives themselves with ${actualHealing} HP!`
            : `${actor.name} uses [${power.name}] and restores ${actualHealing} HP to ${target.name}!`,
          side: actor.side,
          attackerName: actor.name,
          defenderName: target.name,
          powerName: power.name,
        });
      }

      if (events.length === 0) return [];

      spendPower();

      return events;
    }

    // UTILITY — STATUS EFFECTS
    if (role === "Utility") {
      const selectedTargets = [...new Set(targetIds)];

      const events: CombatEvent[] = [];

      for (const targetId of selectedTargets) {
        const target = this.state.fighters.find((fighter) => fighter.id === targetId);

        if (!target || !target.isAlive || target.side !== actor.side) {
          continue;
        }

        const hpBefore = target.currentHp;

        const appliedEffects =
          power.statusEffects !== undefined
            ? this.applyPowerStatusEffects(actor, target, power)
            : this.applyPowerStatusEffects(actor, target, {
              ...power,
              statusEffects: [{ type: "focus", duration: 2, value: 0.4 }],
            });

        for (const status of appliedEffects) {
          events.push({
            id: this.nextEventId(),
            type: "status_applied",
            power,
            hpBefore,
            hpAfter: target.currentHp,
            actorId: actor.id,
            targetIds: [target.id],
            status,
            text: `${target.name} gained ${status.name}!`,
            side: actor.side,
          });
        }
      }

      if (events.length === 0) return [];

      spendPower();

      return events;
    }

    // CONTROL — METADATA-DRIVEN STATUS EFFECTS
    if (role === "Control") {
      const selectedTargets = [...new Set(targetIds)];
      const events: CombatEvent[] = [];

      for (const targetId of selectedTargets) {
        const target = this.state.fighters.find((fighter) => fighter.id === targetId && fighter.isAlive && fighter.side !== actor.side);

        if (!target) continue;

        const hpBefore = target.currentHp;

        // Preserve the original Stun behavior for older powers that don't have statusEffects metadata.
        const powerWithEffects: Power = power.statusEffects?.length ? power : { ...power, statusEffects: [{ type: "stun", duration: 2, value: 1 }] };

        const appliedEffects = this.applyPowerStatusEffects(actor, target, powerWithEffects);

        for (const status of appliedEffects) {
          events.push({
            id: this.nextEventId(),
            type: "power",
            actorId: actor.id,
            targetIds: [target.id],
            power,
            hpBefore,
            hpAfter: target.currentHp,
            status,
            text: `${actor.name} uses [${power.name}] and applies ${status.name} to ${target.name} for ${status.duration} turns!`,
            side: actor.side,
            attackerName: actor.name,
            defenderName: target.name,
            powerName: power.name,
          });
        }
      }

      if (events.length === 0) return [];

      spendPower();

      return events;
    }

    // DEFENSIVE — MULTI-TARGET
    if (role === "Defensive") {
      const selectedTargets = [...new Set(targetIds)];

      const events: CombatEvent[] = [];

      for (const targetId of selectedTargets) {
        const target = this.state.fighters.find(
          (fighter) =>
            fighter.id === targetId &&
            fighter.isAlive &&
            fighter.side === actor.side
        );

        if (!target) continue;

        const hpBefore = target.currentHp;

        let shieldsAdded = 0;

        // Attempt to apply two shields to this target.
        for (let i = 0; i < 2; i++) {
          const applied = this.applyStatus(target, {
            id: `shield-${target.id}-${power.id}-${this.nextEventId()}-${i}`,
            type: "shield",
            name: power.name,
            duration: 2,
            value: 1,
            sourceId: actor.id,
          });

          if (applied) shieldsAdded++;
        }

        if (shieldsAdded === 0) continue;

        const totalShields = target.status.filter(
          (status) =>
            status.type === "shield" &&
            status.duration > 0
        ).length;

        events.push({
          id: this.nextEventId(),
          type: "defend",
          hpBefore,
          hpAfter: target.currentHp,
          actorId: actor.id,
          targetIds: [target.id],
          power,
          text:
            `${actor.name} activates [${power.name}] and grants ` +
            `${target.name} ${shieldsAdded} protective shield` +
            `${shieldsAdded > 1 ? "s" : ""}! ` +
            `(${totalShields}/4 shields)`,
          side: actor.side,
          attackerName: actor.name,
          defenderName: target.name,
          powerName: power.name,
        });
      }

      if (events.length === 0) return [];

      // Spend energy and apply cooldown once for the entire activation.
      spendPower();

      return events;
    }

    // OFFENSIVE — MULTI-TARGET
    const selectedTargets = [...new Set(targetIds)];

    const validTargets = selectedTargets
      .map((targetId) => this.state.fighters.find((fighter) => fighter.id === targetId && fighter.isAlive && fighter.side !== actor.side))
      .filter((target): target is CombatFighter => target !== undefined);

    if (validTargets.length === 0) return [];

    // Calculate bonus from ALL active Focus stacks.
    const focusStacks = actor.status.filter((status) => status.type === "focus" && status.duration > 0);

    const totalFocusBonus = focusStacks.reduce((total, status) => total + status.value, 0);

    const baseFinalDamage = Math.round(damage * (1 + totalFocusBonus));

    const events: CombatEvent[] = [];
    let focusWasConsumed = false;

    for (const [index, selectedTarget] of validTargets.entries()) {
      const damageMultiplier = index === 0 ? 1 : 0.75;

      const targetDamage = Math.round(baseFinalDamage * damageMultiplier);

      // Resolve protection independently for each selected enemy.
      const { target, protectedTarget } = this.resolveProtectionTarget(selectedTarget);

      const hpBefore = target.currentHp;

      // Apply the target's shields after interception.
      const shieldResult = this.resolveShieldDamage(target, targetDamage);

      const actualDamage = shieldResult.damage;
      const damageBlocked = shieldResult.damageBlocked;
      const totalIncomingDamage = actualDamage + damageBlocked;

      const interceptionText = protectedTarget
        ? ` (intercepted from ${protectedTarget.name})`
        : "";

      // All incoming damage was absorbed by shields.
      if (actualDamage === 0) {
        events.push({
          id: this.nextEventId(),
          // type: "defend",
          type: "attack",
          actorId: actor.id,
          targetIds: [target.id],
          power,
          damage: 0,
          damageBlocked,
          hpBefore,
          hpAfter: target.currentHp,
          text:
            `${actor.name} unleashes [${power.name}] on ${target.name}` +
            `${interceptionText} for ${totalIncomingDamage} total damage` +
            `${damageMultiplier < 1 ? " (75% AoE damage)" : " (100% primary damage)"}` +
            `but the SHIELD absorbs all ${damageBlocked} damage! ` +
            `${shieldResult.shieldsConsumed} shield consumed — ` +
            `${shieldResult.shieldsRemaining} remaining. ` +
            `HP unchanged (${target.currentHp}/${target.maxHp}).`,
          side: actor.side,
          attackerName: actor.name,
          defenderName: target.name,
          powerName: power.name,
        });

        continue;
      }

      // Apply damage to the actual recipient.
      target.currentHp = Math.max(
        0,
        target.currentHp - actualDamage
      );

      // Apply the power's status effects (Burn, etc.).
      this.applyPowerStatusEffects(actor, target, power);

      focusWasConsumed = true;

      const isKO = target.currentHp <= 0;

      if (isKO) {
        target.isAlive = false;

        // Remove protection if the KO'd fighter was a protector.
        this.state.teamOrders = this.state.teamOrders.filter(
          (order) =>
            order.type !== "protect" ||
            Number(order.id.split("-")[1]) !== target.id
        );
      }

      events.push({
        id: this.nextEventId(),
        type: isKO ? "ko" : "power",
        actorId: actor.id,
        targetIds: [target.id],
        power,
        damage: actualDamage,
        damageBlocked,
        hpBefore,
        hpAfter: target.currentHp,
        text:
          `${actor.name} unleashes [${power.name}] on ${target.name}` +
          `${interceptionText} for ${totalIncomingDamage} total damage` +
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
      });
    }

    if (events.length === 0) return [];

    // Spend resources once for the entire power activation.
    spendPower();

    // Consume Focus once if at least one target took HP damage.
    if (focusWasConsumed && focusStacks.length > 0) {
      const focusIds = new Set(
        focusStacks.map((status) => status.id)
      );

      actor.status = actor.status.filter(
        (status) => !focusIds.has(status.id)
      );
    }

    return events;
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

  private resolveTeamOrder(
    actor: CombatFighter,
    orderType: TeamOrderType,
    targetId?: number
  ): CombatEvent[] {
    if (orderType !== "protect" || targetId == null) return [];

    const target = this.getFighter(targetId);

    if (!target || !target.isAlive || target.side !== actor.side) {
      return [];
    }

    const orderId = `protect-${actor.id}-${target.id}`;

    this.state.teamOrders = this.state.teamOrders.filter(
      (order) =>
        !(
          order.type === "protect" &&
          order.side === actor.side &&
          order.targetId === target.id
        )
    );

    this.state.teamOrders.push({
      id: orderId,
      type: "protect",
      name: `${actor.name} protects ${target.name}`,
      side: actor.side,
      targetId: target.id,
      duration: 2,
      value: 2,
    });

    return [{
      id: this.nextEventId(),
      type: "team_order",
      actorId: actor.id,
      targetIds: [target.id],
      text: `${actor.name} takes a protective position beside ${target.name}! Protection lasts 2 rounds or until 2 attacks are intercepted.`,
      side: actor.side,
      attackerName: actor.name,
      defenderName: target.name,
    }];
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
      selectedTargetId: null,
      lastActorBySide: {
        A: null,
        B: null,
      },
    };
  }

  private calculateDamage(
    actor: CombatFighter,
    attackScore: number = 50
  ): number {
    const randomScore = Math.random() * 100;

    const fatiguePenalty = (actor.fatigue / 100) * 0.15;

    const baseDamage =
      actor.overall * 0.90 +
      Math.min(100, Math.max(0, attackScore)) * 0.08 +
      randomScore * 0.02;

    const damage = baseDamage * (1 - fatiguePenalty);

    return Math.max(1, Math.round(damage));
  }

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
      type: `turn_start-${side}`,
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

  selectTarget(id: number) {
    if (this.state.phase !== "player") return;

    const target = this.getFighter(id);

    if (!target || !target.isAlive) return;
    if (target.side === this.state.playerSide) return;

    this.state.selectedTargetId = id;
  }

  chooseAIAction(): CombatAction | null {
    if (this.state.phase !== "ai") return null;

    const candidates = this.getActionableIds(this.state.activeSide).map(id => this.getFighter(id)).filter((f): f is CombatFighter => !!f);
    if (candidates.length === 0) return null;

    const revivalCandidates = candidates.filter(f => !f.isAlive && this.canSelfRevive(f));
    const livingCandidates = candidates.filter(f => f.isAlive);
    const actor = revivalCandidates.length ? revivalCandidates[Math.floor(Math.random() * revivalCandidates.length)] : livingCandidates[Math.floor(Math.random() * livingCandidates.length)];
    if (!actor) return null;

    this.regenerateEnergy(actor);

    if (!actor.isAlive) {
      const revivePower = actor.powers.find(power => this.isHealingPower(power) && power.targetType === "Self" && (actor.cooldowns[power.id] ?? 0) <= 0 && actor.energy >= this.getPowerCost(power).energy);
      return revivePower && !actor.hasRevived ? { type: "use_power", actorId: actor.id, powerId: revivePower.id, targetIds: [actor.id] } : null;
    }

    const enemies = this.getAliveFighters(this.state.playerSide);
    if (enemies.length === 0) return null;

    const activeShieldCount = actor.status.filter(s => s.type === "shield" && s.duration > 0).length;
    const possibleActions: CombatAction[] = [{ type: "basic_attack", actorId: actor.id, targetIds: [enemies[Math.floor(Math.random() * enemies.length)].id] }];

    if (activeShieldCount < this.MAX_SHIELDS_PER_FIGHTER) possibleActions.push({ type: "defend", actorId: actor.id });

    for (const power of actor.powers) {
      const role: PowerRole = power.combatRole === "Hybrid / Versatile" ? "Offensive" : power.combatRole;
      if ((actor.cooldowns[power.id] ?? 0) > 0 || actor.energy < this.getPowerCost(power).energy) continue;

      const eligible = this.getPowerEligibleTargets(actor, power, role);
      if (eligible.length === 0) continue;

      let targetIds: number[] = [];

      if (power.targetType === "Self") {
        targetIds = this.getPowerTargetIds(actor, power, role);
      } else if (power.targetType === "Area of Effect (AoE)" || power.targetType === "Self / AoE") {
        targetIds = this.getPowerTargetIds(actor, power, role);
      } else if (power.targetType === "Single Target" || power.targetType === "Single Target / AoE") {
        const target = eligible[Math.floor(Math.random() * eligible.length)];
        targetIds = [target.id];
      }

      if (targetIds.length === 0) continue;

      possibleActions.push({
        type: "use_power",
        actorId: actor.id,
        powerId: power.id,
        targetIds,
        ...(power.combatRole === "Hybrid / Versatile" ? { chosenRole: role } : {}),
      });
    }

    return possibleActions[Math.floor(Math.random() * possibleActions.length)];
  }

  private isHealingPower(power: Power) {
    const name = power.name.toLowerCase();
    return name.includes("heal") || name.includes("regene") || name.includes("recovery");
  }

  private getPowerEligibleTargets(actor: CombatFighter, power: Power, role: PowerRole): CombatFighter[] {
    if (this.isHealingPower(power)) {
      return this.state.fighters.filter(f => f.side === actor.side && (f.isAlive ? f.currentHp < f.maxHp : f.id === actor.id && !f.hasRevived));
    }

    if (role === "Utility") return this.state.fighters.filter(f => f.side === actor.side && f.isAlive);

    if (role === "Defensive") {
      return this.state.fighters.filter(f => f.side === actor.side && f.isAlive && f.status.filter(s => s.type === "shield" && s.duration > 0).length < this.MAX_SHIELDS_PER_FIGHTER);
    }

    if (role === "Control") {
      return this.state.fighters.filter(f => f.side !== actor.side && f.isAlive && !((power.statusEffects ?? [{ type: "stun" as const }]).every(e => e.type === "stun") && f.status.some(s => s.type === "stun_immune" && s.duration > 0)));
    }

    return this.state.fighters.filter(f => f.side !== actor.side && f.isAlive);
  }

  private getPowerTargetIds(actor: CombatFighter, power: Power, role: PowerRole, selectedId?: number): number[] {
    const eligible = this.getPowerEligibleTargets(actor, power, role);
    const ids = eligible.map(f => f.id);

    switch (power.targetType) {
      case "Self":
        return ids.includes(actor.id) ? [actor.id] : [];

      case "Single Target":
      case "Single Target / AoE":
        return selectedId != null && ids.includes(selectedId) ? [selectedId] : [];

      case "Area of Effect (AoE)":
        return ids;

      case "Self / AoE":
        return [...new Set([actor.id, ...ids])];

      default:
        return [];
    }
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

  private getPowerCost(
    power: Power,
    fighter?: CombatFighter
  ): { energy: number; cooldown: number } {
    const tier = Math.min(power.tier ?? 1, 10);
    const score = Math.min(power.score ?? 40, 100);

    const baseEnergy = Math.round(14 + tier * 5 + score * 0.18);

    const fatigueSurcharge = fighter
      ? Math.round((fighter.fatigue / 100) * 8)
      : 0;

    const energy = baseEnergy + fatigueSurcharge;

    return {
      energy: Math.min(53, Math.max(12, energy)),
      cooldown: 1,
    };
  }

  private applyPowerStatusEffects(
    actor: CombatFighter,
    target: CombatFighter,
    power: Power
  ): StatusEffect[] {
    const definitions = power.statusEffects ?? [];

    const appliedEffects: StatusEffect[] = [];

    for (const definition of definitions) {
      const status: StatusEffect = {
        id: `${definition.type}-${target.id}-${power.id}-${this.nextEventId()}`,
        type: definition.type,
        name: definition.type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        duration: definition.duration,
        value: definition.value,
        sourceId: actor.id,
      };

      if (this.applyStatus(target, status)) {
        appliedEffects.push(status);
      }
    }

    return appliedEffects;
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

    // Enforce the maximum of 4 active shields.
    if (status.type === "shield") {
      const activeShields = fighter.status.filter(
        (s) => s.type === "shield" && s.duration > 0
      );

      // Repair existing states that already exceed the limit.
      if (activeShields.length > 4) {
        let kept = 0;

        fighter.status = fighter.status.filter((s) => {
          if (s.type !== "shield" || s.duration <= 0) {
            return true;
          }

          kept++;
          return kept <= 4;
        });
      }

      const currentShieldCount = fighter.status.filter(
        (s) => s.type === "shield" && s.duration > 0
      ).length;

      if (currentShieldCount >= 4) {
        return false;
      }
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

  private processStatusTicks(fighter: CombatFighter) {
    const burn = fighter.status.find((s) => s.type === "burn" && s.duration > 0);
    const poison = fighter.status.find((s) => s.type === "poison" && s.duration > 0);
    const regen = fighter.status.find((s) => s.type === "regen" && s.duration > 0);

    if (burn) {
      const damage = Math.max(1, Math.round(fighter.maxHp * burn.value));
      const hpBefore = fighter.currentHp;
      fighter.currentHp = Math.max(0, fighter.currentHp - damage);

      const isKO = fighter.currentHp <= 0;
      if (isKO) {
        fighter.isAlive = false;
        this.state.teamOrders = this.state.teamOrders.filter((order) => order.type !== "protect" || Number(order.id.split("-")[1]) !== fighter.id);
      }

      const source = this.getFighter(burn.sourceId ?? -1);

      this.pushEvent({
        type: isKO ? "ko" : "status_tick",
        actorId: burn.sourceId,
        targetIds: [fighter.id],
        damage,
        hpBefore,
        hpAfter: fighter.currentHp,
        status: burn,
        isKO,
        attackerName: source?.name ?? burn.name,
        defenderName: fighter.name,
        text: isKO
          ? `${fighter.name} takes ${damage} Burn damage and is knocked out!`
          : `${fighter.name} takes ${damage} Burn damage! (${fighter.currentHp}/${fighter.maxHp} HP)`,
        side: source?.side ?? this.getOppositeSide(fighter.side),
      });
    }

    if (poison && fighter.isAlive) {
      const damage = Math.max(1, Math.round(fighter.maxHp * poison.value));
      const hpBefore = fighter.currentHp;
      fighter.currentHp = Math.max(0, fighter.currentHp - damage);

      const isKO = fighter.currentHp <= 0;

      if (isKO) {
        fighter.isAlive = false;
        this.state.teamOrders = this.state.teamOrders.filter(
          (order) => order.type !== "protect" || Number(order.id.split("-")[1]) !== fighter.id
        );
      }

      const source = this.getFighter(poison.sourceId ?? -1);

      this.pushEvent({
        type: isKO ? "ko" : "status_tick",
        actorId: poison.sourceId,
        targetIds: [fighter.id],
        damage,
        hpBefore,
        hpAfter: fighter.currentHp,
        status: poison,
        isKO,
        attackerName: source?.name ?? poison.name,
        defenderName: fighter.name,
        text: isKO
          ? `${fighter.name} takes ${damage} Poison damage and is knocked out!`
          : `${fighter.name} takes ${damage} Poison damage! (${fighter.currentHp}/${fighter.maxHp} HP)`,
        side: source?.side ?? this.getOppositeSide(fighter.side),
      });
    }

    if (regen && fighter.isAlive) {
      const healing = Math.min(Math.round(fighter.maxHp * regen.value), fighter.maxHp - fighter.currentHp);
      const hpBefore = fighter.currentHp;
      if (healing > 0) {
        fighter.currentHp += healing;

        this.pushEvent({
          type: "status_tick",
          actorId: regen.sourceId,
          targetIds: [fighter.id],
          healing,
          hpBefore,
          hpAfter: fighter.currentHp,
          status: regen,
          attackerName: this.getFighter(regen.sourceId ?? -1)?.name ?? regen.name,
          defenderName: fighter.name,
          text: `${fighter.name} regenerates ${healing} HP! (${fighter.currentHp}/${fighter.maxHp} HP)`,
          side: fighter.side,
        });
      }
    }
  }

  private advanceRoundAndTickCooldowns() {
    this.state.round++;

    this.state.teamOrders = this.state.teamOrders
      .map((order) => ({
        ...order,
        duration: order.duration - 1,
      }))
      .filter((order) => {
        if (order.duration <= 0) return false;

        if (order.type === "protect") {
          const protectorId = Number(order.id.split("-")[1]);
          const protector = this.getFighter(protectorId);

          return !!protector?.isAlive && (order.value ?? 0) > 0;
        }

        return true;
      });

    for (const fighter of this.state.fighters) {
      if (!fighter.isAlive) continue;

      // 1. Tick down cooldowns by 1 round
      for (const key of Object.keys(fighter.cooldowns)) {
        const powerId = Number(key);
        fighter.cooldowns[powerId] = Math.max(0, (fighter.cooldowns[powerId] ?? 0) - 1);
      }

      // Process active damage-over-time and healing effects before expiration.
      this.processStatusTicks(fighter);
      if (!fighter.isAlive) continue;

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

      // 4. Recover fatigue only if the fighter did not act last round.
      const lastActorId = this.state.lastActorBySide[fighter.side];

      if (fighter.id !== lastActorId) {
        fighter.fatigue = Math.max(0, fighter.fatigue - 20);
      }
    }

    if (this.checkWinCondition()) return;

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

      const damageEvents = [...damagingEvents, ...fighterEvents.filter((event) => event.type === "status_tick" && (event.damage ?? 0) > 0)];

      const blockedEvents = incomingEvents.filter(
        (event) => (event.damageBlocked ?? 0) > 0
      );

      const attacksLanded = damagingEvents.length;

      const damageDealt = damageEvents.reduce((total, event) => total + (event.damage ?? 0), 0);

      const damageTaken = incomingEvents
        .filter((event) => event.type === "attack" || event.type === "power" || event.type === "ko" || (event.type === "status_tick" && (event.damage ?? 0) > 0))
        .reduce((total, event) => total + (event.damage ?? 0), 0);

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
    const eligibleFighters = this.state.fighters.filter(
      (fighter) =>
        fighter.side === side &&
        (fighter.isAlive || this.canSelfRevive(fighter)) &&
        !fighter.status.some(
          (status) => status.type === "stun" && status.duration > 0
        )
    );

    const lastActorId = this.state.lastActorBySide[side];

    // Exclude the previous actor when another fighter can act.
    const rotatedFighters = eligibleFighters.filter(
      (fighter) => fighter.id !== lastActorId
    );

    // Allow the previous actor if they are the only eligible fighter.
    const availableFighters =
      rotatedFighters.length > 0 ? rotatedFighters : eligibleFighters;

    return availableFighters.map((fighter) => fighter.id);
  }

  finishAIPhase() {
    if (this.state.phase !== "ai") return;

    this.finishActivePhase();
  }
}