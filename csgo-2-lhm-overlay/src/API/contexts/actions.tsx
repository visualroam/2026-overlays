import { useEffect, useState, createContext, ReactNode, useContext, useRef } from "react";
import ActionManager, { ActionHandler, ConfigManager } from "./managers";
import { Events } from "csgogsi";
import { GSI } from "../HUD";
import type { AllActions, AllInputs, GetInputsFromSection, Sections } from "./settings";

export const actions = new ActionManager();
export const configs = new ConfigManager();

type EmptyListener = () => void;

type BaseEvents = keyof Events;
type Callback<K> = K extends BaseEvents ? Events[K] | EmptyListener : EmptyListener;

export function useAction<T extends keyof AllActions>(action: T, callback: ActionHandler<T extends keyof AllActions ? AllActions[T] : never>, deps?: React.DependencyList) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const stableListener: ActionHandler<T extends keyof AllActions ? AllActions[T] : never> = (data) => {
      callbackRef.current(data);
    };

    actions.on(action, stableListener);
    return () => {
        actions.off(action, stableListener);
    };
  }, deps ? [action, ...deps] : [action]);
  return null;
}
export function useOnConfigChange<K extends keyof Sections, T = any>(section: K, callback: ActionHandler<{ [L in keyof (K extends keyof Sections ? GetInputsFromSection<Sections[K]> : T)]?: (K extends keyof Sections ? GetInputsFromSection<Sections[K]> : T)[L] } | null>, deps?: React.DependencyList){
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
      const onDataChanged = (data: any) => {
        callbackRef.current(data?.[section] || null);
      };

      configs.onChange(onDataChanged);
      onDataChanged(configs.data);

      return () => {
        configs.off(onDataChanged);
      }
    }, deps ? [section, ...deps] : [section])

    return null;
}

export function onGSI<T extends BaseEvents>(event: T, callback: Callback<T>, deps?: React.DependencyList){
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const stableListener = ((...args: unknown[]) => {
      (callbackRef.current as (...listenerArgs: unknown[]) => void)(...args);
    }) as Callback<T>;

    GSI.on(event, stableListener);

    return () => {
      GSI.off(event, stableListener);
    }
  }, deps ? [event, ...deps] : [event])
}

const SettingsContext = createContext<AllInputs | null>({} as AllInputs);
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [ data, setData ] = useState<AllInputs | null>(configs.data as AllInputs || null);



  useEffect(() => {
    const onDataChanged = (data: any) => {
      setData(data);
    };

    configs.onChange(onDataChanged);
    onDataChanged(configs.data);

    return () => {
      configs.off(onDataChanged);
    }
  }, [])

  return (
    <SettingsContext.Provider
      value={data}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useConfig<K extends keyof Sections>(section: K){
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('generic Hook must be used within a Generic Provider');
  }
  return context?.[section];
}
