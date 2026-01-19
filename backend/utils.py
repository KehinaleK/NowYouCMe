
def parse_coordinates(file):

    all_coordinates = []

    print("I m here")
    for line in file:
        line = line.decode('utf-8').strip()
        if not line:
            continue

        line = line.strip('[').strip(']').replace("'", "")
        line = line.split(",")
        if len(line) == 4:
            frame_id = int(line[0].strip())
            x = float(line[1].strip())
            y = float(line[2].strip())

            all_coordinates.append({'frame_id' : frame_id, 'x' : x, 'y' : y})

    print(all_coordinates)
    return all_coordinates

