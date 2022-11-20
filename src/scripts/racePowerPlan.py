import math
import requests
import json
import pandas as pd
from dateutil import parser
from gpxTransform import gpxTransform
import datetime
import copy
from bisect import bisect_left



class Weather:
    """
    fetches weather data from Tomorrow.io API
    """

    def __init__(self, apiKeyInput):
        self.apiKey = apiKeyInput
        self.baseUrl = "https://api.tomorrow.io/v4/timelines"
        self.windData = None
        self.generalData = None

    def query(self, latitude, longitude, startTimeIso, endTimeIso):
        """
        Enter coordinates of Race and its start/end time in ISO8601
        Generates weather data in 1 minute intervals for duration of race.
        """
        querystring = {
            "location": f"{latitude},{longitude}",
            "startTime": startTimeIso,
            "endTime": endTimeIso,
            "fields": [
                "temperature",
                "humidity",
                "precipitationProbability",
                "pressureSurfaceLevel",
                "windSpeed",
                "windDirection",
            ],
            "units": "metric",
            "timesteps": "1m",
            "apikey": self.apiKey,
        }

        res = requests.request("GET", self.baseUrl, params=querystring)
        data = json.loads(res.text)["data"]["timelines"][0]["intervals"]
        for obj in data:
            obj.update(obj["values"])
            obj.pop("values")
            obj["startTime"] = parser.parse(obj["startTime"])

        self.windData = pd.DataFrame(data).set_index("startTime")
        self.generalData = self.windData.to_dict("records")[0]

    def windAtTime(self, curTimeIso):
        """
        Returns closest wind data for time interval closest to time provided by user.
        """
        curtime = pd.to_datetime(curTimeIso)
        closest = dict(
            self.windData.iloc[self.windData.index.get_loc(curtime, method="nearest")]
        )
        return {
            "windSpeed": closest["windSpeed"],
            "windDirection": closest["windDirection"],
        }

    def general(self):
        """
        Returns general weather data (temp, humidity, precipitation, air pressure) at race start time.
        """
        return self.generalData


# test json data - this will be sent by caller in future
bikerider = {
    "rider": {
        "rider_mass_kg": 71,
        "other_mass_kg": 1,
        "functional_threshold_power_w": 430,
        "anaerobic_work_capacity_j": 35000,
        "anaerobic_recovery_function": 1,
    },
    "bike": {
        "bike_mass_kg": 7,
        "rolling_resistance_coefficient": 0.0025,
        "mechanical_efficiency": 0.98,
        "moment_of_intertia_front": 0.08,
        "moment_of_intertia_rear": 0.08,
        "wheel_radius": 0.335,
    },
    "cda": {
        "a": {12: 0.188, 14: 0.184, 16: 0.182},
    },
    "pct_slope_thresholds": {
        "power": {"steady_state": -1, "over_state": 7.5},
        "position": {"seated": -1, "outriggers": 3},
    },
    "functional_power_by_state": {
        "descent_state": 0.02,
        "steady_state": 0.91,
        "over_state": 1.1,
    },
}

# test course data - will also be sent by caller in future
course = gpxTransform(open("Tokyo-Olympics-Men's-ITT_track.gpx", "r").read())
course.pop("address")
start_coords = course.pop("loc_coords")
course = pd.DataFrame(course)
course["slope"][0] = 0
course["bear"][0] = 0


def calc_effective_yaw_angle(wind_speed_1m, relative_wind_angle, speed):
    res = math.degrees(
        math.atan(
            wind_speed_1m
            * math.sin(math.radians(relative_wind_angle))
            / (speed + wind_speed_1m * math.cos(math.radians(relative_wind_angle)))
        )
    )
    return res


# Position
def calc_position(slope, lower_bound, upper_bound):
    if slope > upper_bound:
        return "b"
    elif slope <= upper_bound and slope >= lower_bound:
        return "a"
    else:
        return "c"


# Power at wheel
def calc_slope_power(slope, lower_bound=-0.01, upper_bound=0.075):
    powers = {"low": 8.6, "medium": 391.3, "high": 473}
    # Descending
    if slope < lower_bound:
        return powers["low"]
    # Flat, steady state
    elif slope >= lower_bound and slope <= upper_bound:
        return powers["medium"]
    # Climbing > threshold
    elif slope > upper_bound:
        return powers["high"]


def calc_power_at_wheel(slope, mech_eff=0.98, delta_watts=-20):
    # =Mech_eff*VLOOKUP(@Slope,'Input-Output'!$A$37:$C$42,3,TRUE)+delta_Watts
    return mech_eff * calc_slope_power(slope) + delta_watts


def calc_power_aero(relative_wind_speed, cda, density=1.13):
    return 0.5 * density * (relative_wind_speed**3) * cda


def calc_power_roll(mass_total, crr, speed):
    # =Mass_total*Crr*9.81*@Speed
    return mass_total * crr * 9.81 * speed


def calc_power_gravity(slope, mass_total, speed):
    # =@Slope*9.81*Mass_total*@Speed
    return slope * 9.81 * mass_total * speed


# Power net
def calc_power_net(power_in, power_aero, power_roll, power_gravity):
    # =@Power_in-@Power_aero-@Power_roll-@Power_gravity
    return power_in - power_aero - power_roll - power_gravity


# Propulsive force
def calc_propulsive_force(power_net, speed):
    # @Power_net/@Speed
    return power_net / speed


# Relative wind angle
def calc_relative_wind_angle(bearing_degrees, headwind=-150):
    return bearing_degrees - headwind


# Relative wind speed
def calc_relative_wind_speed(speed, wind_speed, relative_wind_angle):
    return math.sqrt(
        ((speed + wind_speed * math.cos(math.radians(relative_wind_angle))) ** 2)
        + (wind_speed * math.sin(math.radians(relative_wind_angle))) ** 2
    )


# Acceleration
def calc_acceleration(
    propulsive_force, total_mass, mol_wheel_front, mol_wheel_rear, wheel_radius
):
    return propulsive_force / (
        total_mass
        + (mol_wheel_front / wheel_radius**2)
        + (mol_wheel_rear / wheel_radius**2)
    )


# Absolute yaw
def calc_yaw_abs(yaw):
    return abs(yaw)


# Wind speed over 40 km/hr
def calc_speed_over_40kmhr(relative_wind_speed):
    return True if relative_wind_speed > (40.0 / 2.6) else False


# DCp
def calc_dcp(power_in_at_wheel, mech_eff=0.98, FTP=430):
    return (
        0
        if -((power_in_at_wheel * (1 / mech_eff)) - FTP) < 0
        else -((power_in_at_wheel * (1 / mech_eff)) - FTP)
    )


# OT Energy
def calc_ot_energy(power_in_at_wheel, mech_eff=0.98, dt=0.5, FTP=430):
    return (
        (power_in_at_wheel * (1 / mech_eff)) * dt
        if (power_in_at_wheel * (1 / mech_eff)) - FTP > 0
        else 0
    )


# W'
def calc_w_prime(dcp, ot_energy, t_prime, w_prime=35000, dt=0.5):
    return (
        (w_prime - ot_energy)
        if dcp == 0
        else (w_prime - (w_prime - w_prime) * math.exp(-dt / t_prime))
    )


# t'
def calc_t_prime(dcp, w_prime, w_recovery=1):
    t_prime = 0  # default return value in case of invalid dcp value
    if (
        w_recovery == 1 and dcp > 0
    ):  # Elite Athlete, t_prime will not be real if dcp < 0
        t_prime = 2287.2 * (dcp**-0.688)
    elif w_recovery == 2 and dcp != 0:  # Skiba 2, t_prime will be undefined if dcp == 0
        t_prime = w_prime / dcp
    elif w_recovery == 3:  # Skiba 1
        t_prime = 546 * math.e(-0.01 * dcp)
    return t_prime


def findNearest(ls, target):
    pos = bisect_left(ls, target)
    if pos == 0:
        return 0
    elif pos == len(ls):
        return len(ls) - 1

    before = ls[pos - 1]
    after = ls[pos]

    if after - target < target - before:
        return pos
    else:
        return pos - 1


def dictInterpolate(partialDict, val):
    if val >= max(partialDict):
        return partialDict[max(partialDict)]
    elif val <= min(partialDict):
        return partialDict[min(partialDict)]

    partialDict = sorted(list(partialDict.items()))
    i = 0
    while partialDict[i][0] <= val:
        i += 1

    stepsize = (partialDict[i][1] - partialDict[i - 1][1]) / (
        partialDict[i][0] - partialDict[i - 1][0]
    )

    return partialDict[i - 1][1] + abs(val - partialDict[i - 1][0]) * stepsize


def calc_cda(delta_cda, position, cda_dict, relative_wind_speed, yaw):
    yawRangesDict = {
        0: 0.192,
        5: 0.19,
        10: 0.178,
        15: 0.176,
        30: 0.17,
    }
    cda_adjust = {"a": 0, "b": 0.04, "c": -0.005}
    cda_dict = {k: cda_adjust[position] + v for k, v in cda_dict.items()}

    return (
        delta_cda
        + dictInterpolate(cda_dict, relative_wind_speed)
        + (dictInterpolate(yawRangesDict, abs(yaw)) - yawRangesDict[0])
    )


dt = 0.5
v0 = 0.3
d0 = 0.1
delta_watts = -20
delta_cda = 0
curTimeIso = "2022-09-29T15:16:33+0000"
total_race_dist = list(course["cumdist"])[-1]
climb_cda_increment = 0.04
descend_cda_increment = 0.005


df = []

# weather = Weather("ulw6ojd4nynXnA7Gbj72Edsp5ZHbli5p")
# weather.query(course['lat'][0], course['long'][0], curTimeIso, (parser.parse(curTimeIso) + datetime.timedelta(hours=3)).isoformat())
# currently using weather from spreadsheet
wind_speeds = pd.read_csv("wind_speeds.csv")

mass_total = (
    bikerider["rider"]["rider_mass_kg"]
    + bikerider["rider"]["other_mass_kg"]
    + bikerider["bike"]["bike_mass_kg"]
)
curdict = {
    "time": 0,
    "dist": d0,
    "speed": v0,
    "w_prime": bikerider["rider"]["anaerobic_work_capacity_j"],
}

# tstops calculating timeseries when race distance is exceeded
while curdict["dist"] < total_race_dist:

    curTimeIso = (parser.parse(curTimeIso) + datetime.timedelta(seconds=dt)).isoformat()
    curdict["km/hr"] = 3.6 * curdict["speed"]

    # finds row in course data with closest cumulative distance
    closest_course_row = dict(
        course.iloc[findNearest(course["cumdist"], curdict["dist"])]
    )

    curdict["slope"] = closest_course_row["slope"]
    curdict["bearing"] = closest_course_row["bear"]

    # calling wind data for given time from tomorrow.io
    # wind_data = weather.windAtTime(curTimeIso) <--- needs to be optimized with binary search when reimplemented
    # curdict['wind_speed'] = windData['windSpeed']
    # curdict['relative_wind_angle'] = calc_relative_wind_angle(curdict['bearing'], wind_data['windDirection'])

    # taking wind data from client spreadsheet; FOR TESTING - delete later
    curdict["relative_wind_angle"] = calc_relative_wind_angle(curdict["bearing"], -150)
    curdict["wind_speed"] = dict(
        wind_speeds.iloc[findNearest(wind_speeds["distance"], curdict["dist"])]
    )["Wind speed @ 1m"]
    curdict["relative_wind_speed"] = calc_relative_wind_speed(
        curdict["speed"], curdict["wind_speed"], curdict["relative_wind_angle"]
    )

    curdict["effective_yaw_angle"] = calc_effective_yaw_angle(
        curdict["wind_speed"], curdict["relative_wind_angle"], curdict["speed"]
    )
    curdict["position"] = calc_position(
        curdict["slope"], lower_bound=-0.01, upper_bound=0.03
    )

    # condition at start of race where rider must be in position B
    if curdict["dist"] <= course["dist"][1]:
        curdict["position"] = "b"

    curdict["power_at_wheel"] = calc_power_at_wheel(
        curdict["slope"], bikerider["bike"]["mechanical_efficiency"], delta_watts
    )
    curdict["cda"] = calc_cda(
        delta_cda,
        position=curdict["position"],
        cda_dict=bikerider["cda"]["a"],
        relative_wind_speed=curdict["relative_wind_speed"],
        yaw=curdict["effective_yaw_angle"],
    )
    curdict["power_aero"] = calc_power_aero(
        curdict["relative_wind_speed"], curdict["cda"]
    )
    curdict["power_roll"] = calc_power_roll(
        mass_total,
        bikerider["bike"]["rolling_resistance_coefficient"],
        curdict["speed"],
    )
    curdict["power_gravity"] = calc_power_gravity(
        curdict["slope"], mass_total, curdict["speed"]
    )
    curdict["power_net"] = calc_power_net(
        curdict["power_at_wheel"],
        curdict["power_aero"],
        curdict["power_roll"],
        curdict["power_gravity"],
    )
    curdict["propulsive_force"] = calc_propulsive_force(
        curdict["power_net"], curdict["speed"]
    )
    curdict["acceleration"] = calc_acceleration(
        curdict["propulsive_force"],
        mass_total,
        bikerider["bike"]["moment_of_intertia_front"],
        bikerider["bike"]["moment_of_intertia_rear"],
        bikerider["bike"]["wheel_radius"],
    )
    curdict["segment"] = closest_course_row["segment"]
    curdict["dcp"] = calc_dcp(
        curdict["power_at_wheel"],
        bikerider["bike"]["mechanical_efficiency"],
        bikerider["rider"]["functional_threshold_power_w"],
    )
    curdict["ot_energy"] = calc_ot_energy(
        curdict["power_at_wheel"],
        bikerider["bike"]["mechanical_efficiency"],
        dt,
        bikerider["rider"]["functional_threshold_power_w"],
    )
    curdict["t_prime"] = calc_t_prime(
        curdict["dcp"],
        curdict["w_prime"],
        bikerider["rider"]["anaerobic_recovery_function"],
    )
    curdict["w_prime"] = calc_w_prime(
        curdict["dcp"], curdict["ot_energy"], curdict["t_prime"], curdict["w_prime"], dt
    )

    df.append(copy.deepcopy(curdict))

    curdict["time"] += dt
    curdict["speed"] += curdict["acceleration"] * dt
    curdict["dist"] += curdict["speed"] * dt

pd.DataFrame(df).to_csv("RacePowerPlan.csv")
