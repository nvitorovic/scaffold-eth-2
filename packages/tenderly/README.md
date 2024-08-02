# Tenderly Virtual TestNets

To find detailed instructions, check out the following resources:
- [Simple Staging](https://hackmd.io/@5MX8qpXpR3ivRrwkTnEkIg/ryqR8w5wR)
- [Staging With Virtual TestNets Tutorial](https://docs.tenderly.co/workshops/virtual-testnets)

## Configure the environment

```bash
cp .env.example .env
```

Modify the `.env` file with your project, username, and access key.

## Create an environment

Create an environment named `my-local-env`, consisting of Virtual TestNets forking Mainnet (1) and Base (8453): 
```bash
cd packages/tenderly 
npm run stage:new my-local-env 1 8453
```

## Activate an environment

```bash
cd packages/tenderly
npm run stage:activate my-local-env
```

## Connect hardhat

```bash
cd packages/tenderly
npm run stage:connect:hardhat
```

Deploy contracts:

```bash
cd packages/hardhat
npx hardhat deploy --network virtual_base
npx hardhat deploy --network virtual_mainnet
```

## Connect nextjs

```bash
cd packages/tenderly
npm run stage:connect:nextjs
```

Run the frontend:

```bash
cd packages/nextjs
npm run dev
```