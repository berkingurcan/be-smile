import { defineEnvVars } from '@sveltejs/kit/env';

// Server-only runtime settings. Empty values keep recruitment in preview mode.
export const variables = defineEnvVars({
  RESEND_API_KEY: { schema: (value) => value || '' },
  APPLICATION_TO_EMAIL: { schema: (value) => value || '' },
  APPLICATION_FROM_EMAIL: { schema: (value) => value || '' }
});
