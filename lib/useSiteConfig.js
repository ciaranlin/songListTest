// lib/useSiteConfig.js
import { useEffect, useState } from 'react';
import { getMergedConfig, saveConfig } from './siteConfigStore';

export function useSiteConfig() {
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  useEffect(() => {
    // Re-sync on mount (ensures browser overrides are applied)
    setSiteConfig(getMergedConfig());
  }, []);

  const updateConfig = (partial) => {
    saveConfig(partial);
    setSiteConfig(getMergedConfig());
  };

  return { siteConfig, updateConfig };
}
