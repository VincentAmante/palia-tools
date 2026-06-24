import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

interface UISettings {
  floatComponentLocation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  toastsLocation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  cropTile: {
    showBonusIcons: boolean;
    showBonusBackground: boolean;
  };
  colorScheme: 'light' | 'dark' | 'system';
  showAsProcessedItems: boolean;
  showAsProcessedGold: boolean;
  showAsProcessedTime: boolean;
    showGridAxesLabels: boolean
}

type UISettingsKey = keyof UISettings


function updateKey<K extends UISettingsKey>(key: K, settingsA: UISettings, settingsB: UISettings) {
  settingsA[key] = settingsB[key]
}

export const useUiSettings = defineStore('uiSettings', () => {
  const settings = ref<UISettings>({
    floatComponentLocation: 'bottom-right',
    toastsLocation: 'top-center',
    cropTile: {
      showBonusIcons: true,
      showBonusBackground: true,
    },
    colorScheme: 'system',
    showAsProcessedItems: false,
    showAsProcessedGold: true,
    showAsProcessedTime: true,
    
      showGridAxesLabels: true
  });

  const loadInitialised = ref(false);

  function saveSettings(newSettings: UISettings) {
    settings.value = newSettings;

    localStorage.setItem('ui-settings', JSON.stringify(newSettings));
  }

  function loadSettings() {
    const savedSettings = localStorage.getItem('ui-settings');
    if (savedSettings) {
      // Ensure the settings have all the properties of UISettings
      let newSettings = JSON.parse(savedSettings) as UISettings;

      const defaultSettingsKeys = Object.keys(settings.value) as UISettingsKey[]
      let newSettingsKeys = Object.keys(newSettings) as UISettingsKey[]

      // Check for removed keys
      if (!newSettingsKeys.every((key) => defaultSettingsKeys.includes(key))) {
        console.warn('UI Settings: removed key found, updating')
        const updatedNewSettings = {} as UISettings
        defaultSettingsKeys.forEach((key) => {
          updateKey(key, updatedNewSettings, newSettings)
        })

        newSettings = updatedNewSettings
        newSettingsKeys = Object.keys(updatedNewSettings) as UISettingsKey[]

      }

      settings.value = { ...settings.value, ...newSettings }

      if (!(defaultSettingsKeys.every((key) => newSettingsKeys.includes(key)))) {
        console.log('UI Settings: new settings found, setting it to default')
        saveSettings({ ...settings.value, ...newSettings });
      }
    }
  }

  watch(settings, (newSettings) => {
    // Prevents the initial settings from being saved to local storage before they are even loaded.
    if (loadInitialised.value) {
      saveSettings(newSettings);

      if (settings.value.colorScheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (settings.value.colorScheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

    }
  }, { deep: true })

  onMounted(() => {
    loadInitialised.value = true;
    loadSettings();
  });

  return { settings };
});
