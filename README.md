# `@shared/backend`

Librería transversal de backend compartida para servicios basados en NestJS y Node.js.

## Componentes Exportados

- **`TransformResponseInterceptor`**: Interceptor global que estandariza todas las respuestas HTTP (`{ success, data, error, meta }`).
- **`AllExceptionsFilter`**: Filtro global de excepciones que captura errores y formatea el payload de error unificado.
- **`PaginationDto`**: DTO con validaciones (`class-validator`) para paginación (`page`, `limit`).
- **`PaginatedResponse<T>`**: Interfaz TypeScript para resultados paginados.
