# Fire Tracker

A simple web application that displays all possible fire instances (or hotspots) based on several parameters. Data is fetched from several sources such as fire data from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/active_fire/), wind data from [NOAA GFS](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) using Flowm's [wind server](https://github.com/Flowm/wind-server), and World Air Quality Index from [AQICN.com](https://aqicn.org/here/).

The basemap is rendered using CARTO Basemap ("Dark matter" variant) and Maplibre-gl. Deck.gl was utilized for rendering the fire hotspots overlay, and Redis was used for caching existing data and prevent unnecessary API fetches. The backend utilizes the ASP.NET environment for writing server-side operations such as API requests, caching, and mathematical operations needed for rendering the wind particles.

<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/e378567b-a16e-4e65-ae7d-716d61d01c1f" />
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/d994462f-665a-44e1-a295-526541cbf681" />
<img width="1919" height="907" alt="image" src="https://github.com/user-attachments/assets/2b328503-216b-402f-82df-d158c7ef09e9" />


## Features

- Map interaction: Zoom in and out.
- Geolocation: Users can see where they are (if they consented) on the map using native `navigator.geolocation` API.
- Responsiveness on smaller screens (for mobile devices, etc.)
- View current fire hotspots around the globe, and view data on each of them. The data includes:
  - `confidence` → low/nominal/high.
  - `daynight` → whether the hotspot was detected either on day or night.
  - `satellite` → data source (Suomi NPP).
  - `acquired-date` → date of data acquisition.
  - `acquired-time` → time of data acquisition.
  - `longitude` and `latitude` → exact position of the hotspot relative to the geographic coordinate system.

## Authors

- [@danskyvich](https://github.com/danskyvich)

## Optimizations

In order to reduce the strain of rendering layers at once, Fire Tracker utilizes Redis' caching layer to prevent wasteful data fetching. All loaded data coming from API requests are stored inside Redis' in-memory storage, making fast data retrieval possible. 

## Tech Stack

**Client:** React, TailwindCSS, Next.JS, Maplibre-gl & Maplibre-gl-wind, Deck.gl, JavaScript & Typescript, 

**Server:** ASP.NET Core API, C#, Docker, Redis

**Tools**: Visual Studio Code, Postman API
