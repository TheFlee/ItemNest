# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build

ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

WORKDIR /src/ItemNest.Api/itemnest-front
COPY ItemNest.Api/itemnest-front/package*.json ./
RUN npm ci
COPY ItemNest.Api/itemnest-front/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

WORKDIR /src
COPY ItemNest.Api/ItemNest.Api.csproj ItemNest.Api/
COPY ItemNest.Application/ItemNest.Application.csproj ItemNest.Application/
COPY ItemNest.Domain/ItemNest.Domain.csproj ItemNest.Domain/
COPY ItemNest.Infrastructure/ItemNest.Infrastructure.csproj ItemNest.Infrastructure/
RUN dotnet restore ItemNest.Api/ItemNest.Api.csproj

COPY . .
COPY --from=frontend-build /src/ItemNest.Api/itemnest-front/dist ./ItemNest.Api/wwwroot
RUN dotnet publish ItemNest.Api/ItemNest.Api.csproj \
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
