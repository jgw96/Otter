export interface Settings {
    primary_color: string;
    font_size: string;
    data_saver: boolean;
    wellness: boolean;
    focus: boolean;
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
    localStorage.setItem('settings', JSON.stringify(settings));
}