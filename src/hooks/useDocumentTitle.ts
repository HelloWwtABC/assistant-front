import { useEffect } from 'react';

import { appEnv } from '@/config/env';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${appEnv.appTitle}` : appEnv.appTitle;
  }, [title]);
}
