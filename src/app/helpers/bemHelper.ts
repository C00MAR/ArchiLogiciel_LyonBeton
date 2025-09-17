const bemCondition = (
    base: string,
    modifiers?: string | [string, string],
    condition?: boolean
) => {
    if (!modifiers) return base;

    let modifierToApply = "";

    if (Array.isArray(modifiers)) {
        modifierToApply = condition ? modifiers[0] : modifiers[1];
    } else {
        if (condition) modifierToApply = modifiers;
    }

    return `${base} ${base}--${modifierToApply}`
};

export default bemCondition;
