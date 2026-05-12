# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/QuickServeQR.API/QuickServeQR.API.csproj backend/QuickServeQR.API/
RUN dotnet restore backend/QuickServeQR.API/QuickServeQR.API.csproj

COPY backend/ backend/
RUN dotnet publish backend/QuickServeQR.API/QuickServeQR.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# PORT is injected by Render at runtime; fallback to 8080 for local docker run
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "QuickServeQR.API.dll"]
