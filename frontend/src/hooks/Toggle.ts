import { useState } from "react";

// Toggle para abrir y cerrar modal and menus

interface ToggleHook {
  isToggled: boolean;
  toggle: () => void;
  setOff: () => void;
}

export function useToggle(initialValue: boolean = false): ToggleHook {
  const [isToggled, setIsToggled] = useState<boolean>(initialValue);
  const toggle = () => setIsToggled((prev) => !prev);
  const setOff = () => setIsToggled(false);
  return { isToggled, toggle, setOff };
}


// Toggle para update modal con un valor de entrada id: T | null | undefined

interface UpdateModalHook<T> {
  isToggled: boolean;
  data: T | null;
  handlerOpen: (id: T) => void;
  handlerClose: () => void;
}

export function useUpdateModal<T>(initialValue: T | null = null): UpdateModalHook<T> {
  const { isToggled, toggle, setOff } = useToggle();
  const [data, setData] = useState<T | null>(initialValue);

  const handlerOpen = (id: T | undefined | null) => {
    if (id === undefined || id === null) return;
    setData(id);
    toggle();
  };

  const handlerClose = () => {
    setData(null);
    setOff();
  };

  return { isToggled, data, handlerOpen, handlerClose };
}