import cv2
import numpy as np


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


ANALYSIS_RESOLUTION = (160, 90)


def compute_dynamic_timestamps(
    video_path,
    duration,
    analysis_step=0.5,
    fine_interval=0.5,
    coarse_interval=2.0,
):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    #collect motion scores at every analysis_step
    scores = []
    prev_gray = None
    t = 0.0

    while t < duration:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, frame = cap.read()
        if not ok or frame is None:
            t += analysis_step
            continue

        small = cv2.resize(frame, ANALYSIS_RESOLUTION)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray)
            score = float(np.mean(diff))
        else:
            score = 0.0

        scores.append((t, score))
        prev_gray = gray
        t += analysis_step

    cap.release()

    if not scores:
        return []

    #compute threshold
    all_scores = [s for _, s in scores]
    threshold = float(np.mean(all_scores))

    #select timestamps
    timestamps = [0.0]
    last_added = 0.0

    for t, score in scores[1:]:
        if score >= threshold:
            if t - last_added >= fine_interval - 0.001:
                timestamps.append(t)
                last_added = t
        else:
            if t - last_added >= coarse_interval - 0.001:
                timestamps.append(t)
                last_added = t

    return timestamps

