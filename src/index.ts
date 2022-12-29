import fs, { read } from 'fs';
import os from 'os';
import path from 'path';

type AppConfigManagerState = {
  appName: string;
  configName: string;
  prefix: string;
};

export interface IAppConfigManager<T extends {}> {
  setup: (initialConfig?: T) => void;
  getConfig: () => T;
  writeConfig: (config: Partial<T>, update?: boolean) => void;
  removeConfigValue: (key: keyof T) => void;
}

export const AppConfigManager = <T extends {}>(
  options: Partial<AppConfigManagerState> & { appName: string }
): IAppConfigManager<T> => {
  type Interface = IAppConfigManager<T>;

  const state: AppConfigManagerState = {
    configName: 'config.json',
    prefix: '.',
    ...options,
  };

  let config: T;

  const setup: Interface['setup'] = (initialConfig?) => {
    if (!isConfigDirExists()) {
      createConfigDir();
      createConfigFile(initialConfig);
    }

    if (!isConfigFileExists()) {
      createConfigFile(initialConfig);
    }

    config = readConfig();
  };

  const isConfigDirExists = (): boolean => fs.existsSync(getConfigDirPath());
  const isConfigFileExists = (): boolean => fs.existsSync(getConfigFilePath());

  const getConfigDirPath = (): string =>
    path.join(os.homedir(), `${state.prefix}${state.appName}`);

  const getConfigFilePath = (): string =>
    path.join(getConfigDirPath(), state.configName);

  const createConfigDir = () => fs.mkdirSync(getConfigDirPath());
  const createConfigFile = (initialConfig?: T) =>
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(initialConfig || {}));

  const readConfig = (): T => {
    return JSON.parse(fs.readFileSync(getConfigFilePath()).toString()) as T;
  };

  const writeConfig: Interface['writeConfig'] = (
    data: Partial<T>,
    update = true
  ) => {
    fs.writeFileSync(
      getConfigFilePath(),
      JSON.stringify({
        ...(update ? readConfig() : {}),
        ...data,
      })
    );
    config = readConfig();
  };

  const getConfig: Interface['getConfig'] = (): T => {
    if (!config) config = readConfig();
    return config;
  };

  const removeConfigValue: Interface['removeConfigValue'] = (key: keyof T) => {
    let tmp = readConfig();
    delete tmp[key];
    writeConfig(tmp, false);
  };

  return { setup, getConfig, writeConfig, removeConfigValue };
};
