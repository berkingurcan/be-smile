import type { Locale } from './site';

export const socialCopy: Record<Locale, {
  title: string; hint: string; platform: string; choose: string; other: string;
  username: string; placeholder: string; platformError: string; usernameError: string;
}> = {
  en: { title: 'Social media (optional)', hint: 'Share a profile so we can get to know you.', platform: 'Platform', choose: 'Choose a platform', other: 'Other', username: 'Username', placeholder: '@your_username', platformError: 'Choose a platform for your username.', usernameError: 'Enter a username without spaces, up to 100 characters.' },
  tr: { title: 'Sosyal medya (isteğe bağlı)', hint: 'Seni daha yakından tanımamız için bir profilini paylaşabilirsin.', platform: 'Platform', choose: 'Platform seç', other: 'Diğer', username: 'Kullanıcı adı', placeholder: '@kullanici_adin', platformError: 'Kullanıcı adının ait olduğu platformu seç.', usernameError: 'Boşluk içermeyen, en fazla 100 karakterlik bir kullanıcı adı gir.' },
  de: { title: 'Social Media (optional)', hint: 'Teile ein Profil, damit wir dich besser kennenlernen können.', platform: 'Plattform', choose: 'Plattform wählen', other: 'Andere', username: 'Benutzername', placeholder: '@dein_benutzername', platformError: 'Wähle die Plattform für deinen Benutzernamen.', usernameError: 'Gib einen Benutzernamen ohne Leerzeichen mit maximal 100 Zeichen ein.' },
  ru: { title: 'Соцсети (необязательно)', hint: 'Поделись профилем, чтобы мы могли узнать тебя поближе.', platform: 'Платформа', choose: 'Выбери платформу', other: 'Другая', username: 'Имя пользователя', placeholder: '@твой_ник', platformError: 'Выбери платформу для своего имени пользователя.', usernameError: 'Введи имя пользователя без пробелов, до 100 символов.' }
};
