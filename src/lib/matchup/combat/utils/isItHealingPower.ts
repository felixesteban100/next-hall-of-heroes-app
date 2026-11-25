export function isItHealingPower(powerName: string) {
    powerName = powerName.toLowerCase()
    return powerName.includes("imm") || powerName.includes("heal") || powerName.includes("regene") || powerName.includes("recovery")
}