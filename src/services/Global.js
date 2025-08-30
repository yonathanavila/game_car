export function calculateKmDamage(context) {
    let kmDamageTotal = 0;
    const kmSinceRepair = context.carKm - context.lastRepairKm;

    context.damageInfo.forEach(part => {
        const [minKm, maxKm] = part.kmDamage;

        // If kmSinceRepair falls inside this part's wear range
        if (kmSinceRepair >= minKm && kmSinceRepair <= maxKm) {
            const ratio = (kmSinceRepair - minKm) / (maxKm - minKm);
            kmDamageTotal += part.damageHealth * ratio;
        } else if (kmSinceRepair > maxKm) {
            // Past max → full wear
            kmDamageTotal += part.damageHealth;
        }
    });

    return kmDamageTotal;
}


export function calculateTotalLife(context) {
    return context.damageInfo.reduce((sum, part) => sum + part.damageHealth, 0);
}

export function calculateCurrentLife(context) {
    const totalLife = calculateTotalLife(context);
    const kmWear = calculateKmDamage(context);
    const potholeDamage = context.damage; // already tracked during collisions

    return Math.max(0, totalLife - kmWear - potholeDamage);
}
