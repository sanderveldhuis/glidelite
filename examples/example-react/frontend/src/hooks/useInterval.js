import {
  useEffect,
  useEffectEvent
} from 'react';

function useInterval(handler, timeout) {
  const onTimeout = useEffectEvent(handler);

  useEffect(() => {
    const id = setInterval(() => onTimeout(), timeout);
    onTimeout();

    return () => clearInterval(id);
  }, [timeout]);
}

export default useInterval;
