import gpxpy
import sys
import pandas as pd
import geopy
import json

from geopy import distance
from math import radians, cos, sin, atan2, degrees
from xml.dom.minidom import parseString


def gpxTransform(gpx_raw):
    """
    Converts GPX string into dictionary + calculates following datapoints:
        - distance, cumulative distance
        - bearing
        - slope
        - duration / cumulative duration
        - speed (km/h)
        - location name
    """

    def bearing(lat1, long1, lat2, long2):
        """
        Helper function to calculate bearing between two coordinates.
        """
        dLon = long2 - long1
        x = cos(radians(lat2)) * sin(radians(dLon))
        y = cos(radians(lat1)) * sin(radians(lat2)) - sin(radians(lat1)) * cos(
            radians(lat1)
        ) * cos(radians(dLon))
        brng = atan2(x, y)
        brng = degrees(brng)
        return brng

    # Convert raw GPX string to pandas dataframe
    df = pd.DataFrame(
        [
            (pt.time, pt.latitude, pt.longitude, pt.elevation)
            for pt in gpx_raw.tracks[0].segments[0].points
        ],
        columns=["time", "lat", "long", "elev"],
    )

    ####################### Calculating Additional Variables ###########################

    coords = list(zip(df.lat, df.long))

    df["dist"] = [0] + [
        distance.distance(orig, dest).m for orig, dest in zip(coords[:-1], coords[1:])
    ]

    df["cumdist"] = df.dist.cumsum()

    df["bear"] = [None] + [
        bearing(c1[0], c1[1], c2[0], c2[1]) for c1, c2 in zip(coords[:-1], coords[1:])
    ]

    df["slope"] = [
        elev / dist if dist else None
        for elev, dist in zip(df.elev.diff(), df.cumdist.diff())
    ]

    df["dur"] = df.time.diff().dt.total_seconds().fillna(0)

    df["cumdur"] = df.dur.cumsum()

    df["km/h"] = pd.Series((df.dur / 60) / (df.dist / 1000)).bfill()

    df["time"] = df["time"].apply(lambda x: x.isoformat())

    ######################################################################################

    # Temp values until user provides course segment input
    df["segment"] = [0] * len(df)
    df["terrain"] = [0] * len(df)
    df["roughness"] = [0] * len(df)

    # Converting dataframe back into dictionary
    df = df.to_dict("list")

    # Getting location name based on start coordinates of course
    geolocator = geopy.geocoders.Nominatim(user_agent="geoapiExercises")
    address = geolocator.reverse(
        str(df["lat"][0]) + "," + str(df["long"][0]), language="en", addressdetails=True
    ).raw["address"]
    df["address"] = {
        k: address[k]
        for k in ["city", "province", "state", "country", "postcode"]
        if k in address
    }

    df["loc_coords"] = (df["lat"][0], df["long"][0])

    df["zipped_latlon"] = list(zip(df["lat"], df["long"]))

    return df


# Method to read XML data from a file.
def read_xml(xml_file):
    with open(xml_file, "r") as f:
        data = f.read()

    return data


# Final method to return result.
file = read_xml(sys.argv[1])
print(
    json.dumps(gpxTransform(gpxpy.parse(file)), separators=(",", ":")).replace(
        "NaN", "0"
    ),
)
sys.stdout.flush()