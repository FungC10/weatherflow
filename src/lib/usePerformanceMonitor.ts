import { useEffect, useRef } from 'react';

interface PerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
}

export function usePerformanceMonitor({ 
  componentName, 
  enabled = process.env.NODE_ENV === 'development' 
}: PerformanceMonitorOptions) {
  const renderCount = useRef(0);
  const lastProps = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current += 1;
    
    if (renderCount.current > 1) {
      console.log(`🔄 ${componentName} re-rendered (${renderCount.current} times)`);
    }
  });

  const logPropsChange = (newProps: any, propName: string) => {
    if (!enabled) return;
    
    const oldValue = lastProps.current?.[propName];
    const newValue = newProps[propName];
    
    if (oldValue !== newValue) {
      console.log(`📊 ${componentName} prop change: ${propName}`, {
        from: oldValue,
        to: newValue,
        render: renderCount.current
      });
    }
    
    lastProps.current = newProps;
  };

  return { logPropsChange };
}
