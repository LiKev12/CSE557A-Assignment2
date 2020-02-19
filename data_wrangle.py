import pandas as pd 
import numpy as np
import os
import pprint







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


def joinCarGPS():
    os.chdir("Postprocess_Data")
    gps = pd.read_csv("gps_data_byID_byTime.csv", encoding = 'latin-1')
    car = pd.read_csv("car_data.csv", encoding = 'latin-1')
    # print(gps)
    # res = gps.set_index('id').join(car.set_index('CarID'))
    res = gps.join(car.set_index('CarID'), on='id')
    # print(res)


    time_margin = 100




    allFrames = []
    for carID in range(1, 108):
        print(carID)
        infoByID = res.loc[res['id'] == carID]
        if (infoByID.empty == False):
            single_output = condenseTimePoints(infoByID, time_margin)
            allFrames.append(single_output)


    # infoByID = res.loc[res['id'] == 1]
    # single_output = condenseTimePoints(infoByID, time_margin)
    # print(single_output)

    # single_output.to_csv("res1.csv", index=False)
        
    output = pd.concat(allFrames)

    output.to_csv("res.csv", index=False)

def condenseTimePoints(df, time_margin):
    start_time = df['Timestamp'].iloc[0]
    end_time = df['Timestamp'].iloc[-1]
    # print(end_time)

    start_point = start_time

    listOfAvgs = []

    while start_point < end_time:
        end_point = start_point + time_margin
        time_segment = df.loc[(df['Timestamp'] >= start_point) & (df['Timestamp'] <= end_point)]


        if time_segment.empty == False:
            avg_time_segment = time_segment.iloc[0:1]
            # print(avg_time_segment)

            avg_time_segment['Timestamp'] = int(round(time_segment['Timestamp'].mean()))
            avg_time_segment['lat'] = time_segment['lat'].mean()
            avg_time_segment['long'] = time_segment['long'].mean()
            # print(time_segment)
            listOfAvgs.append(avg_time_segment)
            # print(avg_time_segment)


        start_point += time_margin + 1


    res = pd.concat(listOfAvgs)
    return res

    # print(start_time)




    # print("hi")


def joinCC_Car():
    os.chdir("Postprocess_Data")

    cc = pd.read_csv("cc_data.csv", encoding = 'latin-1')
    car = pd.read_csv("car_data.csv", encoding = 'latin-1')
    res = cc.join(car.set_index('Name'), on='Name')

    res["CarID"].fillna(0, inplace=True) # Unmatched ID is default 0
    res['CarID'] = res['CarID'].astype(int)

    res["CurrentEmploymentType"].fillna("Unknown", inplace=True) 
    res["CurrentEmploymentTitle"].fillna("Unknown", inplace=True) 

    

    print(res)

    res.to_csv("cc_car_data.csv", index=False)


def joinLoy_Car():
    os.chdir("Postprocess_Data")

    loy = pd.read_csv("loyalty_data.csv", encoding = 'latin-1')
    car = pd.read_csv("car_data.csv", encoding = 'latin-1')
    res = loy.join(car.set_index('Name'), on='Name')

    res["CarID"].fillna(0, inplace=True) # Unmatched ID is default 0
    res['CarID'] = res['CarID'].astype(int)

    res["CurrentEmploymentType"].fillna("Unknown", inplace=True) 
    res["CurrentEmploymentTitle"].fillna("Unknown", inplace=True) 

    

    print(res)

    res.to_csv("loyalty_car_data.csv", index=False)

    
def getAllShoppingSpots():

    os.chdir("Postprocess_Data")


    loy = pd.read_csv("loyalty_car_data.csv", encoding = 'latin-1')
    cc = pd.read_csv("cc_car_data.csv", encoding = 'latin-1')

    allShops = set()

    for index, row in loy.iterrows():
        allShops.add(row['Location'])
        # print(row['Location'])

    for index, row in cc.iterrows():
        allShops.add(row['Location'])


    pprint.pprint(allShops)




def getCoordinatesOfShops():
    coords = {
        'Abila Airport': (0,0),
        'Abila Scrapyard': (4.3,5.5),
        # 'Abila Zacharo': ,
        'Ahaggo Museum': (11.8,5.9),
        "Albert's Fine Clothing": (6.8,5.8),
        'Bean There Done That': (5.3,7.3),
        "Brew've Been Served": (17.4,1.3),
        # 'Brewed Awakenings': ,
        'Carlyle Chemical Inc.': (12.8,1.9),
        'Chostus Hotel': (15.5,4.5),
        'Coffee Cameleon': (14.7,1),
        'Coffee Shack': (7.3,5.2),
        # 'Daily Dealz': ,
        'Desafio Golf Course': (9,8.5),
        "Frank's Fuel": (2.5,5.2),
        "Frydos Autosupply n' More": (18,1.9),
        'Gelatogalore': (8,2.3),
        'General Grocer': (7,2.4),
        "Guy's Gyros": (16.5,1.5),
        'Hallowed Grounds': (12.3,3),
        # 'Hippokampos': ,
        "Jack's Magical Beans": (10.6,4),
        # 'Kalami Kafenion': ,
        'Kronos Mart': (4.9,3.7),
        # 'Kronos Pipe and Irrigation': ,
        'Maximum Iron and Steel': (2.5,3),
        # 'Nationwide Refinery': ,
        # "Octavio's Office Supplies": ,
        'Ouzeri Elian': (10.4,0.5),
        'Roberts and Sons': (5.5,3),
        # "Shoppers' Delight": ,
        # 'Stewart and Sons Fabrication': ,
        'U-Pump': (9.5,4)
    }
    # print(coords)

    realCoords = {}
    for key, value in coords.items():
        realCoords[key] = (round(24.827+coords[key][0]*0.00429,4), round(36.0505 + coords[key][1] * 0.0043,4))
        # coords[key][0] = 24.827+coords[key][0]*0.00429
        # coords[key][1] = 36.0505 + coords[key][1] * 0.0043
    pprint.pprint(realCoords)

    return realCoords

def addCoordsToPayments():
    os.chdir("Postprocess_Data")
    cc = pd.read_csv("cc_car_data.csv", encoding = 'latin-1')
    loy = pd.read_csv("loyalty_car_data.csv", encoding = 'latin-1')


    # Credit Data
    cc['Longitude'] = 24.892
    cc['Latitude'] = 36.089
    coords = getCoordinatesOfShops()
    for index, row in cc.iterrows():
        key = cc.iloc[index]['Location']
        # print(key)
        if key in coords:
            # df.at['C', 'x'] = 10
            # cc['Longitude'] = coords[key][0]
            # cc['Latitude'] = coords[key][1]
            cc.at[index, 'Longitude'] = coords[key][0]
            cc.at[index, 'Latitude'] = coords[key][1]

    # Loyalty data
    loy['Longitude'] = 24.892  #default
    cc['Latitude'] = 36.089 # default
    for index, row in loy.iterrows():
        key = loy.iloc[index]['Location']
        if key in coords:
            loy.at[index, 'Longitude'] = coords[key][0]
            loy.at[index, 'Latitude'] = coords[key][1]

    cc['Payment_Method'] = 'Credit'
    loy['Payment_Method'] = 'Loyalty'

    frames = [cc, loy]

    res = pd.concat(frames)
    res = res.sort_values('Timestamp')
    print(res)

    res.to_csv("payment_data.csv", index=False)



    # cc.to_csv("cc_coords.csv", index=False)

    # FIX LATER
    # print(cc)



# format_data_car_assignments()
# format_data_cc_data()
# format_data_gps()
# format_loyalty_data()

joinCarGPS()
# joinCC_Car()
# joinLoy_Car()


# getAllShoppingSpots()
# getCoordinatesOfShops()

# addCoordsToPayments()