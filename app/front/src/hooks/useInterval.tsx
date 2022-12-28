import {useEffect, useRef} from 'react'

// Permet d'utiliser setInterval dans son composant fonction
// Et de cleanup correctement, se produit apres le render
function useInterval(callback: Function, delay: number)
{
  const savedCallback = useRef(callback);

  // on se souvient du dernier callback
  useEffect(() => {
    savedCallback.current = callback;
  });

  // config de l'intervalle en fonction de delay
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null)
    {
      let id = setInterval(tick, delay);
      return (() => clearInterval(id));
    }
  }, [delay]);
}

export default useInterval;