
def parse_coordinates(file):

    allCoordinates = []
    frame_id = 0

    for line in file:
        line = line.decode('utf-8').strip()
        if not line:
            continue

        line = line.strip('[').strip(']').replace("'", "")
        line = line.split(",")
        if len(line) == 4:
            x = float(line[1].strip())
            y = float(line[2].strip())

            allCoordinates.append({'frame_id' : frame_id, 'x' : x, 'y' : y})
            frame_id += 1 

    allCoordinates = sorted(allCoordinates, key=lambda x: x['frame_id'])
    
    return allCoordinates

