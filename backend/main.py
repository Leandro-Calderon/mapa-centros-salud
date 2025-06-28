from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from db_config import get_connection

from fastapi.responses import JSONResponse

app = FastAPI()

# Permitir CORS para consumo desde Leaflet o apps frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/centros")
def get_centros(categoria: str = Query(None)):
    conn = get_connection()
    cur = conn.cursor()

    if categoria:
        query = """
            SELECT json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(
                    json_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(geom)::json,
                        'properties', json_build_object(
                            'id', id,
                            'nombre', nombre,
                            'categoria', categoria
                        )
                    )
                )
            )
            FROM centros_salud
            WHERE LOWER(categoria) = LOWER(%s);
        """
        cur.execute(query,(categoria,))
    else:
        query = """
            SELECT json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(
                    json_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(geom)::json,
                        'properties', json_build_object(
                            'id', id,
                            'nombre', nombre,
                            'categoria', categoria
                        )
                    )
                )
            )
            FROM centros_salud;
        """
        cur.execute(query)


    result = cur.fetchone()[0]
    cur.close()
    return JSONResponse(content=result)