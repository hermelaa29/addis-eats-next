import { useEffect, useState } from 'react';

export function useFetch(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [fetcher]);

  return state;
}
