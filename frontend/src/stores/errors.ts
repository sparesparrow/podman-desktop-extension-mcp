/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { Readable } from 'svelte/store';
import { readable } from 'svelte/store';
import { Messages } from '@shared/Messages';
import { rpcBrowser, studioClient } from '/@/utils/client';
import type { ErrorState } from '@shared/src/models/IError';

export const errors: Readable<ErrorState[]> = readable<ErrorState[]>([], set => {
  // Subscribe to error updates from backend
  const sub = rpcBrowser.subscribe(Messages.MSG_NEW_ERROR_STATE, msg => {
    set(msg);
  });

  // Request initial error state
  studioClient
    .getErrors()
    .then(state => {
      set(state);
    })
    .catch((err: unknown) => {
      console.error('Error getting error state:', err);
      // Initialize with empty state on error
      set([]);
    });

  // Cleanup subscription on store destruction
  return () => {
    sub.unsubscribe();
  };
});

export async function acknowledgeError(id: string): Promise<void> {
  try {
    await studioClient.acknowledgeError(id);
  } catch (err: unknown) {
    console.error('Error acknowledging error:', err);
  }
} 