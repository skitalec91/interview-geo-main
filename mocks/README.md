# API

## User
```typescript
type User = {
    id: number;
    currentCityId: number | null;
}
```

Получение пользователя:
`GET /api/user/${id}`

Обновление пользователя:
`PATCH /api/user/${id}`

Тело запроса:
```
{ currentCityId: number | null }
```

## City
```typescript
type City = {
    id: number;
    name: string;
    lat: number;
    lng: number;
}
```

Получение городов:
`GET /api/city`

Доступные query-параметры:

`prefix: string` - фильтрует города по имени
`lat: number; lng: number;` - сортирует города по расстоянию до точки
`limit: number` - ограничивает число городов в ответе 