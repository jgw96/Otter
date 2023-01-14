export interface Settings {
    primary_color?: string;
    font_size?: string;
    data_saver?: boolean;
    wellness?: boolean;
    focus?: boolean;
}

const defaultSettings = {
    primary_color: "#809bce",
    font_size: "16px",
    data_saver: false,
    wellness: false,
    focus: false
}

export function getSettings(): Settings {
    const settings = localStorage.getItem('settings');
    return settings ? JSON.parse(settings) : defaultSettings;
}

export function setSettings(settings: Settings) {
    const currentSettings = getSettings();

    const savedSettings = {
        primary_color: settings.primary_color || currentSettings.primary_color,
        font_size: settings.font_size || currentSettings.font_size,
        data_saver: Object.keys(settings).includes("data_saver") ? settings.data_saver : currentSettings.data_saver,
        wellness: Object.keys(settings).includes("wellness") ? settings.wellness : currentSettings.wellness,
        focus: Object.keys(settings).includes("focus") ? settings.focus : currentSettings.focus,
    }
    localStorage.setItem('settings', JSON.stringify(savedSettings));
}