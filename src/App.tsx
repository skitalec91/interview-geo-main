import React, {useEffect, useState} from 'react';
import {useEffectOnce} from "react-use";
import {Checkbox, FormControlLabel, TextField, Button, IconButton, Container, Stack, Autocomplete} from "@mui/material";
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import './App.css';

type OptionType = {
    id: number;
    label: string;
}

function App() {
    useEffectOnce(() => {
        fetch('http://localhost:3100/api/city')
            .then(data => data.json())
            .then((cities) => {
                console.log(cities);
            });

        fetch('http://localhost:3100/api/user/1', {
            method: 'PATCH',
            body: new Blob([JSON.stringify({currentCityId: 3})], {type: 'application/json'})
        })
            .then(data => data.json())
            .then((user) => {
                console.log(user);
            });
    });

    const [value, setValue] = useState<OptionType | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly OptionType[]>([]);

    useEffect(() => {
        if (!inputValue) {
            setOptions([]);
        }
    }, [inputValue]);

    return (
        <div className="App">
            <Typography variant="h5" color="text.primary">
                Выбор города
            </Typography>
            <Container>
                <Stack direction="column" spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <Autocomplete
                            getOptionLabel={(option) => option.label}
                            filterOptions={(x) => x}
                            options={options}
                            fullWidth
                            autoComplete
                            includeInputInList
                            filterSelectedOptions
                            value={value}
                            noOptionsText="No locations"
                            onChange={(event: any, newValue: OptionType | null) => {
                                setValue(newValue);
                            }}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Выберите город" fullWidth size="small"/>
                            )}
                            renderOption={(props, option) => {
                                return (
                                    <li {...props}>
                                        <Grid container alignItems="center">
                                            <Grid item sx={{display: 'flex', width: 44}}>
                                                <LocationOnIcon sx={{color: 'text.secondary'}}/>
                                            </Grid>
                                            <Grid item sx={{width: 'calc(100% - 44px)', wordWrap: 'break-word'}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.label}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </li>
                                );
                            }}
                        />
                        <IconButton aria-label="delete">
                            <NavigationIcon/>
                        </IconButton>
                    </Stack>
                    <FormControlLabel control={<Checkbox/>} label="Определять город автоматически"/>
                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <Button variant="contained" color="primary">Сохранить</Button>
                    </Stack>
                </Stack>
            </Container>
        </div>
    );
}

export default App;
