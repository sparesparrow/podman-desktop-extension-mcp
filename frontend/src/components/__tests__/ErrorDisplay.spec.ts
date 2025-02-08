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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ErrorDisplay from '../ErrorDisplay.svelte';
import * as errorStore from '/@/stores/errors';
import { studioClient } from '/@/utils/client';
import type { ErrorState } from '@shared/src/models/IError';

vi.mock('/@/utils/client', () => ({
  studioClient: {
    acknowledgeError: vi.fn(),
  },
}));

describe('ErrorDisplay', () => {
  const mockErrors: ErrorState[] = [
    {
      id: '1',
      message: 'Test error 1',
      timestamp: Date.now(),
      acknowledged: false,
      source: 'test',
    },
    {
      id: '2',
      message: 'Test error 2',
      timestamp: Date.now() - 1000,
      acknowledged: true,
      source: 'test',
    },
  ];

  beforeEach(() => {
    vi.spyOn(errorStore, 'errors', 'get').mockReturnValue({
      subscribe: (fn: (value: ErrorState[]) => void): (() => void) => {
        fn(mockErrors);
        const unsubscribe = (): void => {};
        return unsubscribe;
      },
    });
  });

  test('should render error messages', () => {
    render(ErrorDisplay);
    
    expect(screen.getByText('Test error 1')).toBeDefined();
    expect(screen.getByText('Test error 2')).toBeDefined();
  });

  test('should show acknowledge button only for unacknowledged errors', () => {
    render(ErrorDisplay);
    
    const acknowledgeButtons = screen.getAllByRole('button', { name: /acknowledge/i });
    expect(acknowledgeButtons).toHaveLength(1);
  });

  test('should call acknowledgeError when acknowledge button is clicked', async () => {
    render(ErrorDisplay);
    
    const acknowledgeButton = screen.getByRole('button', { name: /acknowledge/i });
    await fireEvent.click(acknowledgeButton);
    
    expect(studioClient.acknowledgeError).toHaveBeenCalledWith('1');
  });

  test('should display source when available', () => {
    render(ErrorDisplay);
    
    const sources = screen.getAllByText(/source: test/i);
    expect(sources).toHaveLength(2);
  });

  test('should sort errors by timestamp', () => {
    render(ErrorDisplay);
    
    const errorMessages = screen.getAllByRole('alert');
    expect(errorMessages[0].textContent).toContain('Test error 1');
    expect(errorMessages[1].textContent).toContain('Test error 2');
  });
}); 