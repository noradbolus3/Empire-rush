const STORAGE_KEY = "empire_rush_v1";

const DEFAULT_STATE = {
  player: {
    cash: 100000,
    debt: 0,
    reputation: 50,
    influence: 10,
    risk: 15,
    day: 1
  },

  businesses: [
    {
      id: "car_wash_1",
      name: "City Sparkle Car Wash",
      category: "services",
      employees: 3,
      salaryPerEmp: 2500,
      pricePerUnit: 250,
      capacityPerEmp: 30,
      baseDemand: 72,
      marketingLevel: 1,
      upgradeLevel: 1,
      fixedOverhead: 500
    }
  ],

  market: {
    services: 1.00,
    retail: 1.00,
    logistics: 1.00,
    tech: 1.20,
    realEstate: 0.90
  },

  ledger: [],
  events: []
};


function clone(data) {
  return JSON.parse(JSON.stringify(data));
}


function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const fresh = clone(DEFAULT_STATE);
    saveGame(fresh);
    return fresh;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return clone(DEFAULT_STATE);
  }
}


function saveGame(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  return loadGame();
}


function calculateBusiness(state, business) {

  const trend =
    state.market[business.category] || 1;

  const priceIncrease =
    (business.pricePerUnit - 250) / 250;

  const priceFactor =
    Math.max(
      0.15,
      1 - priceIncrease / 1.5
    );

  const marketingFactor =
    1 + (business.marketingLevel * 0.15);

  const demand =
    business.baseDemand *
    priceFactor *
    trend *
    marketingFactor;

  const capacity =
    business.employees *
    business.capacityPerEmp *
    (1 + business.upgradeLevel * 0.08);

  const output =
    Math.min(demand, capacity);

  const revenue =
    output * business.pricePerUnit;

  const salary =
    business.employees *
    (business.salaryPerEmp / 30);

  const marketing =
    business.marketingLevel * 300;

  const profit =
    revenue -
    salary -
    marketing -
    business.fixedOverhead;

  return {
    demand: Math.round(demand),
    capacity: Math.round(capacity),
    output: Math.round(output),
    revenue: Math.round(revenue),
    cost: Math.round(
      salary + marketing + business.fixedOverhead
    ),
    profit: Math.round(profit)
  };
}


function dailyProfit(state) {

  return state.businesses.reduce(
    (total, business) => {

      return total +
        calculateBusiness(
          state,
          business
        ).profit;

    },
    0
  );
}


function calculateNetWorth(state) {

  const businessValue =
    state.businesses.reduce(
      (total, business) => {

        return total +
          80000 +
          (business.upgradeLevel * 10000);

      },
      0
    );

  return Math.round(
    state.player.cash +
    businessValue -
    state.player.debt
  );
}


function addLedger(
  state,
  description,
  amount
) {

  state.ledger.unshift({
    day: state.player.day,
    description,
    amount,
    time: Date.now()
  });

  state.ledger =
    state.ledger.slice(0, 100);
}


function runDay(state) {

  const profit =
    dailyProfit(state);

  state.player.cash += profit;

  state.player.day++;

  if (profit > 0) {
    state.player.reputation =
      Math.min(
        100,
        state.player.reputation + 1
      );
  }

  addLedger(
    state,
    "Daily business operation",
    profit
  );

  saveGame(state);

  return {
    profit,
    day: state.player.day,
    cash: state.player.cash,
    netWorth: calculateNetWorth(state)
  };
}


function hireEmployee(
  state,
  businessId
) {

  const business =
    state.businesses.find(
      b => b.id === businessId
    );

  if (!business) {
    return false;
  }

  const hiringCost = 1500;

  if (state.player.cash < hiringCost) {
    return false;
  }

  state.player.cash -= hiringCost;
  business.employees++;

  addLedger(
    state,
    "Employee hired",
    -hiringCost
  );

  saveGame(state);

  return true;
}


function changePrice(
  state,
  businessId,
  price
) {

  const business =
    state.businesses.find(
      b => b.id === businessId
    );

  if (!business) {
    return false;
  }

  business.pricePerUnit =
    Math.max(
      25,
      Math.min(
        5000,
        Math.round(price)
      )
    );

  saveGame(state);

  return true;
}


window.EmpireEngine = {
  loadGame,
  saveGame,
  resetGame,
  calculateBusiness,
  dailyProfit,
  calculateNetWorth,
  runDay,
  hireEmployee,
  changePrice
};
