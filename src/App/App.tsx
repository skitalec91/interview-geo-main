import { useEffect, useState, useCallback, useRef, ChangeEventHandler } from 'react';
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  IconButton,
  Container,
  Stack,
  Autocomplete,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import './styles/App.css';
import { OptionType, City } from './types';
import { fetchCities } from './utils/fetchCities';

const LOCAL_DETECTED_CITY_KEY = 'cached_detected_city';

function App() {
  const [value, setValue] = useState<OptionType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<readonly OptionType[]>([]);
  const [isAuto, setIsAuto] = useState<boolean>(true);

  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const allCitiesRef = useRef<City[]>([]);
  const [isCitiesLoaded, setIsCitiesLoaded] = useState(false);

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
        setOptions([]);
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

  const initUser = useCallback(
    async (signal: AbortSignal) => {
      try {
        const response = await fetch('/api/user/1', { signal });
        const user: { id: number; currentCityId: number | null } = await response.json();

        if (user.currentCityId) {
          const cityRes = await fetch(`/api/city/${user.currentCityId}`, { signal });
          if (cityRes.ok) {
            const city: City = await cityRes.json();
            setValue({ id: city.id, label: city.name });
            return;
          }
        }
        loadDefaultCity(signal);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          loadDefaultCity(signal);
        }
      }
    },
    [loadDefaultCity]
  );

  useEffect(() => {
    const controller = new AbortController();
    initUser(controller.signal);

    return () => {
      controller.abort();
    };
  }, [initUser]);

  useEffect(() => {
    if (isAuto || isCitiesLoaded) return;

    const controller = new AbortController();
    setIsSearchLoading(true);

    fetchCities(
      { signal: controller.signal },
      (cities) => {
        allCitiesRef.current = cities;
        setIsCitiesLoaded(true);
        setIsSearchLoading(false);
      },
      (error) => {
        if ((error as Error).name !== 'AbortError') {
          setIsSearchLoading(false);
        }
      }
    );

    return () => {
      controller.abort();
    };
  }, [isAuto, isCitiesLoaded]);

  useEffect(() => {
    if (isAuto) {
      setOptions([]);
      return;
    }

    if (!inputValue.trim()) {
      setOptions(
        allCitiesRef.current.slice(0, 10).map((city) => ({ id: city.id, label: city.name }))
      );
      return;
    }

    const lowerQuery = inputValue.toLowerCase().trim();
    const filtered = allCitiesRef.current
      .filter((city) => city.name.toLowerCase().startsWith(lowerQuery))
      .slice(0, 10);

    setOptions(filtered.map((city) => ({ id: city.id, label: city.name })));
  }, [inputValue, isAuto, isCitiesLoaded]);

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
