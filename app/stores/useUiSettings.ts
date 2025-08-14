import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

interface UISettings {
  floatComponentLocation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  toastsLocation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  cropTile: {
    showBonusIcons: boolean;
    showBonusBackground: boolean;
  };
  colorScheme: 'light' | 'dark' | 'system'
}

export const useUiSettings = defineStore('uiSettings', () => {
  const settings = ref<UISettings>({
    floatComponentLocation: 'bottom-right',
    toastsLocation: 'top-center',
    cropTile: {
      showBonusIcons: true,
      showBonusBackground: true,
    },
    colorScheme: 'system'
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
      // If any properties are missing, add them with default values
      if (!newSettings.floatComponentLocation) newSettings.floatComponentLocation = 'bottom-right';
      if (!newSettings.toastsLocation) newSettings.toastsLocation = 'top-center';
      if (!newSettings.cropTile) newSettings.cropTile = {
        showBonusIcons: true,
        showBonusBackground: true,
      };
      if (!newSettings.colorScheme) newSettings.colorScheme = 'system'

      saveSettings(JSON.parse(savedSettings));
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
