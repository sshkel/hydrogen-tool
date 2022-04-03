




export const getBaseLog = (n: number, base: number): number => Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) => Math.round(n/1000) * 1000;

export const calculateCapex = (nominalCapacity: number,
                        referenceCapacity: number,
                        referencePurchaseCost: number,
                        costReductionWithScale: number,
                        referenceFoldIncrease: number): number => {
    const foldIncreaseInCapacity = getBaseLog((nominalCapacity * 1000)/referenceCapacity, referenceFoldIncrease);

    const capitalCostReductionFactor = 1 - Math.pow(1 - (costReductionWithScale/100), foldIncreaseInCapacity);

    const scaledPurchaseCost = referencePurchaseCost * (1 - capitalCostReductionFactor);

    const capexCost = nominalCapacity * 1000 * scaledPurchaseCost;
                                        
    return roundToNearestThousand(capexCost);
}


export const calculateBatteryCapex = (ratedPower: number = 0,
                                    nominalCapacity: number = 0,
                                    cost: number = 0): number => {
    if (ratedPower === 0) {
        return 0;
    }
    const capexCost = nominalCapacity * cost * 1000;
    return roundToNearestThousand(capexCost);
}

export const getIndirectCost = (capex: number, costAsPercentageOfCapex: number = 0) => roundToNearestThousand(capex * (costAsPercentageOfCapex/100));

// Return a list of the OPEX per year for 1..$years inclusive, using the formula (cost * (1 + discountRate)^year)
export const getOpexPerYear = (cost: number, discountRate: number, years: number): number[] => [...Array(years).keys()].map(i => cost * Math.pow((1 + discountRate/100), (i + 1)));

export const getOpexPerYearWithAdditionalCostPredicate = (cost: number, discountRate: number, years: number, shouldIncludeAdditionalCost: (year: number) => boolean, additionalCost: number): number[] => {
   return [...Array(years).keys()].map(i => {
        const year = i + 1;
        const extras = shouldIncludeAdditionalCost(year) ? additionalCost : 0;

        return (cost * Math.pow((1 + discountRate/100), year)) + extras;
    });
}
