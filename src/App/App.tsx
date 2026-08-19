import { useEffect, useState, useCallback, ChangeEventHandler } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import './styles/App.css';
import { OptionType, City } from './types';
import { fetchCities } from './utils/fetchCities';

const LOCAL_DETECTED_CITY_KEY = 'cached_detected_city';

function App() {
  const [value, setValue] = useState<OptionType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAuto, setIsAuto] = useState<boolean>(true);

  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [options, setOptions] = useState<readonly OptionType[]>([]);

  const loadDefaultCity = useCallback((signal?: AbortSignal) => {
    const cachedDetectedCityStr = localStorage.getItem(LOCAL_DETECTED_CITY_KEY);
    if (cachedDetectedCityStr) {
      try {
        const cachedCity: OptionType = JSON.parse(cachedDetectedCityStr);
        setValue(cachedCity);
        return;
      } catch {
        localStorage.removeItem(LOCAL_DETECTED_CITY_KEY);
      }
    }

    if (!navigator.geolocation) {
      console.error('Геолокация не поддерживается вашим браузером');
      setIsAuto(false);
      return;
    }

    setIsLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (signal?.aborted) return;

        const { latitude, longitude } = position.coords;

        fetchCities(
          { lat: latitude, lng: longitude, limit: 1, signal },
          (cities) => {
            setIsLocationLoading(false);
            if (cities.length === 0) {
              console.error('Не удалось найти ближайший город по геолокации');
              setIsAuto(false);
              return;
            }
            const nearest = cities[0];
            const detectedOption: OptionType = { id: nearest.id, label: nearest.name };

            localStorage.setItem(LOCAL_DETECTED_CITY_KEY, JSON.stringify(detectedOption));
            setValue(detectedOption);
          },
          (error) => {
            setIsLocationLoading(false);
            if ((error as Error).name !== 'AbortError') {
              console.error('Ошибка загрузки города по координатам:', error);
              setIsAuto(false);
            }
          }
        );
      },
      (error) => {
        setIsLocationLoading(false);
        console.error('Не удалось получить координаты пользователя:', error);
        setIsAuto(false);
      }
    );
  }, []);

  const handleDetectLocation = useCallback(() => {
    if (isLocationLoading) return;
    localStorage.removeItem(LOCAL_DETECTED_CITY_KEY);
    loadDefaultCity();
  }, [isLocationLoading, loadDefaultCity]);

  const handleAutoToggle = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const checked = event.target.checked;
      setIsAuto(checked);

      if (checked) {
        loadDefaultCity();
      }
    },
    [loadDefaultCity]
  );

  const handleSave = useCallback(() => {
    fetch('/api/user/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCityId: value ? value.id : null })
    })
      .then((res) => res.json())
      .then(() => alert('Настройки успешно сохранены!'));
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();

    const initUser = async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;

      try {
        const response = await fetch('/api/user/1', { signal: controller.signal });
        const user: { id: number; currentCityId: number | null } = await response.json();

        if (user.currentCityId) {
          const cityRes = await fetch(`/api/city/${user.currentCityId}`, {
            signal: controller.signal
          });
          if (cityRes.ok) {
            const city: City = await cityRes.json();
            setValue({ id: city.id, label: city.name });
            return;
          }
        }
        loadDefaultCity(controller.signal);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          loadDefaultCity(controller.signal);
        }
      }
    };

    initUser();

    return () => {
      controller.abort();
    };
  }, [loadDefaultCity]);

  useEffect(() => {
    if (isAuto || !inputValue.trim()) {
      Promise.try(() => {
        setOptions([]);
        setIsSearchLoading(false);
      });
      return;
    }

    const controller = new AbortController();

    const timerId = setTimeout(() => {
      setIsSearchLoading(true);

      fetchCities(
        { prefix: inputValue.trim(), limit: 10, signal: controller.signal },
        (cities) => {
          setOptions(cities.map((city) => ({ id: city.id, label: city.name })));
          setIsSearchLoading(false);
        },
        (error) => {
          if ((error as Error).name !== 'AbortError') {
            setIsSearchLoading(false);
          }
        }
      );
    }, 300);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [inputValue, isAuto]);

  return (
    <div className="App">
      <Typography variant="h5" color="text.primary" sx={{ mt: 3, mb: 2 }}>
        Выбор города
      </Typography>
      <Container maxWidth="xs">
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={1}>
            <Autocomplete
              openOnFocus
              disabled={isAuto}
              loading={isSearchLoading}
              loadingText="Загрузка списка городов..."
              getOptionLabel={(option) => option.label}
              filterOptions={(x) => x}
              options={options}
              fullWidth
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={value}
              noOptionsText="Города не найдены"
              onChange={(_event, newValue: OptionType | null) => {
                setValue(newValue);
              }}
              onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(parameters) => (
                <TextField {...parameters} label="Выберите город" fullWidth size="small" />
              )}
              renderOption={(properties, option) => {
                const { key, ...otherProperties } = properties;
                return (
                  <li key={key} {...otherProperties}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ display: 'flex', width: 44 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary' }} />
                      </Box>
                      <Box sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                        <Typography variant="body2" color="text.secondary">
                          {option.label}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                );
              }}
            />
            <IconButton
              disabled={isAuto || isLocationLoading}
              aria-label="location"
              onClick={handleDetectLocation}
            >
              {isLocationLoading ? <CircularProgress size={20} /> : <NavigationIcon />}
            </IconButton>
          </Stack>
          <FormControlLabel
            control={<Checkbox checked={isAuto} onChange={handleAutoToggle} />}
            label="Определять город автоматически"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={isAuto}>
              Сохранить
            </Button>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}

export default App;
