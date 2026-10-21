export const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'vk', label: 'VK' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: '' }
];

export function validateSocial(platform = '', username = '') {
  if (typeof platform !== 'string' || typeof username !== 'string') return { valid: false, field: 'socialUsername' };
  const handle = username.trim();
  if (platform === '' && handle === '') return { valid: true, platform: '', username: '' };
  if (!socialPlatforms.some(option => option.value === platform)) return { valid: false, field: 'socialPlatform' };
  if (!handle || handle.length > 100 || /\s/u.test(handle) || /[\u0000-\u001f\u007f]/u.test(username)) return { valid: false, field: 'socialUsername' };
  return { valid: true, platform, username: handle };
}
