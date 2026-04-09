export type Coord = {
  frame_id: number;
  x: number;
  y: number;
};

export type Corrected = {
  frame_id: number;
  old_x: number;
  old_y: number;
  new_x: number;
  new_y: number;
};

export type ApiVideoData = {
  success: boolean;
  video_id: number;
  video_url: string;
  coordinates: Coord[];
  frame_timestamps: number[];
};
