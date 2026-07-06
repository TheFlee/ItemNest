# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build

ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

WORKDIR /src
COPY backend/ItemNest.Api/ItemNest.Api.csproj backend/ItemNest.Api/
COPY backend/ItemNest.Application/ItemNest.Application.csproj backend/ItemNest.Application/
COPY backend/ItemNest.Domain/ItemNest.Domain.csproj backend/ItemNest.Domain/
COPY backend/ItemNest.Infrastructure/ItemNest.Infrastructure.csproj backend/ItemNest.Infrastructure/
RUN dotnet restore backend/ItemNest.Api/ItemNest.Api.csproj

COPY . .
COPY --from=frontend-build /src/frontend/dist ./backend/ItemNest.Api/wwwroot
RUN dotnet publish backend/ItemNest.Api/ItemNest.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=backend-build /app/publish .
ENTRYPOINT ["dotnet", "ItemNest.Api.dll"]
