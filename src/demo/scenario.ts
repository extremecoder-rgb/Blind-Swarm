import type { DAG } from '../types/index.js';

export interface Agent {
  id: string;
  name: string;
  capability: 'fetcher' | 'risk' | 'yield' | 'report';
  description: string;
  role: string;
}

export interface Scenario {
  agents: Agent[];
  dag: DAG;
  expectedOutcome: string;
  projectName: string;
}

export function createDeFiAnalyticsScenario(): Scenario {
  const agents: Agent[] = [
    {
      id: 'agent_fetcher',
      name: 'On-Chain Fetcher',
      capability: 'fetcher',
      description: 'Fetches real-time pool data, TVL, token prices, gas fees from Midnight node',
      role: 'Data Collector',
    },
    {
      id: 'agent_risk',
      name: 'Risk Analyst',
      capability: 'risk',
      description: 'Analyzes protocol risks, impermanent loss, smart contract exposure, and audit status',
      role: 'Risk Assessment',
    },
    {
      id: 'agent_yield',
      name: 'Yield Optimizer',
      capability: 'yield',
      description: 'Calculates yield strategies, APY comparisons, and rebalancing recommendations',
      role: 'Strategy Engine',
    },
    {
      id: 'agent_report',
      name: 'Report Generator',
      capability: 'report',
      description: 'Generates comprehensive dashboard reports with alerts and recommendations',
      role: 'Output Writer',
    },
  ];

  const dag: DAG = {
    steps: [
      {
        index: 0,
        dependencies: [],
        description: 'Fetch real-time on-chain data - pool reserves, token prices, volume, gas fees',
      },
      {
        index: 1,
        dependencies: [0],
        description: 'Analyze protocol risk profile - TVL concentration, audit status, exploit history, volatility',
      },
      {
        index: 2,
        dependencies: [0],
        description: 'Calculate optimal yield strategies - APY comparison, impermanent loss, incentive rewards',
      },
      {
        index: 3,
        dependencies: [1, 2],
        description: 'Generate final analytics report with risk-adjusted recommendations and alerts',
      },
    ],
  };

  return {
    agents,
    dag,
    expectedOutcome: 'Complete DeFi analytics report with risk assessment and yield recommendations',
    projectName: 'Midnight DeFi Analytics Engine',
  };
}

export const SCENARIO = createDeFiAnalyticsScenario();