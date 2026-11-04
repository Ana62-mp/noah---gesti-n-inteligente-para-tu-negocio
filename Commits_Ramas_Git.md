# Convención de Commits y Ramas en Git

**Estándar de desarrollo — Conventional Commits: estándar oficial del proyecto**

Este documento define el formato obligatorio para los mensajes de commit y los nombres de ramas en el repositorio. Su cumplimiento es requisito para que un Pull Request sea aceptado.

## Contenido

1. [Formato obligatorio del commit](#1-formato-obligatorio-del-commit)
2. [Tipos de commit permitidos](#2-tipos-de-commit-permitidos)
3. [Commits no permitidos](#3-commits-no-permitidos)
4. [Ejemplos correctos e incorrectos](#4-ejemplos-correctos-e-incorrectos)
5. [Reglas para nombres de ramas](#5-reglas-para-nombres-de-ramas)
6. [Política de rechazo automático](#6-política-de-rechazo-automático)
7. [Herramienta recomendada: GitHub Desktop](#7-herramienta-recomendada-github-desktop)
8. [Referencia rápida](#8-referencia-rápida)
9. [Lista de revisión antes de abrir el Pull Request](#9-lista-de-revisión-antes-de-abrir-el-pull-request)

---

## 1. Formato obligatorio del commit

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

- **type:** categoría del cambio. Debe ser uno de los tipos permitidos (sección 2).
- **scope:** módulo o área afectada, por ejemplo `auth`, `api`, `db`. Es opcional, pero recomendado.
- **short description:** resumen breve y claro del cambio, escrito en inglés.
- **body:** explicación adicional cuando el cambio lo requiera.
- **footer:** referencias a issues o tareas, y avisos de cambios incompatibles.

---

## 2. Tipos de commit permitidos

| # | Tipo | Uso | Ejemplo |
|---|------|-----|---------|
| 1 | `feat` | Nueva funcionalidad | `feat(auth): implement jwt refresh token` |
| 2 | `fix` | Corrección de errores | `fix(payments): rounding issue in total price` |
| 3 | `docs` | Documentación | `docs(readme): add installation steps` |
| 4 | `style` | Cambios que no afectan la lógica (espacios, formato, comas, prettier) | `style(api): reformat routes file` |
| 5 | `refactor` | Mejoras internas sin cambiar el comportamiento | `refactor(core): simplify error handler` |
| 6 | `perf` | Optimización de rendimiento | `perf(db): improve index performance on orders` |
| 7 | `test` | Agregar o actualizar pruebas | `test(users): add missing unit tests` |
| 8 | `build` | Cambios en dependencias o en el sistema de build | `build(workspace): update pnpm workspace config` |
| 9 | `chore` | Tareas varias que no afectan producción | `chore(repo): update gitignore` |
| 10 | `ci` | Cambios en pipelines, GitHub Actions o tareas de Turborepo | `ci(turbo): update pipeline for preview deploy` |

---

## 3. Commits no permitidos

Los siguientes mensajes son genéricos, no describen el cambio y serán rechazados:

```
update files
fix stuff
changes
arreglos varios
bugfix
prueba
commit 1
```

---

## 4. Ejemplos correctos e incorrectos

### Correctos

```
feat(products): add color variants in model
fix(api): handle 500 errors on user route
docs: add architecture diagram
```

### Ejemplo con cuerpo del commit

```
docs: add project-specific CLEANCODE architectural standards and guidelines

- Define unidirectional layer architecture (modules, auth, services, tools)
- Detail zero-trust Cognito identity resolution and DynamoDB RBAC
- Document strict multi-tenant data segregation, ZonasParqueo tuple verification, and dashboard isolation policies
- Standardize domain error hierarchies and Vitest testing guidelines
```

### Incorrectos

| Commit | Motivo del rechazo |
|--------|--------------------|
| `feat: new update` | La descripción es vaga y no explica qué funcionalidad se agregó. |
| `fix login` | No sigue el formato `<type>(<scope>): <description>`. |

---

## 5. Reglas para nombres de ramas

Todas las ramas deben seguir este formato:

```
<type>/<short-description>-<issue|task-id>
```

### Tipos de rama permitidos

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nuevas características |
| `fix/` | Corrección de errores |
| `hotfix/` | Parche urgente en producción |
| `chore/` | Tareas menores |
| `refactor/` | Refactorización |
| `release/` | Ramas de release semántica |
| `docs/` | Cambios de documentación |

### Ejemplos correctos

```
feature/auth-system-231
feature/product-filters-102
fix/order-total-precision-558
refactor/user-service-cleanup-87
chore/update-prettier-config-44
```

### Ejemplos no permitidos

```
leo-dev
arreglo-login
feature1
prueba
changes
bugfix
newbranch
final
dev-login
```

---

## 6. Política de rechazo automático

No se aceptarán Pull Requests en los siguientes casos:

1. Los commits no cumplen con Conventional Commits.
2. La rama no cumple con el estándar de nombres.
3. Se usa español en los mensajes de commit o en los nombres de ramas.
4. Los commits mezclan tipos (por ejemplo, `feat` y `fix` en el mismo commit).
5. El PR contiene "WIP", "tmp" o "test".
6. No se enlaza el issue o la tarea correspondiente.

---

## 7. Herramienta recomendada: GitHub Desktop

Para mayor facilidad, se recomienda usar GitHub Desktop para realizar los commits. Permite escribir el título (`<type>(<scope>): <short description>`) y la descripción del commit en campos separados, ver los archivos modificados antes de confirmar y publicar los cambios sin usar la terminal.

*Ejemplo de commit con título y descripción en GitHub Desktop: el título va en el campo superior (`docs: add project-specific CLEANCODE architectural standards and guidelines`) y el cuerpo con la lista de cambios en el campo de descripción.*

---

## 8. Referencia rápida

### Plantilla de commit

```
<type>(<scope>): <short description in English>

- Body line explaining what changed and why (optional)

Refs: #<issue-id>
```

### Equivalencia entre prefijo de rama y tipo de commit

| Prefijo de rama | Tipos de commit habituales dentro de la rama |
|-----------------|----------------------------------------------|
| `feature/` | `feat`, `test`, `docs`, `style` |
| `fix/` | `fix`, `test` |
| `hotfix/` | `fix`, `test` |
| `chore/` | `chore`, `build`, `ci` |
| `refactor/` | `refactor`, `perf`, `test` |
| `release/` | `chore`, `docs`, `build` |
| `docs/` | `docs` |

### Reglas de redacción

- Descripción corta en inglés, en modo imperativo y en minúscula: `add`, `fix`, `update`, `remove`.
- Sin punto final en el título del commit.
- Un commit, un tipo de cambio: si el trabajo incluye dos tipos (por ejemplo `feat` y `fix`), se hacen dos commits.
- Nombre de rama en minúsculas, con palabras separadas por guiones y terminado en el identificador del issue o tarea.
- Los avisos de cambios incompatibles y las referencias a issues van en el footer.

### Ejemplos de footer

```
Refs: #231
Closes: #558
BREAKING CHANGE: the /users endpoint now requires an auth token
```

---

## 9. Lista de revisión antes de abrir el Pull Request

- [ ] Todos los commits siguen `<type>(<scope>): <short description>` con un tipo permitido.
- [ ] Los mensajes de commit y los nombres de rama están en inglés.
- [ ] Ningún commit mezcla tipos de cambio.
- [ ] Ningún mensaje es genérico (`update files`, `changes`, `bugfix`, etc.).
- [ ] La rama sigue `<type>/<short-description>-<issue|task-id>` con un prefijo permitido.
- [ ] El PR no contiene "WIP", "tmp" ni "test".
- [ ] El PR enlaza el issue o la tarea correspondiente.
