import type { Simulation } from '@/types'

export type SimulationInputs = Omit<Simulation, 'id' | 'createdAt' | 'label'>

export const defaultSimulationInputs: SimulationInputs = {
  auctionKind: 'extrajudicial',
  bidValue: 0,
  cep: '',
  state: '',
  city: '',
  auctionUrl: '',
  correctionIndexPct: 0,

  saleValue: 0,
  saleMarkup: 0,
  saleDiscount: 0,
  monthlyRentalIncome: 0,
  brokerPct: 6,
  auctioneerPct: 5,

  registryAuto: true,
  registryBase: 'avaliacao',
  fiscalEvaluation: 0,
  registryEstimatedPct: 1.5,
  registryManualCost: 0,

  itbiPct: 3,
  monthlyIptu: 0,
  monthlyCondo: 0,
  vacancyRenovationCost: 0,
  opportunityCostPctYear: 10,
  incomeTaxPct: 15,
  additionalCosts: 0,
  advisoryCost: 0,

  paymentKind: 'avista',
  cashDiscount: 0,

  holdingMonths: 12,
  minProfitPct: 15,
  bidIncrement: 0,
  monthsToTitle: 3,
  coOwnersCount: 1,
}

export interface SimulationResult {
  registryBaseValue: number
  registryCost: number
  itbiAmount: number
  recurringCosts: number
  vacancyRenovationCost: number
  opportunityCost: number
  brokerCost: number
  auctioneerCost: number
  advisoryCost: number
  additionalCosts: number
  effectiveBidOutlay: number
  totalCost: number
  rentalRevenue: number
  effectiveSaleValue: number
  grossProfit: number
  incomeTaxAmount: number
  netProfit: number
  roiPct: number | null
  perCoOwner: number | null
  nextBidSuggestion: number | null
}

export function computeSimulationResult(sim: SimulationInputs): SimulationResult {
  const registryBaseValue =
    sim.registryBase === 'avaliacao' ? sim.fiscalEvaluation : sim.registryBase === 'lance' ? sim.bidValue : sim.saleValue
  const registryCost = sim.registryAuto ? registryBaseValue * (sim.registryEstimatedPct / 100) : sim.registryManualCost

  const itbiAmount = sim.bidValue * (sim.itbiPct / 100)
  const recurringCosts = (sim.monthlyIptu + sim.monthlyCondo) * sim.holdingMonths
  const brokerCost = sim.saleValue * (sim.brokerPct / 100)
  const auctioneerCost = sim.bidValue * (sim.auctioneerPct / 100)
  const effectiveBidOutlay = sim.bidValue - (sim.paymentKind === 'avista' ? sim.cashDiscount : 0)

  const opportunityBase =
    effectiveBidOutlay +
    registryCost +
    itbiAmount +
    recurringCosts +
    sim.vacancyRenovationCost +
    sim.advisoryCost +
    sim.additionalCosts
  const opportunityMonths = sim.holdingMonths + sim.monthsToTitle
  const opportunityCost = opportunityBase * (sim.opportunityCostPctYear / 100) * (opportunityMonths / 12)

  const totalCost =
    effectiveBidOutlay +
    registryCost +
    itbiAmount +
    recurringCosts +
    sim.vacancyRenovationCost +
    opportunityCost +
    brokerCost +
    auctioneerCost +
    sim.advisoryCost +
    sim.additionalCosts

  const rentalRevenue = sim.monthlyRentalIncome * sim.holdingMonths
  const effectiveSaleValue = sim.saleValue + sim.saleMarkup - sim.saleDiscount + rentalRevenue

  const grossProfit = effectiveSaleValue - totalCost
  const incomeTaxAmount = grossProfit > 0 ? grossProfit * (sim.incomeTaxPct / 100) : 0
  const netProfit = grossProfit - incomeTaxAmount
  const roiPct = totalCost > 0 ? (netProfit / totalCost) * 100 : null
  const perCoOwner = sim.coOwnersCount > 0 ? totalCost / sim.coOwnersCount : null
  const nextBidSuggestion = sim.bidIncrement > 0 ? sim.bidValue + sim.bidIncrement : null

  return {
    registryBaseValue,
    registryCost,
    itbiAmount,
    recurringCosts,
    vacancyRenovationCost: sim.vacancyRenovationCost,
    opportunityCost,
    brokerCost,
    auctioneerCost,
    advisoryCost: sim.advisoryCost,
    additionalCosts: sim.additionalCosts,
    effectiveBidOutlay,
    totalCost,
    rentalRevenue,
    effectiveSaleValue,
    grossProfit,
    incomeTaxAmount,
    netProfit,
    roiPct,
    perCoOwner,
    nextBidSuggestion,
  }
}
