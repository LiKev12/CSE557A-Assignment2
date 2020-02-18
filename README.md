# CSE557A-Assignment2

The prototype can currently show the path for a given carId for an input time range.
This path is not currently scaled/adjusted to fit the kronos map properly

# Bugs
For some reason, SVG height is set to 6 randomly
The converted abila.json from the shape files projects really small onto the svg, so help scaling it up is needed

# FeaturesToAdd
Still need to compare multiple cars
Add color gradient to signify different day




# Data Processing
The GPS car data was the main point of focus for this assignment, allowing us to track movements of company cars and employees to various locations in the timeframe before the incident. To maintain consistency and ease downstream visualization processes, we did the following to process the given raw data:

    - Join GPS data with Employee-Car relation data to match CarID's with employee names
    - Convert time in format of mm/dd/yyyy hh:mm:ss to number of seconds after January 1, 2014 for purposes of visualizing events over continuous ranges of time
    - Use car GPS coordinates to outline a map contour that matches with the given map image of Abila, allowing us to assign longitude and latitude coordinates to various shops listed in the credit card and loyalty data files
    - Optimized the time efficiency of visualization by taking the average of 20s timepoints, since the given GPS data was actually unnecessarily detailed, and sufficient visualizations could be made from just a fraction of the given data



# Data Visualization
After processing the data, we used Tableau to generate a prototype visualization of the car movement data and brainstorm additional features we would expect to see in our final tool (in D3js). Tableau was especially useful for its quick response time and ease of use, but we wanted to implement some lower level features that were not compatible with Tableau. Therefore, for our final implementation, we used D3js.
