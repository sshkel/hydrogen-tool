class Defaults {
  private defaultInputs: { [k: string]: number };

  constructor() {
    // const dynamicDefaults = {
    //   hydrogen: {
    //     basic: {
    //       projectScale: 15,
    //       electrolyserEfficiency: 70,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       // this conclued all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //     advanced: {
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //
    //       electrolyserPurchaseCost: 1500,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //       waterSupplyCost: 5,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       powerPlantOversizeRatio: 1.5,
    //
    //       solarToWindPercentage: 100,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //
    //       solarFarmBuildCost: 1200,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windFarmBuildCost: 2000,
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       principalPPACost: 50,
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //
    //       projectTimeline: 15,
    //       discountRate: 7,
    //       inflationRate: 2.5,
    //
    //       // most likely not needed for advanced hydrogen
    //       electrolyserEfficiency: 70,
    //       projectScale: 15,
    //     },
    //   },
    //   ammonia: {
    //     basic: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       ammoniaPlantCapitalCost: 500,
    //       ammoniaPlantCapacity: 50,
    //       ammoniaStorageCapacity: 30,
    //       ammoniaPlantSec: 0.4,
    //       asuSec: 0.2,
    //       ammoniaPlantMinimumTurndown: 33,
    //
    //       ammoniaSynthesisUnitCost: 400,
    //       ammoniaStorageCost: 100,
    //       airSeparationUnitCost: 200,
    //       ammoniaEpcCosts: 10,
    //       ammoniaLandProcurementCosts: 0,
    //
    //       asuPlantOMCost: 2,
    //       ammoniaPlantOMCost: 2,
    //       ammoniaStorageOMCost: 2,
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //     advanced: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       ammoniaPlantCapitalCost: 900,
    //       ammoniaPlantCapacity: 50,
    //       ammoniaStorageCapacity: 30,
    //       ammoniaPlantSec: 0.4,
    //       asuSec: 0.2,
    //       ammoniaPlantMinimumTurndown: 33,
    //
    //       ammoniaSynthesisUnitCost: 400,
    //       ammoniaStorageCost: 100,
    //       airSeparationUnitCost: 200,
    //       ammoniaEpcCosts: 10,
    //       ammoniaLandProcurementCosts: 0,
    //
    //       asuPlantOMCost: 2,
    //       ammoniaPlantOMCost: 2,
    //       ammoniaStorageOMCost: 2,
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //   },
    //
    //   methanol: {
    //     basic: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       // methanol specific things
    //       methanolPlantCapacity: 350,
    //       methanolPlantUnitCost: 250,
    //       carbonCapturePlantUnitCost: 0,
    //       methanolStorageCapacity: 30,
    //       methanolPlantSec: 0.36,
    //       methanolPlantMinimumTurndown: 100,
    //       methanolStorageCost: 227,
    //       methanolEpcCosts: 0,
    //       methanolLandProcurementCosts: 0,
    //       methanolPlantOMCost: 5,
    //       methanolStorageOMCost: 5,
    //       ccSec: 0.86,
    //       ccPlantCost: 420,
    //       ccEpcCosts: 0,
    //       ccLandProcurementCosts: 0,
    //       ccPlantOMCost: 5,
    //
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //     advanced: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //
    //       // methanol specific things
    //       methanolPlantCapacity: 350,
    //       methanolPlantUnitCost: 250,
    //       carbonCapturePlantUnitCost: 0,
    //       methanolStorageCapacity: 30,
    //       methanolPlantSec: 0.36,
    //       methanolPlantMinimumTurndown: 100,
    //       methanolStorageCost: 227,
    //       methanolEpcCosts: 0,
    //       methanolLandProcurementCosts: 0,
    //       methanolPlantOMCost: 5,
    //       methanolStorageOMCost: 5,
    //       ccSec: 0.86,
    //       ccPlantCost: 420,
    //       ccEpcCosts: 0,
    //       ccLandProcurementCosts: 0,
    //       ccPlantOMCost: 5,
    //
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //   },
    //   methane: {
    //     basic: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       // methane things
    //       methanePlantCapacity: 350,
    //       methanePlantUnitCost: 250,
    //       methaneStorageCapacity: 30,
    //       methanePlantSec: 0.36,
    //       methanePlantMinimumTurndown: 100,
    //       methaneStorageCost: 227,
    //       methaneEpcCosts: 0,
    //       methaneLandProcurementCosts: 0,
    //       methanePlantOMCost: 5,
    //       methaneStorageOMCost: 5,
    //
    //       carbonCapturePlantUnitCost: 0,
    //       ccSec: 0.86,
    //       ccPlantCost: 420,
    //       ccEpcCosts: 0,
    //       ccLandProcurementCosts: 0,
    //       ccPlantOMCost: 5,
    //
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //     advanced: {
    //       electrolyserEfficiency: 75,
    //       electrolyserSystemOversizing: 45,
    //       minimumHydrogenStorage: 10,
    //       powerPlantOversizeRatio: 1.5,
    //       solarToWindPercentage: 100,
    //       electrolyserPurchaseCost: 2000,
    //       solarFarmBuildCost: 1200,
    //       windFarmBuildCost: 2000,
    //       principalPPACost: 60,
    //       waterSupplyCost: 5,
    //       discountRate: 7,
    //       projectTimeline: 15,
    //       // methane things
    //       methanePlantCapacity: 350,
    //       methanePlantUnitCost: 250,
    //       methaneStorageCapacity: 30,
    //       methanePlantSec: 0.36,
    //       methanePlantMinimumTurndown: 100,
    //       methaneStorageCost: 227,
    //       methaneEpcCosts: 0,
    //       methaneLandProcurementCosts: 0,
    //       methanePlantOMCost: 5,
    //       methaneStorageOMCost: 5,
    //
    //       carbonCapturePlantUnitCost: 0,
    //       ccSec: 0.86,
    //       ccPlantCost: 420,
    //       ccEpcCosts: 0,
    //       ccLandProcurementCosts: 0,
    //       ccPlantOMCost: 5,
    //
    //       hydrogenStoragePurchaseCost: 500,
    //       hydrogenStorageOMCost: 1,
    //       hydrogenStorageCapacity: 50_000,
    //       // this concludes all the defauls for basic in the spreadsheet
    //       // things below might be possible to remove.
    //       electrolyserNominalCapacity: 100,
    //       secAtNominalLoad: 50,
    //       waterRequirementOfElectrolyser: 15,
    //       electrolyserMaximumLoad: 100,
    //       electrolyserMinimumLoad: 10,
    //       maximumLoadWhenOverloading: 100,
    //       timeBetweenOverloading: 0,
    //
    //       stackLifetime: 80_000,
    //       maximumDegradationBeforeReplacement: 10,
    //       stackDegradation: 0.0,
    //       electrolyserReferenceCapacity: 1000,
    //       electrolyserCostReductionWithScale: 5,
    //
    //       electrolyserReferenceFoldIncrease: 10,
    //       electrolyserEpcCosts: 30,
    //       electrolyserLandProcurementCosts: 6,
    //       electrolyserOMCost: 3,
    //       electrolyserStackReplacement: 40,
    //
    //       solarNominalCapacity: 150,
    //       windNominalCapacity: 150,
    //       solarDegradation: 0,
    //       windDegradation: 0,
    //       solarReferenceCapacity: 1000,
    //       solarPVCostReductionWithScale: 5,
    //       solarReferenceFoldIncrease: 10,
    //
    //       windReferenceCapacity: 1000,
    //       windCostReductionWithScale: 5,
    //       windReferenceFoldIncrease: 10,
    //
    //       solarEpcCosts: 30,
    //       solarLandProcurementCosts: 6,
    //
    //       windEpcCosts: 30,
    //       windLandProcurementCosts: 6,
    //
    //       solarOpex: 17000,
    //       windOpex: 25000,
    //
    //       gridConnectionCost: 1_000_000,
    //       additionalTransmissionCharges: 10,
    //
    //       batteryRatedPower: 0,
    //       batteryStorageDuration: 0,
    //       batteryEfficiency: 85,
    //       batteryMinCharge: 10,
    //       batteryLifetime: 10,
    //
    //       batteryCosts: 1000,
    //       batteryLandProcurementCosts: 0,
    //       batteryEpcCosts: 0,
    //       batteryOMCost: 10_000,
    //       batteryReplacementCost: 100,
    //
    //       additionalUpfrontCosts: 0,
    //       additionalAnnualCosts: 0,
    //       inflationRate: 2.5,
    //     },
    //   },
    // };
    //
    const defaults = {
      electrolyserNominalCapacity: 100,
      secAtNominalLoad: 50,
      electrolyserEfficiency: 70,
      waterRequirementOfElectrolyser: 15,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      maximumLoadWhenOverloading: 100,
      timeBetweenOverloading: 0,
      stackDegradation: 0.0,
      stackLifetime: 80_000,
      maximumDegradationBeforeReplacement: 0,
      electrolyserReferenceCapacity: 1000,
      electrolyserPurchaseCost: 2000,
      electrolyserCostReductionWithScale: 10,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserOMCost: 2.5,
      electrolyserStackReplacement: 40,
      waterSupplyCost: 5,
      solarNominalCapacity: 10,
      windNominalCapacity: 10,
      powerPlantOversizeRatio: 1.5,
      solarToWindPercentage: 100,
      solarDegradation: 0,
      windDegradation: 0,
      solarFarmBuildCost: 1200,
      solarReferenceCapacity: 1000,
      solarPVCostReductionWithScale: 10,
      solarReferenceFoldIncrease: 10,
      windFarmBuildCost: 2000,
      windReferenceCapacity: 1000,
      windCostReductionWithScale: 10,
      windReferenceFoldIncrease: 10,
      solarEpcCosts: 30,
      solarLandProcurementCosts: 6,
      windEpcCosts: 30,
      windLandProcurementCosts: 6,
      solarOpex: 17000,
      windOpex: 25000,
      principalPPACost: 60,
      gridConnectionCost: 0,
      additionalTransmissionCharges: 0,
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
      batteryEfficiency: 90,
      batteryMinCharge: 0,
      batteryLifetime: 10,
      batteryCosts: 542,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryOMCost: 9717,
      batteryReplacementCost: 100,
      additionalUpfrontCosts: 0,
      additionalAnnualCosts: 0,
      projectTimeline: 15,
      discountRate: 7,
      inflationRate: 2.5,
      projectScale: 15,
      // TODO work out if these default are correct for ammonia
      ammoniaPlantCapacity: 50,
      ammoniaStorageCapacity: 30,
      electrolyserSystemOversizing: 45,
      ammoniaPlantSec: 0.6,
      asuSec: 0.22,
      hydrogenStorageCapacity: 50_000,
      ammoniaPlantMinimumTurndown: 50,
      minimumHydrogenStorage: 10,
      ammoniaSynthesisUnitCost: 0,
      ammoniaStorageCost: 0,
      airSeparationUnitCost: 0,
      ammoniaEpcCosts: 0,
      ammoniaLandProcurementCosts: 0,
      ammoniaPlantOMCost: 2,
      ammoniaStorageOMCost: 0,
      asuPlantOMCost: 0,
      hydrogenStoragePurchaseCost: 0,
      hydrogenStorageOMCost: 0,
      ammoniaPlantCapitalCost: 900,
      // TODO work out if these default are correct for methanol
      methanolPlantCapacity: 350,
      methanolPlantUnitCost: 250,
      carbonCapturePlantUnitCost: 0,
      methanolStorageCapacity: 30,
      methanolPlantSec: 0.36,
      methanolPlantMinimumTurndown: 100,
      methanolStorageCost: 227,
      methanolEpcCosts: 0,
      methanolLandProcurementCosts: 0,
      methanolPlantOMCost: 5,
      methanolStorageOMCost: 5,
      ccSec: 0.86,
      ccPlantCost: 420,
      ccEpcCosts: 0,
      ccLandProcurementCosts: 0,
      ccPlantOMCost: 5,
      // TODO work out if these default are correct for methane
      methanePlantCapacity: 350,
      methanePlantUnitCost: 250,
      methaneStorageCapacity: 30,
      methanePlantSec: 0.36,
      methanePlantMinimumTurndown: 100,
      methaneStorageCost: 227,
      methaneEpcCosts: 0,
      methaneLandProcurementCosts: 0,
      methanePlantOMCost: 5,
      methaneStorageOMCost: 5,
    };
    //
    // type ObjectKey = keyof typeof dynamicDefaults;
    // const typedPowerfuel = powerfuel as ObjectKey;
    //
    // const defaults =
    //   inputConfig === "Basic"
    //     ? dynamicDefaults[typedPowerfuel]["basic"]
    //     : dynamicDefaults[typedPowerfuel]["advanced"];

    if (sessionStorage.getItem("savedData") !== null) {
      const savedData = JSON.parse(sessionStorage.getItem("savedData")!);
      this.defaultInputs = {
        ...defaults,
        ...savedData,
      };
    } else {
      this.defaultInputs = defaults;
    }
  }

  get(key: string) {
    return this.defaultInputs[key];
  }

  set(key: string, value: number) {
    this.defaultInputs[key] = value;
  }
}

// Use as singleton given defaults are global per app context for now.
// This should be parameterised if this ever changes per location
export const DefaultInputs = new Defaults();
