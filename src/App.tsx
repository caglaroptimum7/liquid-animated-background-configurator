import { useState } from 'react';
import LiquidBackground from './LiquidBackground';
import Configurator from './Configurator';
import { DEFAULT_CONFIG } from './types';
import type { Config } from './types';

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  return (
    <>
      <LiquidBackground config={config} />
      <Configurator config={config} onChange={setConfig} />
    </>
  );
}
