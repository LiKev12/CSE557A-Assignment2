import pandas as pd 
import numpy as np
import os







def format_data_car_assignments():
    os.chdir("Data")
    before = pd.read_csv("car-assignments.csv")

    before["CarID"].fillna(0, inplace=True) # Unmatched ID is default 0

    before["Name"] = before["LastName"] + "_" + before["FirstName"]
    before["CarID"] = pd.to_numeric(before["CarID"])
    before["CarID"] = before["CarID"].astype(int)
    before = before.drop(before.columns[[0,1]], axis = 1)
    currentEmploymentType = before['CurrentEmploymentType']
    currentEmploymentTitle = before['CurrentEmploymentTitle']
    before = before.drop(before.columns[[1,2]], axis=1)
    before['CurrentEmploymentType'] = currentEmploymentType
    before['CurrentEmploymentTitle'] = currentEmploymentTitle
    print(before)


    before.to_csv("car_assignments.csv", index = False)

def format_data_cc_data():
    os.chdir("Data")
    before = pd.read_csv("cc_data.csv", encoding = 'latin-1')

    before["Name"] = before["LastName"] + "_" + before["FirstName"]
    location = before['location']
    price = before['price']
    before = before.drop(before.columns[[1,2,3,4]], axis=1)
    before['location'] = location
    before['price'] = price


    f = lambda x: x["timestamp"].split(" ")[0].split("/")[1]
    before["days"] = before.apply(f, axis=1)

    f = lambda x: x["timestamp"].split(" ")[1].split(":")[0]
    before["hours"] = before.apply(f, axis=1)

    f = lambda x: x["timestamp"].split(" ")[1].split(":")[1]
    before["minutes"] = before.apply(f, axis=1)


    # Convert to number of seconds after 01/01/2014
    before["timecode"] = 24 * 60 * 60 * (before["days"].astype(int) - 1) + 60 * 60 * before["hours"].astype(int) + 60 * before["minutes"].astype(int)
    before["Timestamp"] = before["timecode"]
    before = before.drop(before.columns[[4,5,6,7]],axis=1)

    # Sanity Check
    # before["timedays"] = (before["timecode"].astype(int)/(24*60*60)).astype(int) + 1
    # before["timehrs"] = ((before["timecode"].astype(int) - (before["timedays"].astype(int)-1) * 24*60*60)/(60*60)).astype(int)
    # before["timemins"] = ((before["timecode"].astype(int) - (before["timedays"].astype(int)-1) * 24*60*60 - before["timehrs"].astype(int) * 60*60)/60).astype(int)

    print(before)

    before.to_csv("cc.csv", index = False)


def format_data_gps():
    os.chdir("Data")
    before = pd.read_csv("gps.csv", encoding = 'latin-1')

    f = lambda x: x["Timestamp"].split(" ")[0].split("/")[1]
    before["days"] = before.apply(f, axis=1)

    f = lambda x: x["Timestamp"].split(" ")[1].split(":")[0]
    before["hours"] = before.apply(f, axis=1)

    f = lambda x: x["Timestamp"].split(" ")[1].split(":")[1]
    before["minutes"] = before.apply(f, axis=1)

    f = lambda x: x["Timestamp"].split(" ")[1].split(":")[2]
    before["seconds"] = before.apply(f, axis=1)



    # Convert to number of seconds after 01/01/2014
    before["timecode"] = 24 * 60 * 60 * (before["days"].astype(int) - 1) + 60 * 60 * before["hours"].astype(int) + 60 * before["minutes"].astype(int) + before["seconds"].astype(int)
    before["Timestamp"] = before["timecode"]
    before = before.drop(before.columns[[4,5,6,7,8]],axis=1)

    # Sanity Check
    # before["timedays"] = (before["timecode"].astype(int)/(24*60*60)).astype(int) + 1
    # before["timehrs"] = ((before["timecode"].astype(int) - (before["timedays"].astype(int)-1) * 24*60*60)/(60*60)).astype(int)
    # before["timemins"] = ((before["timecode"].astype(int) - (before["timedays"].astype(int)-1) * 24*60*60 - before["timehrs"].astype(int) * 60*60)/60).astype(int)
    # before["timesec"] = ((before["timecode"].astype(int) - (before["timedays"].astype(int)-1) * 24*60*60 - before["timehrs"].astype(int) * 60*60 - before["timemins"].astype(int) * 60)).astype(int)


    before.sort_values(['id', 'Timestamp'], ascending=[True, True], inplace=True)
    print(before)


    before.to_csv("gps_data.csv", index = False)

def format_loyalty_data():
    os.chdir("Data")
    before = pd.read_csv("loyalty_data.csv", encoding = 'latin-1')

    before["Name"] = before["LastName"] + "_" + before["FirstName"]



    f = lambda x: x["timestamp"].split("/")[1]
    before["days"] = before.apply(f, axis=1)

    # Convert to number of seconds after 01/01/2014
    before["timecode"] = 24 * 60 * 60 * (before["days"].astype(int) - 1) + 12 * 60 * 60 # default 12pm (noon)
    before["timestamp"] = before["timecode"]

    location = before['location']
    price = before['price']

    before = before.drop(before.columns[[1,2,3,4,6,7]],axis=1)
    before['location'] = location
    before['price'] = price

    print(before)


    before.to_csv("loyalty.csv", index = False)

# format_data_car_assignments()
# format_data_cc_data()
format_data_gps()
# format_loyalty_data()
