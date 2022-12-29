import fs from 'fs';
import os from 'os';
import path from 'path';
import { AppConfigManager, IAppConfigManager } from '../src';

type TestAppConfig = {
  someData: string;
};
type TestAppConfigManager = IAppConfigManager<TestAppConfig>;

describe('AppConfigManager', () => {
  const appName = 'test-app';
  const configDir = path.join(os.homedir(), `.${appName}/config.json`);
  let appConfigManager: TestAppConfigManager;

  beforeEach(() => {
    appConfigManager = AppConfigManager<TestAppConfig>({ appName });
  });

  afterEach(() => {
    fs.rmSync(configDir, { recursive: true, force: true });
  });

  it('should setup app config dir on user home dir', () => {
    expect(fs.existsSync(configDir)).toBe(false);
    appConfigManager.setup();
    expect(fs.existsSync(configDir)).toBe(true);
  });

  it('should read default config correctly', () => {
    appConfigManager.setup();
    expect(appConfigManager.getConfig()).toEqual({});
  });

  it('should set & retrieve config correctly', () => {
    const expectedResult = { someData: '1234' };
    appConfigManager.setup();

    appConfigManager.writeConfig(expectedResult);
    expect(appConfigManager.getConfig()).toEqual(expectedResult);
  });

  it('should setup config with data', () => {
    appConfigManager.setup({ someData: '1234' });

    appConfigManager.removeConfigValue('someData');
    expect(appConfigManager.getConfig()).toEqual({});
  });
});
