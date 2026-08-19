import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/api/user/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1, currentCityId: 1 })
          });
        }

        if (url.includes('/api/city')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ id: 1, name: 'Москва', lat: 55.75, lng: 37.62 }])
          });
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      })
    );
  });

  it('отображает заголовок "Выбор города"', () => {
    render(<App />);
    const heading = screen.getByText(/выбор города/i);
    expect(heading).toBeInTheDocument();
  });
});
