import { Linking } from 'react-native';

export function openUrl(url: string) {
    void Linking.openURL(url);
}
